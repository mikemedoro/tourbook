import { Ticket, TicketBody } from "@/components/ui/ticket"

interface ProfileStatsProps {
  totalShows: number
  uniqueCities: number
  uniqueVenues: number
  showsThisYear: number
}

/**
 * One surface, four cells. Four separate cards was a lot of chrome around four
 * numbers, and the icons carried no information the labels didn't already.
 */
export function ProfileStats({
  totalShows,
  uniqueCities,
  uniqueVenues,
  showsThisYear,
}: ProfileStatsProps) {
  const stats = [
    { label: "Shows", value: totalShows },
    { label: String(new Date().getFullYear()), value: showsThisYear },
    { label: "Cities", value: uniqueCities },
    { label: "Venues", value: uniqueVenues },
  ]

  return (
    <Ticket perforated={false}>
      <TicketBody className="p-0">
        <dl className="grid grid-cols-2 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={[
                "flex flex-col items-center gap-2 px-4 py-8 text-center",
                // Interior rules only — no border on the outer edges
                i % 2 === 1 ? "border-l" : "",
                i > 1 ? "border-t" : "",
                "sm:border-t-0 sm:not-first:border-l",
              ].join(" ")}
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
