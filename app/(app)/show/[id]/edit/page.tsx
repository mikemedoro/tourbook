import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditShowForm } from "@/components/shows/edit-show-form"
import { PageHeader } from "@/components/layout/page-header"
import { Ticket, TicketBody } from "@/components/ui/ticket"
import { ShowWithRelations } from "@/types/database"

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

  const show = rawShow as ShowWithRelations | null

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
      <PageHeader
        title="Edit show"
        description="Update your ratings, notes, and song highlights."
      />
      <Ticket perforated={false}>
        <TicketBody className="gap-6 p-6">
          <EditShowForm show={show} username={profile?.username ?? ""} />
        </TicketBody>
      </Ticket>
    </div>
  )
}
