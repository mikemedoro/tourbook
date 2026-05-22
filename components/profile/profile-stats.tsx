import { Music, MapPin, Trophy, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProfileStatsProps {
  totalShows: number
  uniqueArtists: number
  uniqueVenues: number
  showsThisYear: number
}

export function ProfileStats({
  totalShows,
  uniqueArtists,
  uniqueVenues,
  showsThisYear,
}: ProfileStatsProps) {
  const stats = [
    { label: "Shows", value: totalShows, icon: Trophy },
    { label: "Artists", value: uniqueArtists, icon: Music },
    { label: "Venues", value: uniqueVenues, icon: MapPin },
    { label: `Shows ${new Date().getFullYear()}`, value: showsThisYear, icon: Calendar },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="pt-4 flex flex-col items-center text-center gap-1">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-3xl font-bold">{stat.value}</span>
              <span className="text-base text-muted-foreground">{stat.label}</span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
