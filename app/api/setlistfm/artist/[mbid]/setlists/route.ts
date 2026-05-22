import { NextResponse } from "next/server"
import { getArtistSetlists } from "@/lib/setlistfm/client"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mbid: string }> }
) {
  const { mbid } = await params
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") ?? "1")

  try {
    const data = await getArtistSetlists(mbid, page)
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch setlists" }, { status: 502 })
  }
}
