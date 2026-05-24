import { NextRequest, NextResponse } from "next/server"

// In-memory cache: survives across requests in the same server process
const cache = new Map<string, { lat: number; lng: number } | null>()

const NOMINATIM_HEADERS = {
  "User-Agent": "Tourbook Concert Tracker (https://github.com/mikeemdoro/tourbook)",
  "Accept-Language": "en",
}

async function nominatimSearch(
  name: string,
  city?: string
): Promise<{ lat: number; lng: number } | null> {
  const q = encodeURIComponent(city ? `${name}, ${city}` : name)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=0`,
    { headers: NOMINATIM_HEADERS, next: { revalidate: 60 * 60 * 24 * 30 } }
  )
  if (!res.ok) return null
  const data = await res.json()
  const first = data[0]
  if (!first) return null
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) }
}

/** Strip leading stage/area name from "Foo Stage at the Bar Venue" → "Bar Venue" */
function simplifyVenueName(name: string): string | null {
  const atTheIdx = name.toLowerCase().indexOf(" at the ")
  if (atTheIdx !== -1) return name.slice(atTheIdx + " at the ".length)
  const atIdx = name.toLowerCase().indexOf(" at ")
  if (atIdx !== -1) return name.slice(atIdx + " at ".length)
  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get("name")?.trim()
  const city = searchParams.get("city")?.trim()

  if (!name) {
    return NextResponse.json(null, { status: 400 })
  }

  const key = `${name}|${city ?? ""}`.toLowerCase()

  if (cache.has(key)) {
    return NextResponse.json(cache.get(key) ?? null)
  }

  try {
    // 1. Try full name + city
    let result = await nominatimSearch(name, city)

    // 2. If no result, try simplified name (e.g. "Skyline Stage at the Mann Center" → "Mann Center")
    if (!result) {
      const simplified = simplifyVenueName(name)
      if (simplified) {
        result = await nominatimSearch(simplified, city)
      }
    }

    cache.set(key, result)
    return NextResponse.json(result)
  } catch {
    cache.set(key, null)
    return NextResponse.json(null)
  }
}
