export interface ArtistCount {
  /** Stable key: the MusicBrainz id when we have one, else the folded name. */
  key: string
  name: string
  count: number
  /** Most recent show date for this artist, ISO yyyy-mm-dd. */
  lastSeen: string
}

interface TallyInput {
  artist_name: string
  artist_mbid?: string | null
  show_date: string
}

/**
 * Counts how many times each artist has been seen.
 *
 * Grouping prefers `artist_mbid`, because two logs of the same artist can carry
 * different display strings ("Godspeed You! Black Emperor" vs "Godspeed You!
 * Black Emperor "), and setlist.fm occasionally revises names. Rows without an
 * mbid fall back to a case- and space-folded name so manually entered shows
 * still merge with each other.
 *
 * The display name comes from the most recent show, so a corrected spelling
 * wins over an older one.
 */
export function tallyArtists(shows: TallyInput[]): ArtistCount[] {
  const byKey = new Map<string, ArtistCount>()

  for (const show of shows) {
    if (!show.artist_name) continue
    // Collapse internal runs of whitespace for both the key and the label, so
    // "Big  Thief" and "Big Thief" merge and neither renders with a gap.
    const name = show.artist_name.trim().replace(/\s+/g, " ")
    if (!name) continue
    const key = show.artist_mbid?.trim() || name.toLowerCase()

    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, {
        key,
        name,
        count: 1,
        lastSeen: show.show_date,
      })
      continue
    }

    existing.count += 1
    if (show.show_date > existing.lastSeen) {
      existing.lastSeen = show.show_date
      existing.name = name
    }
  }

  return [...byKey.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  )
}
