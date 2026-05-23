"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { markNotificationsRead } from "@/app/actions"
import { userAvatarGradient } from "@/lib/utils"
import { toast } from "sonner"

type NotificationItem = {
  id: string
  type: string
  read: boolean
  created_at: string
  actor: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  isFollowingBack: boolean
}

interface NotificationsListProps {
  notifications: NotificationItem[]
  currentUserId: string
}

export function NotificationsList({ notifications, currentUserId }: NotificationsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [following, setFollowing] = useState<Set<string>>(
    new Set(notifications.filter((n) => n.isFollowingBack).map((n) => n.actor.id))
  )
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Mark all unread as read on mount
  useEffect(() => {
    const hasUnread = notifications.some((n) => !n.read)
    if (!hasUnread) return
    markNotificationsRead().then(() => router.refresh())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggleFollow(actorId: string, username: string) {
    setLoadingId(actorId)
    const isFollowing = following.has(actorId)

    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", actorId)
      if (!error) {
        setFollowing((prev) => {
          const next = new Set(prev)
          next.delete(actorId)
          return next
        })
        toast.success(`Unfollowed @${username}`)
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: actorId })
      if (!error) {
        setFollowing((prev) => new Set(prev).add(actorId))
        toast.success(`Following @${username}`)
      }
    }

    setLoadingId(null)
  }

  if (notifications.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">No notifications yet.</p>
    )
  }

  return (
    <div className="flex flex-col divide-y">
      {notifications.map((n) => {
        const initials = (n.actor.display_name ?? n.actor.username).slice(0, 2).toUpperCase()
        const isFollowingActor = following.has(n.actor.id)

        return (
          <div
            key={n.id}
            className={`py-4 flex items-center gap-3 ${!n.read ? "font-medium" : ""}`}
          >
            <Link href={`/profile/${n.actor.username}`}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={n.actor.avatar_url ?? undefined} />
                <AvatarFallback
                  className="text-xs"
                  style={userAvatarGradient(n.actor.username)}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <Link
                  href={`/profile/${n.actor.username}`}
                  className="font-semibold hover:underline"
                >
                  @{n.actor.username}
                </Link>{" "}
                started following you
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </div>

            <Button
              size="sm"
              variant={isFollowingActor ? "outline" : "default"}
              disabled={loadingId === n.actor.id}
              onClick={() => toggleFollow(n.actor.id, n.actor.username)}
            >
              {isFollowingActor ? "Following" : "Follow back"}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
