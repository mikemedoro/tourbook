"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SetlistFmSetlist } from "@/types/setlistfm"

interface SetlistPickerProps {
  mbid: string
  onSelect: (setlist: SetlistFmSetlist) => void
}

export function SetlistPicker({ mbid, onSelect }: SetlistPickerProps) {
  const [setlists, setSetlists] = useState<SetlistFmSetlist[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  async function load(pageNum = 1) {
    setLoading(true)
    try {
      const res = await fetch(`/api/setlistfm/artist/${mbid}/setlists?page=${pageNum}`)
      const data = await res.json()
      const fetched: SetlistFmSetlist[] = data.setlist ?? []
      setSetlists(prev => pageNum === 1 ? fetched : [...prev, ...fetched])
      setLoaded(true)
      setPage(pageNum)
      // Setlist.fm returns 20 per page; fewer means we're at the end
      setHasMore(fetched.length === 20)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(setlist: SetlistFmSetlist) {
    setSelected(setlist.id)
    onSelect(setlist)
  }

  function formatDate(dateStr: string) {
    // Setlist.fm format: DD-MM-YYYY
    const [day, month, year] = dateStr.split("-")
    // Use Date.UTC to avoid timezone offset shifting the date back a day
    return new Date(Date.UTC(+year, +month - 1, +day)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {!loaded && (
        <button
          type="button"
          onClick={() => load(1)}
          disabled={loading}
          className="text-sm text-primary underline underline-offset-4 self-start"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading setlists…
            </span>
          ) : (
            "Browse recent setlists"
          )}
        </button>
      )}

      {loaded && setlists.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No setlists found for this artist on Setlist.fm.
        </p>
      )}

      {setlists.length > 0 && (
        <ul className="border rounded-md divide-y max-h-95 overflow-y-auto">
          {setlists.map((s) => {
            const songCount = s.sets.set.reduce(
              (acc, set) => acc + set.song.length,
              0
            )
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm transition-colors",
                    selected === s.id
                      ? "bg-primary/10 font-medium"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      {formatDate(s.eventDate)} — {s.venue.name},{" "}
                      {s.venue.city.name}
                    </span>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {songCount} songs
                    </Badge>
                  </div>
                  {s.tour && (
                    <span className="text-xs text-muted-foreground">{s.tour.name}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {loaded && hasMore && (
        <button
          type="button"
          onClick={() => load(page + 1)}
          disabled={loading}
          className="text-sm text-primary underline underline-offset-4 self-start cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading…
            </span>
          ) : (
            "Load more"
          )}
        </button>
      )}
    </div>
  )
}
