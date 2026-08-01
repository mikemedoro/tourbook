import { Pencil } from "lucide-react"
import Link from "next/link"
import { StarRating } from "@/components/shows/star-rating"
import { Ticket, TicketBody } from "@/components/ui/ticket"
import { ShowWithRelations } from "@/types/database"

interface ShowListProps {
  shows: ShowWithRelations[]
  emptyMessage?: string
  isOwner?: boolean
}

/**
 * The dense archive view. Deliberately not a stack of tickets — the feed is for
 * reading one show at a time, this is for scanning a history. It shares the
 * feed's type system (display caps for the artist, mono for metadata) so the
 * two read as the same app at different densities.
 */
export function ShowList({
  shows,
  emptyMessage = "No shows yet.",
  isOwner = false,
}: ShowListProps) {
  if (shows.length === 0) {
    return (
      <Ticket perforated={false}>
        <TicketBody className="items-center py-12">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </TicketBody>
      </Ticket>
    )
  }

  return (
    <Ticket perforated={false}>
      <TicketBody className="gap-0 p-0">
        <ol className="divide-y">
          {shows.map((show, i) => {
            const displayDate = new Date(show.show_date + "T12:00:00")

            return (
              <li key={show.id} className="flex items-start gap-4 px-6 py-5">
                <span className="mt-0.5 w-6 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <h3 className="font-heading text-base leading-tight font-bold tracking-[-0.01em] uppercase">
                    {show.artist_name}
                  </h3>
                  {show.other_acts && (
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      with {show.other_acts}
                    </p>
                  )}
                  <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
                    {show.venue_name} · {show.venue_city}
                    <span className="mx-1.5 opacity-40">/</span>
                    {displayDate
                      .toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })
                      .replace(/,/g, "")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {show.overall_rating && (
                    <StarRating value={show.overall_rating} readonly size="sm" />
                  )}
                  {isOwner && (
                    <Link
                      href={`/show/${show.id}/edit`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      title="Edit show"
                      aria-label={`Edit ${show.artist_name}`}
                    >
                      <Pencil className="size-3.5" />
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </TicketBody>
    </Ticket>
  )
}
