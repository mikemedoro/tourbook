import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserSearch } from "@/components/find/user-search"
import { PageHeader } from "@/components/layout/page-header"

export default async function FindPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Find people" description="Search for friends to follow." />
      <UserSearch currentUserId={user.id} />
    </div>
  )
}
