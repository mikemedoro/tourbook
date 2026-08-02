import { Ticket, TicketBody } from "@/components/ui/ticket"
import { EmptyState } from "@/components/ui/empty-state"
import type { ArtistCount } from "@/lib/artist-tally"

interface ArtistTallyProps {
  /** The full tally. One-timers are summarised rather than listed. */
  artists: ArtistCount[]
  emptyMessage?: string
}

function seenOnceLabel(n: number) {
  return `${n} ${n === 1 ? "artist" : "artists"} seen once`
}

/**
 * Repeat-viewing counter.
 *
 * Only artists seen more than once are listed: a row reading "1 time" is the
 * show list again with extra steps, and on a full archive the one-timers are
 * most of the rows. They are still counted in a summary line so the numbers
 * reconcile with the Artists stat above.
 *
 * The bar is scaled against the top count rather than the total, so the shape
 * of the list stays readable when someone has one runaway favourite.
 */
export function ArtistTally({
  artists,
  emptyMessage = "No artists yet",
}: ArtistTallyProps) {
  const repeats = artists.filter((a) => a.count > 1)
  const seenOnce = artists.length - repeats.length

  if (repeats.length === 0) {
    return (
      <Ticket perforated={false}>
        <TicketBody className="p-0">
          <EmptyState
            title={artists.length === 0 ? emptyMessage : "No repeats yet"}
            description={
              artists.length === 0
                ? undefined
                : `See an artist twice and they will start counting here. ${seenOnceLabel(seenOnce)} so far.`
            }
          />
        </TicketBody>
      </Ticket>
    )
  }

  const top = repeats[0].count

  return (
    <Ticket perforated={false}>
      <TicketBody className="gap-0 p-0">
        <ol className="divide-y">
          {repeats.map((artist, i) => (
            <li key={artist.key} className="flex items-center gap-4 px-6 py-4">
              <span className="w-6 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h3 className="truncate font-heading text-base leading-tight font-bold tracking-[-0.01em] uppercase">
                  {artist.name}
                </h3>
                <span
                  className="h-1 w-full overflow-hidden rounded-full bg-border"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(artist.count / top) * 100}%` }}
                  />
                </span>
              </div>

              <span className="shrink-0 font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase tabular-nums">
                {artist.count} times
              </span>
            </li>
          ))}
        </ol>

        {seenOnce > 0 && (
          <p className="border-t px-6 py-4 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            + {seenOnceLabel(seenOnce)}
          </p>
        )}
      </TicketBody>
    </Ticket>
  )
}
