"use client"

import { useState, useRef } from "react"
import { Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

  // Filters
  const [yearInput, setYearInput] = useState("")
  const [activeYear, setActiveYear] = useState<string | null>(null)
  const [textFilter, setTextFilter] = useState("")
  const yearDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function load(pageNum = 1, year?: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum) })
      if (year) params.set("year", year)
      const res = await fetch(`/api/setlistfm/artist/${mbid}/setlists?${params}`)
      const data = await res.json()
      const fetched: SetlistFmSetlist[] = data.setlist ?? []
      setSetlists(prev => pageNum === 1 ? fetched : [...prev, ...fetched])
      setLoaded(true)
      setPage(pageNum)
      setHasMore(fetched.length === 20)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Debounce year input: trigger fetch only when a full 4-digit year is typed
  function handleYearChange(val: string) {
    setYearInput(val)
    if (yearDebounceRef.current) clearTimeout(yearDebounceRef.current)
    if (val === "") {
      setActiveYear(null)
      setLoaded(false)
      load(1)
    } else if (val.length === 4 && /^\d{4}$/.test(val)) {
      yearDebounceRef.current = setTimeout(() => {
        setActiveYear(val)
        setLoaded(false)
        load(1, val)
      }, 600)
    }
  }

  function handleSelect(setlist: SetlistFmSetlist) {
    setSelected(setlist.id)
    onSelect(setlist)
  }

  function formatDate(dateStr: string) {
    const [day, month, year] = dateStr.split("-")
    return new Date(Date.UTC(+year, +month - 1, +day)).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  }

  const filtered = textFilter.trim()
    ? setlists.filter((s) => {
        const q = textFilter.toLowerCase()
        return (
          s.venue.name.toLowerCase().includes(q) ||
          s.venue.city.name.toLowerCase().includes(q) ||
          (s.tour?.name.toLowerCase().includes(q) ?? false)
        )
      })
    : setlists

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

      {loaded && (
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Year"
            value={yearInput}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-24 h-8 text-sm"
            min={1960}
            max={new Date().getFullYear()}
          />
          <div className="relative flex-1">
            <Input
              placeholder="Filter by venue or city…"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              className="h-8 text-sm pr-7"
            />
            {textFilter && (
              <button
                type="button"
                onClick={() => setTextFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {loaded && setlists.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No setlists found{activeYear ? ` for ${activeYear}` : ""}.
        </p>
      )}

      {loaded && setlists.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No results match your filter.</p>
      )}

      {filtered.length > 0 && (
        <ul className="border rounded-md divide-y max-h-95 overflow-y-auto">
          {filtered.map((s) => {
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

      {loaded && hasMore && !textFilter && (
        <button
          type="button"
          onClick={() => load(page + 1, activeYear ?? undefined)}
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

