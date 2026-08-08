import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { MobileTabBar } from "@/components/layout/mobile-tab-bar"


export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile, } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single()

  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={profile} unreadNotifications={unreadNotifications ?? 0} />
      <main className="flex-1 container max-w-4xl mx-auto px-5 pt-14 pb-28 sm:px-6 sm:py-20">{children}</main>
      <MobileTabBar unreadNotifications={unreadNotifications ?? 0} />
    </div>
  )
}
