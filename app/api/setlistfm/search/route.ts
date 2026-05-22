import { NextResponse } from "next/server"
import { searchArtists } from "@/lib/setlistfm/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const page = Number(searchParams.get("page") ?? "1")

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ artist: [], total: 0 })
  }

  try {
    const data = await searchArtists(query.trim(), page)
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to search artists" }, { status: 502 })
  }
}
