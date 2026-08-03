import { cache } from "react"

import { createClient } from "@/lib/supabase/server"
import type { Profile, Show, ShowWithRelations } from "@/types/database"

export const PROFILE_PAGE_SIZE = 20

export type StatShow = Pick<
  Show,
  | "id"
  | "artist_name"
  | "artist_mbid"
  | "venue_name"
  | "venue_city"
  | "venue_state"
  | "venue_country"
  | "venue_lat"
  | "venue_lng"
  | "show_date"
>

export type FriendProfile = Pick<Profile, "id" | "username" | "display_name">

/**
 * Every fetcher here is wrapped in React's `cache()`.
 *
 * The page streams its sections in separate Suspense boundaries, and more than
 * one of them needs the same rows — the stats grid and the Artists tab both
 * read the lightweight show list. Without memoization, splitting the page into
 * boundaries would silently double the query count.
 */

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getProfileByUsername = cache(async (username: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()
  return data as Profile | null
})

/** Lightweight: every show, scalar columns only. Feeds stats, artists and the map. */
export const getStatShows = cache(
  async (profileId: string, includePrivate: boolean) => {
    const supabase = await createClient()
    let query = supabase
      .from("shows")
      .select(
        "id, artist_name, artist_mbid, venue_name, venue_city, venue_state, venue_country, venue_lat, venue_lng, show_date"
      )
      .eq("user_id", profileId)
    if (!includePrivate) query = query.eq("is_public", true)
    const { data } = await query
    return (data as StatShow[] | null) ?? []
  }
)

export const getTopShows = cache(
  async (profileId: string, includePrivate: boolean) => {
    const supabase = await createClient()
    let query = supabase
      .from("shows")
      .select("*, setlist_songs(*), show_photos(*)")
      .eq("user_id", profileId)
      .not("overall_rating", "is", null)
      .order("overall_rating", { ascending: false })
      .limit(10)
    if (!includePrivate) query = query.eq("is_public", true)
    const { data } = await query
    return (data as ShowWithRelations[] | null) ?? []
  }
)

export const getFirstPageShows = cache(
  async (profileId: string, includePrivate: boolean) => {
    const supabase = await createClient()
    let query = supabase
      .from("shows")
      .select("*, setlist_songs(*), show_photos(*)")
      .eq("user_id", profileId)
      .order("show_date", { ascending: false })
      .range(0, PROFILE_PAGE_SIZE) // one extra row to detect hasMore
    if (!includePrivate) query = query.eq("is_public", true)
    const { data } = await query
    const all = (data as ShowWithRelations[] | null) ?? []
    return {
      shows: all.slice(0, PROFILE_PAGE_SIZE),
      hasMore: all.length > PROFILE_PAGE_SIZE,
    }
  }
)

export const getFollowLists = cache(async (profileId: string) => {
  const supabase = await createClient()
  type Relation = { profiles: FriendProfile | null }

  const [{ data: rawFollowing }, { data: rawFollowers }] = await Promise.all([
    supabase
      .from("follows")
      .select("profiles!following_id(id, username, display_name)")
      .eq("follower_id", profileId),
    supabase
      .from("follows")
      .select("profiles!follower_id(id, username, display_name)")
      .eq("following_id", profileId),
  ])

  const unwrap = (rows: Relation[] | null) =>
    (rows ?? [])
      .map((r) => r.profiles)
      .filter((p): p is FriendProfile => p !== null)

  return {
    following: unwrap(rawFollowing as Relation[] | null),
    followers: unwrap(rawFollowers as Relation[] | null),
  }
})

export const getIsFollowing = cache(
  async (currentUserId: string, profileId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", currentUserId)
      .eq("following_id", profileId)
      .single()
    return !!data
  }
)
