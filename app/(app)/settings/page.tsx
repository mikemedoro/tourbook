import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditProfileForm } from "@/components/profile/edit-profile-form"
import { PageHeader } from "@/components/layout/page-header"
import { Ticket, TicketBody } from "@/components/ui/ticket"
import { Profile } from "@/types/database"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const profile = rawProfile as Profile | null
  if (!profile) redirect("/login")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Edit profile" description="Update your public profile info." />
      <Ticket perforated={false}>
        <TicketBody className="gap-6 p-6">
          <EditProfileForm profile={profile} />
        </TicketBody>
      </Ticket>
    </div>
  )
}
