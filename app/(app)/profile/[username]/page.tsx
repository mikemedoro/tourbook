import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ShowList } from "@/components/profile/show-list"
import { PaginatedShowList } from "@/components/profile/paginated-show-list"
import { FriendsDialog } from "@/components/profile/friends-dialog"
import { VenueMap } from "@/components/map/venue-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Profile, Show, SetlistSong, ShowPhoto } from "@/types/database"

type ShowFull = Show & { setlist_songs: SetlistSong[]; show_photos: ShowPhoto[] }
type StatShow = Pick<Show, "id" | "artist_name" | "venue_name" | "venue_city" | "venue_state" | "venue_country" | "venue_lat" | "venue_lng" | "show_date">

const PAGE_SIZE = 20

interface Props {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  const profile = rawProfile as Profile | null
  if (!profile) notFound()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const isOwner = currentUser?.id === profile.id

  // Guard private profiles
  if (!profile.is_public && !isOwner) notFound()

  // Run 3 queries in parallel:
  // 1. Minimal fields for stats + venue markers (all shows, lightweight)
  // 2. Top 10 rated shows with full data for the Top shows tab
  // 3. First page of all shows with full data for the All shows tab
  let statsQuery = supabase
    .from("shows")
    .select("id, artist_name, venue_name, venue_city, venue_state, venue_country, venue_lat, venue_lng, show_date")
    .eq("user_id", profile.id)

  let topQuery = supabase
    .from("shows")
    .select("*, setlist_songs(*), show_photos(*)")
    .eq("user_id", profile.id)
    .not("overall_rating", "is", null)
    .order("overall_rating", { ascending: false })
    .limit(10)

  let firstPageQuery = supabase
    .from("shows")
    .select("*, setlist_songs(*), show_photos(*)")
    .eq("user_id", profile.id)
    .order("show_date", { ascending: false })
    .range(0, PAGE_SIZE) // fetch PAGE_SIZE + 1 to detect hasMore

  if (!isOwner) {
    statsQuery = statsQuery.eq("is_public", true)
    topQuery = topQuery.eq("is_public", true)
    firstPageQuery = firstPageQuery.eq("is_public", true)
  }

  const [{ data: rawStats }, { data: rawTop }, { data: rawFirstPage }, followResult, { data: rawFollowing }, { data: rawFollowers }] =
    await Promise.all([
      statsQuery,
      topQuery,
      firstPageQuery,
      currentUser && !isOwner
        ? supabase
            .from("follows")
            .select("follower_id")
            .eq("follower_id", currentUser.id)
            .eq("following_id", profile.id)
            .single()
        : Promise.resolve({ data: null }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("follows")
        .select("profiles!following_id(id, username, display_name, avatar_url)")
        .eq("follower_id", profile.id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("follows")
        .select("profiles!follower_id(id, username, display_name, avatar_url)")
        .eq("following_id", profile.id),
    ])

  const statsShows = (rawStats as StatShow[] | null) ?? []
  const topShows = (rawTop as ShowFull[] | null) ?? []
  const allFirstPage = (rawFirstPage as ShowFull[] | null) ?? []
  const firstPageShows = allFirstPage.slice(0, PAGE_SIZE)
  const hasMoreShows = allFirstPage.length > PAGE_SIZE
  const isFollowing = !!(followResult as { data: unknown }).data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const following = ((rawFollowing as any[]) ?? []).map((f: any) => f.profiles).filter(Boolean)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const followers = ((rawFollowers as any[]) ?? []).map((f: any) => f.profiles).filter(Boolean)

  // Aggregate stats from lightweight query
  const totalShows = statsShows.length
  const uniqueArtists = new Set(statsShows.map((s) => s.artist_name)).size
  const uniqueVenues = new Set(statsShows.map((s) => s.venue_name)).size
  const currentYear = new Date().getFullYear()
  const showsThisYear = statsShows.filter(
    (s) => new Date(s.show_date).getFullYear() === currentYear
  ).length

  // Venue markers from lightweight query
  const venueMarkers = statsShows
    .filter((s) => s.venue_name && s.venue_city)
    .map((s) => ({
      id: s.id,
      lat: s.venue_lat ?? 0,
      lng: s.venue_lng ?? 0,
      label: s.venue_name,
      city: s.venue_city,
      state: s.venue_state ?? null,
      country: s.venue_country ?? null,
    }))

  return (
    <div className="flex flex-col gap-8">
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        isFollowing={isFollowing}
        currentUserId={currentUser?.id}
      />

      <FriendsDialog following={following} followers={followers} />

      <ProfileStats
        totalShows={totalShows}
        uniqueArtists={uniqueArtists}
        uniqueVenues={uniqueVenues}
        showsThisYear={showsThisYear}
      />

      <Tabs defaultValue="shows">
        <TabsList>
          <TabsTrigger value="shows">All shows</TabsTrigger>
          <TabsTrigger value="top">Top shows</TabsTrigger>
          {process.env.NEXT_PUBLIC_SHOW_MAP === "true" && (
            <TabsTrigger value="map">Map</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="shows" className="mt-4">
          <PaginatedShowList
            initialShows={firstPageShows}
            initialHasMore={hasMoreShows}
            profileId={profile.id}
            emptyMessage="No shows logged yet."
            isOwner={isOwner}
          />
        </TabsContent>

        <TabsContent value="top" className="mt-4">
          <ShowList shows={topShows} emptyMessage="Rate some shows to see your top picks." isOwner={isOwner} />
        </TabsContent>

        {process.env.NEXT_PUBLIC_SHOW_MAP === "true" && (
          <TabsContent value="map" className="mt-4">
            <VenueMap markers={venueMarkers} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
