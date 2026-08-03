import { Skeleton } from "@/components/ui/skeleton"
import { Ticket, TicketBody, TicketTear, TicketStub } from "@/components/ui/ticket"

/**
 * Fallbacks for the streamed sections of the profile.
 *
 * Each mirrors the real component's box model so the page does not jump when
 * the data lands. That is the whole reason these exist instead of one spinner.
 */

export function StatsSkeleton() {
  return (
    <Ticket perforated={false}>
      <TicketBody className="p-0">
        <div className="grid grid-cols-2 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={[
                "flex flex-col items-center gap-2 px-4 py-8",
                i % 2 === 1 ? "border-l" : "",
                i > 1 ? "border-t" : "",
                "sm:border-t-0 sm:not-first:border-l",
                i === 4 ? "max-sm:col-span-2 max-sm:border-l-0" : "",
              ].join(" ")}
            >
              <Skeleton className="h-9 w-12 sm:h-11" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          ))}
        </div>
      </TicketBody>
    </Ticket>
  )
}

export function FriendsSkeleton() {
  return <Skeleton className="h-3 w-48" />
}

/** Matches the dense archive rows in ShowList. */
export function ShowListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Ticket perforated={false}>
      <TicketBody className="gap-0 p-0">
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-5">
              <Skeleton className="mt-0.5 h-3 w-5 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
              <Skeleton className="h-3.5 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </TicketBody>
    </Ticket>
  )
}

/** Matches a feed ShowCard, perforation included. */
export function ShowCardSkeleton() {
  return (
    <Ticket>
      <TicketBody>
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-3/4 sm:h-8" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-3.5 w-1/2" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-1 w-full" />
            </div>
          ))}
        </div>
      </TicketBody>
      <TicketTear />
      <TicketStub>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-20" />
      </TicketStub>
    </Ticket>
  )
}

export function FeedSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {Array.from({ length: cards }).map((_, i) => (
        <ShowCardSkeleton key={i} />
      ))}
    </div>
  )
}
