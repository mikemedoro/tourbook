import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UsernameForm } from "@/components/onboarding/username-form"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  // Already has a clean username — nothing to do
  if (profile && !/_[0-9a-f]{8}$/i.test(profile.username)) {
    redirect("/feed")
  }

  // Strip the hash suffix to use as a sensible default
  const defaultUsername = profile?.username.replace(/_[0-9a-f]{8}$/i, "") ?? ""

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6 pt-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Choose your username</h1>
        <p className="text-muted-foreground">
          Pick a username for your Tourbook profile. You can always change it later in settings.
        </p>
      </div>
      <UsernameForm defaultUsername={defaultUsername} />
    </div>
  )
}
