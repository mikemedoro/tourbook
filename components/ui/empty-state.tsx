import * as React from "react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Every "nothing here yet" message in the app. There were five variants of this
 * with different padding, alignment and type sizes; the differences carried no
 * meaning.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-16 text-center",
        className
      )}
    >
      <p className="font-heading text-base font-bold tracking-[-0.01em] uppercase">
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-1 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
