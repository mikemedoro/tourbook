import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LogShowForm } from "@/components/shows/log-show-form"
import { PageHeader } from "@/components/layout/page-header"
import { Ticket, TicketBody } from "@/components/ui/ticket"

export default async function LogShowPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title="Log a show"
        description="Search the artist and the setlist fills itself in."
      />
      <Ticket perforated={false}>
        <TicketBody className="gap-6 p-6">
          <LogShowForm userId={user.id} />
        </TicketBody>
      </Ticket>
    </div>
  )
}
