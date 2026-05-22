"use client"

import { useState, useTransition } from "react"
import { ShowCard } from "@/components/shows/show-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { loadMoreFeedShows } from "@/app/actions"
import { ShowWithSongs } from "@/types/database"

interface FeedListProps {
  initialShows: ShowWithSongs[]
  initialHasMore: boolean
}

export function FeedList({ initialShows, initialHasMore }: FeedListProps) {
  const [shows, setShows] = useState(initialShows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isPending, startTransition] = useTransition()

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreFeedShows(shows.length)
      setShows((prev) => [...prev, ...result.shows])
      setHasMore(result.hasMore)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={handleLoadMore} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
