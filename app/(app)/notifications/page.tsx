import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { PageHeader } from "@/components/layout/page-header"

type NotificationRow = {
  id: string
  type: string
  read: boolean
  created_at: string
  profiles: {
    id: string
    username: string
    display_name: string | null
  } | null
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: rawNotifications } = await supabase
    .from("notifications")
    .select("id, type, read, created_at, profiles!actor_id(id, username, display_name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const notifications = (rawNotifications as NotificationRow[] | null) ?? []

  // Check which actors the current user already follows
  const actorIds = notifications.map((n) => n.profiles?.id).filter(Boolean) as string[]
  let followingSet = new Set<string>()
  if (actorIds.length > 0) {
    const { data: myFollows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)
      .in("following_id", actorIds)
    followingSet = new Set(
      ((myFollows ?? []) as { following_id: string }[]).map((f) => f.following_id)
    )
  }

  const items = notifications
    .filter((n) => n.profiles)
    .map((n) => ({
      id: n.id,
      type: n.type,
      read: n.read,
      created_at: n.created_at,
      actor: n.profiles!,
      isFollowingBack: followingSet.has(n.profiles!.id),
    }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Notifications" />
      <NotificationsList notifications={items} />
    </div>
  )
}
