import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditProfileForm } from "@/components/profile/edit-profile-form"
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
      <div>
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Update your public profile info.</p>
      </div>
      <EditProfileForm profile={profile} />
    </div>
  )
}
