"use client"

import { useState, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { SetlistFmArtist } from "@/types/setlistfm"

interface ArtistSearchProps {
  onSelect: (artist: SetlistFmArtist) => void
}

export function ArtistSearch({ onSelect }: ArtistSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SetlistFmArtist[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async () => {
    if (query.trim().length < 2) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setSearched(false)

    try {
      const res = await fetch(
        `/api/setlistfm/search?q=${encodeURIComponent(query.trim())}`,
        { signal: controller.signal }
      )
      const data = await res.json()
      setResults(data.artist ?? [])
      setSearched(true)
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      search()
    }
  }

  function handleSelect(artist: SetlistFmArtist) {
    setResults([])
    setSearched(false)
    setQuery(artist.name)
    onSelect(artist)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          placeholder="Search for an artist…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="outline" onClick={search} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="border rounded-md divide-y bg-background shadow-sm max-h-60 overflow-y-auto">
          {results.map((artist) => (
            <li key={artist.mbid}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => handleSelect(artist)}
              >
                <span className="font-medium">{artist.name}</span>
                {artist.disambiguation && (
                  <span className="text-muted-foreground ml-1.5">
                    ({artist.disambiguation})
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {searched && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No artists found for &quot;{query}&quot;.</p>
      )}
    </div>
  )
}
