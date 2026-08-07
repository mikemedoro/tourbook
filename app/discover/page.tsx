import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { FeedList } from "@/components/shows/feed-list"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { FeedSkeleton } from "@/components/profile/profile-skeletons"
import { buttonVariants } from "@/components/ui/button"
import { loadMoreDiscoverShows } from "@/app/actions"
import Link from "next/link"
import { ShowWithSongs } from "@/types/database"

const PAGE_SIZE = 20

async function DiscoverFeed() {
  const supabase = await createClient()

  const { data: rawShows } = await supabase
    .from("shows")
    .select("*, setlist_songs(*), show_photos(*), profiles(username, display_name)")
    .eq("is_public", true)
    .order("show_date", { ascending: false })
    .range(0, PAGE_SIZE)

  const allFetched = (rawShows as ShowWithSongs[] | null) ?? []

  if (allFetched.length === 0) {
    return (
      <EmptyState
        title="No shows logged yet"
        description="Be the first to log a show."
        action={
          <Link href="/register" className={buttonVariants()}>
            Sign up free
          </Link>
        }
      />
    )
  }

  return (
    <FeedList
      initialShows={allFetched.slice(0, PAGE_SIZE)}
      initialHasMore={allFetched.length > PAGE_SIZE}
      loadMore={loadMoreDiscoverShows}
    />
  )
}

export default function DiscoverPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Recent shows"
        description="What people have been to, most recent first."
        action={
          <Link href="/register" className={buttonVariants()}>
            Sign up free
          </Link>
        }
      />

      <Suspense fallback={<FeedSkeleton />}>
        <DiscoverFeed />
      </Suspense>
    </div>
  )
}
