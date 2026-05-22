import { formatDistanceToNow } from "date-fns"
import { MapPin, Calendar, Star } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/shows/star-rating"
import { ShowWithSongs } from "@/types/database"
import { userAvatarGradient } from "@/lib/utils"
import { ShowPhotoToggle } from "@/components/shows/show-photo-toggle"

interface ShowCardProps {
  show: ShowWithSongs
}

export function ShowCard({ show }: ShowCardProps) {
  const highlightedSongs = show.setlist_songs.filter((s) => s.is_highlighted)
  const totalSongs = show.setlist_songs.length

  const displayDate = new Date(show.show_date + "T12:00:00")

  const profileInitials = show.profiles.username.slice(0, 2).toUpperCase()

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${show.profiles.username}`}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={show.profiles.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs" style={userAvatarGradient(show.profiles.username)}>{profileInitials}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${show.profiles.username}`}
                className="font-medium text-sm hover:underline"
              >
                {show.profiles.username}
              </Link>
              <span className="text-muted-foreground text-xs">
                logged{" "}
                {formatDistanceToNow(new Date(show.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="mt-1">
              <h3 className="font-semibold text-base">{show.artist_name}</h3>
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
          </div>

          {show.overall_rating && (
            <StarRating value={show.overall_rating} readonly size="sm" />
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-3">
        {show.notes && (
          <p className="text-sm text-muted-foreground line-clamp-3">{show.notes}</p>
        )}

        {highlightedSongs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1 self-center">
              <Star className="h-3 w-3 inline fill-yellow-400 stroke-yellow-400 mr-0.5" />
              Highlights:
            </span>
            {highlightedSongs.map((song) => (
              <Badge key={song.id} variant="secondary" className="text-xs max-w-75">
                <span className="truncate min-w-0">{song.song_name}</span>
              </Badge>
            ))}
          </div>
        )}

        {totalSongs > 0 && (
          <p className="text-xs text-muted-foreground">
            {totalSongs} song{totalSongs !== 1 ? "s" : ""} in setlist
          </p>
        )}

        {/* Sub-ratings */}
        {(show.sound_rating ||
          show.crowd_rating ||
          show.setlist_rating ||
          show.venue_rating) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t">
            {[
              { label: "Sound", value: show.sound_rating },
              { label: "Setlist", value: show.setlist_rating },
              { label: "Venue", value: show.venue_rating },
              { label: "Crowd", value: show.crowd_rating },
            ]
              .filter((r) => r.value !== null)
              .map((r) => (
                <div key={r.label} className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{r.label}</span>
                  <StarRating value={r.value!} readonly size="sm" />
                </div>
              ))}
          </div>
        )}

        {show.show_photos.length > 0 && (
          <ShowPhotoToggle storagePath={show.show_photos[0].storage_path} />
        )}
      </CardContent>
    </Card>
  )
}
