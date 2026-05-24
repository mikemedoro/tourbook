"use server"

import { createClient } from "@/lib/supabase/server"
import { ShowWithRelations, ShowWithSongs } from "@/types/database"

const PAGE_SIZE = 20

export async function markNotificationsRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)
}

export async function loadMoreFeedShows(
  offset: number
): Promise<{ shows: ShowWithSongs[]; hasMore: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { shows: [], hasMore: false }

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)

  const followingIds =
    (follows as Array<{ following_id: string }> | null)?.map((f) => f.following_id) ?? []
  const feedUserIds = [user.id, ...followingIds]

  const { data } = await supabase
    .from("shows")
    .select("*, setlist_songs(*), show_photos(*), profiles(username, avatar_url)")
    .in("user_id", feedUserIds)
    .eq("is_public", true)
    .order("show_date", { ascending: false })
    .range(offset, offset + PAGE_SIZE) // fetch one extra to detect hasMore

  const shows = (data as ShowWithSongs[] | null) ?? []
  return {
    shows: shows.slice(0, PAGE_SIZE) as ShowWithSongs[],
    hasMore: shows.length > PAGE_SIZE,
  }
}

export async function loadMoreProfileShows(
  offset: number,
  profileId: string
): Promise<{ shows: ShowWithRelations[]; hasMore: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Determine owner server-side — never trust the client for this
  const isOwner = user?.id === profileId

  const query = supabase
    .from("shows")
    .select("*, setlist_songs(*), show_photos(*)")
    .eq("user_id", profileId)
    .order("show_date", { ascending: false })
    .range(offset, offset + PAGE_SIZE)

  if (!isOwner) query.eq("is_public", true)

  const { data } = await query
  const shows = (data as ShowWithRelations[] | null) ?? []
  return {
    shows: shows.slice(0, PAGE_SIZE),
    hasMore: shows.length > PAGE_SIZE,
  }
}
