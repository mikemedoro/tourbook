import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedList } from "@/components/shows/feed-list"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { FeedSkeleton } from "@/components/profile/profile-skeletons"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { ShowWithSongs } from "@/types/database"

const PAGE_SIZE = 20

/**
 * The shows query joins setlist songs and photos across everyone you follow, so
 * it is the slowest thing on the page. Streaming it lets the header and the
 * "Log a show" action paint immediately instead of waiting on the join.
 */
async function Feed({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)

  const followingIds =
    (follows as Array<{ following_id: string }> | null)?.map(
      (f) => f.following_id
    ) ?? []

  const { data: rawShows } = await supabase
    .from("shows")
    .select(
      `
      *,
      setlist_songs(*),
      show_photos(*),
      profiles(username, display_name)
    `
    )
    .in("user_id", [userId, ...followingIds])
    .eq("is_public", true)
    .order("show_date", { ascending: false })
    .range(0, PAGE_SIZE) // one extra row to detect hasMore

  const allFetched = (rawShows as ShowWithSongs[] | null) ?? []

  if (allFetched.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        description="Follow a few friends, or log the last show you went to."
        action={
          <>
            <Link href="/log-show" className={buttonVariants()}>
              Log a show
            </Link>
            <Link href="/find" className={buttonVariants({ variant: "outline" })}>
              Find people
            </Link>
          </>
        }
      />
    )
  }

  return (
    <FeedList
      initialShows={allFetched.slice(0, PAGE_SIZE)}
      initialHasMore={allFetched.length > PAGE_SIZE}
    />
  )
}

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Feed"
        action={
          <Link href="/log-show" className={buttonVariants()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Log a show
          </Link>
        }
      />

      <Suspense fallback={<FeedSkeleton />}>
        <Feed userId={user.id} />
      </Suspense>
    </div>
  )
}
