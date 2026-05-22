import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditShowForm } from "@/components/shows/edit-show-form"
import { Show, SetlistSong, ShowPhoto } from "@/types/database"

type ShowFull = Show & { setlist_songs: SetlistSong[]; show_photos: ShowPhoto[] }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditShowPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: rawShow } = await supabase
    .from("shows")
    .select("*, setlist_songs(*), show_photos(*)")
    .eq("id", id)
    .single()

  const show = rawShow as ShowFull | null

  if (!show) notFound()
  if (show.user_id !== user.id) notFound()

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  const profile = rawProfile as { username: string } | null

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Edit show</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update your ratings, notes, and song highlights.
        </p>
      </div>
      <EditShowForm show={show} username={profile?.username ?? ""} />
    </div>
  )
}
