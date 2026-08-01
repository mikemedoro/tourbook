"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useFollowToggle } from "@/hooks/use-follow-toggle"

interface FollowButtonProps {
  targetUserId: string
  username: string
  initialFollowing: boolean
  size?: "sm" | "default"
  /** Notifications says "Follow back"; everywhere else says "Follow". */
  followLabel?: string
  className?: string
  /** Lets list parents keep their own follow set in sync. */
  onChange?: (following: boolean) => void
  /** When provided, clicking calls this instead of toggling (e.g. send to login). */
  onRequireAuth?: () => void
}

/**
 * The single follow control for the app.
 *
 * "Following" is a state, not an action, so it uses `secondary` rather than
 * `outline` — outline reads as an alternative action sitting beside a primary,
 * which is what Cancel is. Hovering a followed user reveals "Unfollow" in
 * destructive tint, so the undo is discoverable without a second button.
 */
export function FollowButton({
  targetUserId,
  username,
  initialFollowing,
  size = "sm",
  followLabel = "Follow",
  className,
  onChange,
  onRequireAuth,
}: FollowButtonProps) {
  const { following, isPending, toggle } = useFollowToggle({
    initialFollowing,
    username,
  })

  function handleClick() {
    if (onRequireAuth) {
      onRequireAuth()
      return
    }
    onChange?.(!following)
    toggle(targetUserId)
  }

  return (
    <Button
      size={size}
      variant={following ? "secondary" : "default"}
      disabled={isPending}
      onClick={handleClick}
      // Fixed width so swapping Following/Unfollow doesn't shift the row
      className={cn(
        "group/follow shrink-0",
        size === "sm" ? "min-w-24" : "min-w-28",
        following && "hover:bg-destructive/10 hover:text-destructive",
        className
      )}
    >
      {following ? (
        <>
          <span className="group-hover/follow:hidden">Following</span>
          <span className="hidden group-hover/follow:inline">Unfollow</span>
        </>
      ) : (
        followLabel
      )}
    </Button>
  )
}
