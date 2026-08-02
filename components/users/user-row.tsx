import * as React from "react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, userAvatarGradient, getInitials } from "@/lib/utils"

interface UserRowProps {
  username: string
  displayName?: string | null
  /** Primary line. Defaults to the display name, falling back to @username. */
  primary?: React.ReactNode
  /** Secondary line of prose, e.g. a bio or a handle. */
  secondary?: React.ReactNode
  /** Secondary line of metadata, e.g. a timestamp. Set in mono caps. */
  meta?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

/**
 * One row for a person, used by search results, notifications and the friends
 * dialog. These were three separate implementations with three avatar sizes and
 * three sets of padding; the shared container is what keeps them looking like
 * the same app. The avatar and name link to the profile rather than the whole
 * row, so an action button can live in the row without nesting interactives.
 */
export function UserRow({
  username,
  displayName,
  primary,
  secondary,
  meta,
  action,
  className,
}: UserRowProps) {
  const href = `/profile/${username}`
  const initials = getInitials(displayName, username)

  return (
    <div className={cn("flex items-center gap-3 px-5 py-4", className)}>
      <Link href={href} className="shrink-0" tabIndex={-1} aria-hidden="true">
        <Avatar className="size-10">
          <AvatarFallback style={userAvatarGradient(username)}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="truncate text-sm font-medium">
          {primary ?? (
            <Link href={href} className="hover:underline">
              {displayName ?? `@${username}`}
            </Link>
          )}
        </div>
        {secondary && (
          <div className="truncate text-xs text-muted-foreground">{secondary}</div>
        )}
        {meta && (
          <div className="truncate font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            {meta}
          </div>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
