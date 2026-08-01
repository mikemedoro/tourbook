"use client"

import { useState, useTransition } from "react"
import { ShowList } from "@/components/profile/show-list"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { loadMoreProfileShows } from "@/app/actions"
import { ShowWithRelations } from "@/types/database"

interface PaginatedShowListProps {
  initialShows: ShowWithRelations[]
  initialHasMore: boolean
  profileId: string
  emptyMessage?: string
  emptyDescription?: string
  isOwner?: boolean
}

export function PaginatedShowList({
  initialShows,
  initialHasMore,
  profileId,
  emptyMessage,
  emptyDescription,
  isOwner = false,
}: PaginatedShowListProps) {
  const [shows, setShows] = useState(initialShows)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isPending, startTransition] = useTransition()

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreProfileShows(shows.length, profileId)
      setShows((prev) => [...prev, ...result.shows])
      setHasMore(result.hasMore)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <ShowList
        shows={shows}
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
        isOwner={isOwner}
      />

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={handleLoadMore} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
