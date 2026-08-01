"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from "@/components/follows/follow-button"
import { markNotificationsRead } from "@/app/actions"
import { userAvatarGradient, getInitials } from "@/lib/utils"

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
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter()
  const [following] = useState<Set<string>>(
    new Set(notifications.filter((n) => n.isFollowingBack).map((n) => n.actor.id))
  )

  // Mark all unread as read on mount
  useEffect(() => {
    const hasUnread = notifications.some((n) => !n.read)
    if (!hasUnread) return
    markNotificationsRead().then(() => router.refresh())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (notifications.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-8 text-center">No notifications yet.</p>
    )
  }

  return (
    <div className="flex flex-col divide-y">
      {notifications.map((n) => {
        const initials = getInitials(n.actor.display_name, n.actor.username)
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

            <FollowButton
              targetUserId={n.actor.id}
              username={n.actor.username}
              initialFollowing={isFollowingActor}
              followLabel="Follow back"
            />
          </div>
        )
      })}
    </div>
  )
}
