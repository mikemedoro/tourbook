import { Ticket, TicketBody } from "@/components/ui/ticket"
import { cn } from "@/lib/utils"

interface ProfileStatsProps {
  totalShows: number
  uniqueCities: number
  uniqueVenues: number
  showsThisYear: number
  uniqueArtists: number
}

/**
 * One surface, five cells. Rules are drawn per-cell rather than with divide-x,
 * because the grid reflows from two columns to five and the interior edges move
 * with it. The final cell spans the full width on mobile so the last row is not
 * a lone orphan.
 */
export function ProfileStats({
  totalShows,
  uniqueCities,
  uniqueVenues,
  showsThisYear,
  uniqueArtists,
}: ProfileStatsProps) {
  const stats = [
    { label: "Shows", value: totalShows },
    { label: String(new Date().getFullYear()), value: showsThisYear },
    { label: "Artists", value: uniqueArtists },
    { label: "Venues", value: uniqueVenues },
    { label: "Cities", value: uniqueCities },
  ]

  return (
    <Ticket perforated={false}>
      <TicketBody className="p-0">
        <dl className="grid grid-cols-2 sm:grid-cols-5">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center gap-2 px-4 py-8 text-center",
                // Two-column layout: rule on the right-hand cell and above row 2+
                i % 2 === 1 && "border-l",
                i > 1 && "border-t",
                // Five across: interior rules only
                "sm:border-t-0 sm:not-first:border-l",
                // Last cell fills the final mobile row
                i === stats.length - 1 && "max-sm:col-span-2 max-sm:border-l-0"
              )}
            >
              <dd className="font-heading text-4xl leading-none font-bold tracking-[-0.03em] tabular-nums sm:text-5xl">
                {stat.value}
              </dd>
              <dt className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </TicketBody>
    </Ticket>
  )
}
