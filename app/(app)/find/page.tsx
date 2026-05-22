import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserSearch } from "@/components/find/user-search"

export default async function FindPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Find people</h1>
        <p className="text-muted-foreground text-sm mt-1">Search for friends to follow.</p>
      </div>
      <UserSearch currentUserId={user.id} />
    </div>
  )
}
