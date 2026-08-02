import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Ticket, TicketBody, TicketTear, TicketStub } from "@/components/ui/ticket"
import { StarRating } from "@/components/shows/star-rating"
import { ShowPhoto } from "@/components/shows/show-photo"
import { ShowWithSongs } from "@/types/database"
import { cn, userAvatarGradient, getInitials } from "@/lib/utils"

interface ShowCardProps {
  show: ShowWithSongs
}

/** Compact 5-segment meter — replaces four near-identical rows of stars. */
function RatingMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className="flex gap-0.5"
        role="img"
        aria-label={`${label}: ${value} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={cn(
              "h-1 flex-1 rounded-full",
              n <= value ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </span>
    </div>
  )
}

export function ShowCard({ show }: ShowCardProps) {
  const highlightedSongs = show.setlist_songs.filter((s) => s.is_highlighted)
  const totalSongs = show.setlist_songs.length
  const displayDate = new Date(show.show_date + "T12:00:00")
  const profileInitials = getInitials(show.profiles.display_name, show.profiles.username)

  const subRatings = [
    { label: "Sound", value: show.sound_rating },
    { label: "Setlist", value: show.setlist_rating },
    { label: "Venue", value: show.venue_rating },
    { label: "Crowd", value: show.crowd_rating },
  ].filter((r) => r.value !== null)

  const photo = show.show_photos[0]

  return (
    <Ticket className="transition-transform duration-200 hover:-translate-y-0.5">
      {photo && (
        <ShowPhoto
          storagePath={photo.storage_path}
          alt={`${show.artist_name} at ${show.venue_name}`}
        />
      )}

      <TicketBody>
        {/* Attribution */}
        <div className="flex items-center gap-2">
          <Link href={`/profile/${show.profiles.username}`}>
            <Avatar className="size-6">
              <AvatarImage src={show.profiles.avatar_url ?? undefined} />
              <AvatarFallback
                className="text-[10px]"
                style={userAvatarGradient(show.profiles.username)}
              >
                {profileInitials}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Link
            href={`/profile/${show.profiles.username}`}
            className="font-mono text-[11px] tracking-[0.08em] uppercase hover:underline"
          >
            {show.profiles.username}
          </Link>
          <span className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            · {formatDistanceToNow(new Date(show.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Headliner — the poster line */}
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-2xl leading-[0.95] font-bold tracking-[-0.02em] uppercase sm:text-3xl">
            {show.artist_name}
          </h3>
          {show.other_acts && (
            <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
              with {show.other_acts}
            </p>
          )}
        </div>

        {/* Venue */}
        <p className="border-l-2 border-primary pl-2.5 font-mono text-xs leading-relaxed tracking-[0.08em] uppercase">
          {show.venue_name}
          <span className="text-muted-foreground"> · {show.venue_city}</span>
        </p>

        {show.notes && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{show.notes}</p>
        )}

        {highlightedSongs.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Highlights
            </span>
            <p className="font-mono text-xs leading-relaxed tracking-[0.08em] uppercase">
              {highlightedSongs.map((song) => song.song_name).join(" · ")}
            </p>
          </div>
        )}

        {subRatings.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            {subRatings.map((r) => (
              <RatingMeter key={r.label} label={r.label} value={r.value!} />
            ))}
          </div>
        )}
      </TicketBody>

      <TicketTear />

      {/* The stub: serial-number metadata, always present so the tear line
          lands at a consistent height across every card. */}
      <TicketStub>
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          {displayDate
            .toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
            .replace(/,/g, "")}
          {totalSongs > 0 && ` · ${totalSongs} ${totalSongs === 1 ? "song" : "songs"}`}
        </span>
        {show.overall_rating && (
          <StarRating value={show.overall_rating} readonly size="sm" label="Overall" />
        )}
      </TicketStub>
    </Ticket>
  )
}
