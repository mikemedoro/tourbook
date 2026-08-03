import { Suspense } from "react"
import { notFound } from "next/navigation"

import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ShowList } from "@/components/profile/show-list"
import { ArtistTally } from "@/components/profile/artist-tally"
import { PaginatedShowList } from "@/components/profile/paginated-show-list"
import { FriendsDialog } from "@/components/profile/friends-dialog"
import {
  StatsSkeleton,
  FriendsSkeleton,
  ShowListSkeleton,
} from "@/components/profile/profile-skeletons"
import { VenueMap } from "@/components/map/venue-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tallyArtists } from "@/lib/artist-tally"
import {
  getCurrentUser,
  getFirstPageShows,
  getFollowLists,
  getIsFollowing,
  getProfileByUsername,
  getStatShows,
  getTopShows,
} from "@/lib/queries/profile"

const SHOW_MAP = process.env.NEXT_PUBLIC_SHOW_MAP === "true"

interface Props {
  params: Promise<{ username: string }>
}

/* ---------------------------------------------------------------------------
 * Streamed sections. Each awaits only what it renders, so a slow show query
 * cannot hold up the stats, and neither holds up the header.
 * ------------------------------------------------------------------------- */

async function FriendsSection({ profileId }: { profileId: string }) {
  const { following, followers } = await getFollowLists(profileId)
  return <FriendsDialog following={following} followers={followers} />
}

async function StatsSection({
  profileId,
  isOwner,
}: {
  profileId: string
  isOwner: boolean
}) {
  const shows = await getStatShows(profileId, isOwner)
  const currentYear = new Date().getFullYear()

  return (
    <ProfileStats
      totalShows={shows.length}
      uniqueCities={new Set(shows.map((s) => s.venue_city).filter(Boolean)).size}
      uniqueVenues={new Set(shows.map((s) => s.venue_name)).size}
      showsThisYear={
        shows.filter((s) => new Date(s.show_date).getFullYear() === currentYear)
          .length
      }
      uniqueArtists={tallyArtists(shows).length}
    />
  )
}

async function ArchiveSection({
  profileId,
  isOwner,
}: {
  profileId: string
  isOwner: boolean
}) {
  // getStatShows is memoized, so sharing it with StatsSection costs one query
  const [statShows, topShows, firstPage] = await Promise.all([
    getStatShows(profileId, isOwner),
    getTopShows(profileId, isOwner),
    getFirstPageShows(profileId, isOwner),
  ])

  const artists = tallyArtists(statShows)
  const venueMarkers = statShows
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
    <Tabs defaultValue="shows">
      <TabsList>
        <TabsTrigger value="shows">All shows</TabsTrigger>
        <TabsTrigger value="top">Top shows</TabsTrigger>
        <TabsTrigger value="artists">Artists</TabsTrigger>
        {SHOW_MAP && <TabsTrigger value="map">Map</TabsTrigger>}
      </TabsList>

      <TabsContent value="shows" className="mt-6">
        <PaginatedShowList
          initialShows={firstPage.shows}
          initialHasMore={firstPage.hasMore}
          profileId={profileId}
          emptyMessage="No shows yet"
          emptyDescription="Shows logged here will appear in this archive."
          isOwner={isOwner}
        />
      </TabsContent>

      <TabsContent value="top" className="mt-6">
        <ShowList
          shows={topShows}
          emptyMessage="Nothing rated yet"
          emptyDescription="Give a show an overall rating and it will show up here."
          isOwner={isOwner}
        />
      </TabsContent>

      <TabsContent value="artists" className="mt-6">
        <ArtistTally
          artists={artists}
          emptyMessage={isOwner ? "No artists yet" : "Nothing to show"}
        />
      </TabsContent>

      {SHOW_MAP && (
        <TabsContent value="map" className="mt-6">
          <VenueMap markers={venueMarkers} />
        </TabsContent>
      )}
    </Tabs>
  )
}

/* ------------------------------------------------------------------------- */

export default async function ProfilePage({ params }: Props) {
  const { username } = await params

  // Only what the header needs is awaited up front: one row by username and the
  // session. Everything heavier streams in behind a Suspense boundary.
  const [profile, currentUser] = await Promise.all([
    getProfileByUsername(username),
    getCurrentUser(),
  ])

  if (!profile) notFound()

  const isOwner = currentUser?.id === profile.id
  if (!profile.is_public && !isOwner) notFound()

  const isFollowing =
    currentUser && !isOwner
      ? await getIsFollowing(currentUser.id, profile.id)
      : false

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        isFollowing={isFollowing}
        currentUserId={currentUser?.id}
      />

      <Suspense fallback={<FriendsSkeleton />}>
        <FriendsSection profileId={profile.id} />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection profileId={profile.id} isOwner={isOwner} />
      </Suspense>

      <Suspense fallback={<ShowListSkeleton />}>
        <ArchiveSection profileId={profile.id} isOwner={isOwner} />
      </Suspense>
    </div>
  )
}
