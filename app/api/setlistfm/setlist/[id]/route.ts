import { NextResponse } from "next/server"
import { getSetlist } from "@/lib/setlistfm/client"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const data = await getSetlist(id)
    if (!data) return NextResponse.json({ error: "Setlist not found" }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch setlist" }, { status: 502 })
  }
}
