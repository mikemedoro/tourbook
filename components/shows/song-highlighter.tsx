"use client"

import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SongHighlighterProps {
  songs: Array<{ name: string; isEncore: boolean }>
  highlighted: Set<string>
  onToggle: (name: string) => void
}

export function SongHighlighter({ songs, highlighted, onToggle }: SongHighlighterProps) {
  if (songs.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Click a song to mark it as a highlight.
      </p>
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
        {songs.map((song, i) => {
          const isHighlighted = highlighted.has(song.name)
          return (
            <button
              key={`${song.name}-${i}`}
              type="button"
              onClick={() => onToggle(song.name)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
            >
              <Badge
                variant={isHighlighted ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors text-xs",
                  song.isEncore && "italic opacity-80"
                )}
              >
                {isHighlighted && (
                  <Star className="h-3 w-3 mr-1 fill-current" />
                )}
                {song.name}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}
