import {
  SetlistFmArtistSearchResponse,
  SetlistFmSetlistSearchResponse,
  SetlistFmSetlist,
} from "@/types/setlistfm"

const BASE_URL = "https://api.setlist.fm/rest/1.0"

function headers() {
  return {
    "x-api-key": process.env.SETLISTFM_API_KEY!,
    Accept: "application/json",
  }
}

export async function searchArtists(query: string, page = 1) {
  const params = new URLSearchParams({ artistName: query, p: String(page) })
  const res = await fetch(`${BASE_URL}/search/artists?${params}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    if (res.status === 404) return { artist: [], total: 0, itemsPerPage: 20, page }
    throw new Error(`Setlist.fm search/artists failed: ${res.status}`)
  }

  return res.json() as Promise<SetlistFmArtistSearchResponse>
}

export async function getArtistSetlists(mbid: string, page = 1) {
  const params = new URLSearchParams({ p: String(page) })
  const res = await fetch(`${BASE_URL}/artist/${mbid}/setlists?${params}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    if (res.status === 404) return { setlist: [], total: 0, itemsPerPage: 20, page }
    throw new Error(`Setlist.fm artist setlists failed: ${res.status}`)
  }

  return res.json() as Promise<SetlistFmSetlistSearchResponse>
}

export async function getSetlist(setlistId: string) {
  const res = await fetch(`${BASE_URL}/setlist/${setlistId}`, {
    headers: headers(),
    next: { revalidate: 86400 },
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Setlist.fm setlist fetch failed: ${res.status}`)
  }

  return res.json() as Promise<SetlistFmSetlist>
}

export async function getVenueSetlists(venueId: string, date: string) {
  // date is in DD-MM-YYYY format (matches setlist.eventDate)
  const params = new URLSearchParams({ venueId, date, p: "1" })
  const res = await fetch(`${BASE_URL}/search/setlists?${params}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    if (res.status === 404) return { setlist: [], total: 0, itemsPerPage: 20, page: 1 }
    throw new Error(`Setlist.fm venue setlists failed: ${res.status}`)
  }

  return res.json() as Promise<SetlistFmSetlistSearchResponse>
}

export async function searchSetlists(params: {
  artistName?: string
  cityName?: string
  year?: number
  venueName?: string
  page?: number
}) {
  const query = new URLSearchParams()
  if (params.artistName) query.set("artistName", params.artistName)
  if (params.cityName) query.set("cityName", params.cityName)
  if (params.year) query.set("year", String(params.year))
  if (params.venueName) query.set("venueName", params.venueName)
  query.set("p", String(params.page ?? 1))

  const res = await fetch(`${BASE_URL}/search/setlists?${query}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    if (res.status === 404) return { setlist: [], total: 0, itemsPerPage: 20, page: 1 }
    throw new Error(`Setlist.fm search/setlists failed: ${res.status}`)
  }

  return res.json() as Promise<SetlistFmSetlistSearchResponse>
}
