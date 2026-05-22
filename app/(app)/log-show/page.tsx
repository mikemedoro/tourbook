import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LogShowForm } from "@/components/shows/log-show-form"

export default async function LogShowPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Log a show</h1>
      <LogShowForm userId={user.id} />
    </div>
  )
}
