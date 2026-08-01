"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { EmptyState } from "@/components/ui/empty-state"
import { Ticket, TicketBody } from "@/components/ui/ticket"
import { FollowButton } from "@/components/follows/follow-button"
import { UserRow } from "@/components/users/user-row"
import { markNotificationsRead } from "@/app/actions"

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
      <EmptyState
        title="Nothing yet"
        description="When someone follows you, it shows up here."
      />
    )
  }

  return (
    <Ticket perforated={false}>
      <TicketBody className="gap-0 p-0">
        <div className="divide-y">
          {notifications.map((n) => (
            <UserRow
              key={n.id}
              username={n.actor.username}
              displayName={n.actor.display_name}
              avatarUrl={n.actor.avatar_url}
              className={!n.read ? "bg-primary/5" : undefined}
              primary={
                <>
                  <Link
                    href={`/profile/${n.actor.username}`}
                    className="font-semibold hover:underline"
                  >
                    @{n.actor.username}
                  </Link>{" "}
                  <span className="font-normal">started following you</span>
                </>
              }
              meta={formatDistanceToNow(new Date(n.created_at), {
                addSuffix: true,
              })}
              action={
                <FollowButton
                  targetUserId={n.actor.id}
                  username={n.actor.username}
                  initialFollowing={following.has(n.actor.id)}
                  followLabel="Follow back"
                />
              }
            />
          ))}
        </div>
      </TicketBody>
    </Ticket>
  )
}
