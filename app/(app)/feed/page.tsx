import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedList } from "@/components/shows/feed-list"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { ShowWithSongs } from "@/types/database"

const PAGE_SIZE = 20

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Get list of users this person follows
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)

  const followingIds = (follows as Array<{ following_id: string }> | null)?.map(
    (f) => f.following_id
  ) ?? []
  const feedUserIds = [user.id, ...followingIds]

  // Fetch first page + one extra to detect hasMore
  const { data: rawShows } = await supabase
    .from("shows")
    .select(
      `
      *,
      setlist_songs(*),
      show_photos(*),
      profiles(username, avatar_url)
    `
    )
    .in("user_id", feedUserIds)
    .eq("is_public", true)
    .order("show_date", { ascending: false })
    .range(0, PAGE_SIZE) // PAGE_SIZE + 1 to detect hasMore

  const allFetched = (rawShows as ShowWithSongs[] | null) ?? []
  const shows = allFetched.slice(0, PAGE_SIZE)
  const hasMore = allFetched.length > PAGE_SIZE

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Link href="/log-show" className={buttonVariants()}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Log a show
        </Link>
      </div>

      {shows.length > 0 ? (
        <FeedList initialShows={shows} initialHasMore={hasMore} />
      ) : (
        <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-3">
          <p>No shows in your feed yet.</p>
          <p className="text-sm">Follow some friends or log your first show.</p>
          <div className="flex gap-3 mt-1">
            <Link href="/find" className={buttonVariants({ variant: "outline" })}>Find people</Link>
            <Link href="/log-show" className={buttonVariants()}>Log a show</Link>
          </div>
        </div>
      )}
    </div>
  )
}
