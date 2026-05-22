import { Calendar, MapPin, Pencil, Star } from "lucide-react"
import Link from "next/link"
import { StarRating } from "@/components/shows/star-rating"
import { Badge } from "@/components/ui/badge"
import { Show, SetlistSong, ShowPhoto } from "@/types/database"

type ShowFull = Show & { setlist_songs: SetlistSong[]; show_photos: ShowPhoto[] }

interface ShowListProps {
  shows: ShowFull[]
  emptyMessage?: string
  isOwner?: boolean
}

export function ShowList({ shows, emptyMessage = "No shows yet.", isOwner = false }: ShowListProps) {
  if (shows.length === 0) {
    return <p className="text-muted-foreground text-sm py-8 text-center">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col divide-y">
      {shows.map((show, i) => {
        const displayDate = new Date(show.show_date + "T12:00:00")
        const highlights = show.setlist_songs.filter((s) => s.is_highlighted)

        return (
          <div key={show.id} className="py-4 flex items-start gap-3">
            <div className="text-center text-muted-foreground w-6 shrink-0 mt-0.5 text-sm font-medium">
              {i + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">{show.artist_name}</p>
                  {show.other_acts && (
                    <p className="text-xs text-muted-foreground">with {show.other_acts}</p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {show.venue_name}, {show.venue_city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {displayDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {show.overall_rating && (
                    <StarRating value={show.overall_rating} readonly size="sm" />
                  )}
                  {isOwner && (
                    <Link
                      href={`/show/${show.id}/edit`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit show"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>

              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  <span className="text-xs text-muted-foreground mr-1 self-center">
                    <Star className="h-3 w-3 inline fill-yellow-400 stroke-yellow-400 mr-0.5" />
                    Highlights:
                  </span>
                  {highlights.map((s) => (
                    <Badge key={s.id} variant="secondary" className="text-xs max-w-75">
                      <span className="truncate min-w-0">{s.song_name}</span>
                    </Badge>
                  ))}
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
