import { NextResponse } from "next/server"
import { getSetlist, getVenueSetlists } from "@/lib/setlistfm/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const venueId = searchParams.get("venueId")
  const date = searchParams.get("date")
  const setlistId = searchParams.get("setlistId")
  const exclude = searchParams.get("exclude") // headliner artist name to exclude

  try {
    let resolvedVenueId = venueId
    let resolvedDate = date

    // If only a setlist ID is provided, look up the venue ID and date from it
    if (setlistId && (!resolvedVenueId || !resolvedDate)) {
      const setlist = await getSetlist(setlistId)
      if (!setlist) return NextResponse.json({ other_acts: [] })
      resolvedVenueId = setlist.venue.id
      resolvedDate = setlist.eventDate
    }

    if (!resolvedVenueId || !resolvedDate) {
      return NextResponse.json({ other_acts: [] })
    }

    const data = await getVenueSetlists(resolvedVenueId, resolvedDate)
    const other_acts = data.setlist
      .map((s) => s.artist.name)
      .filter((name) => name !== exclude)
    return NextResponse.json({ other_acts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ other_acts: [] })
  }
}
