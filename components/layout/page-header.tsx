import * as React from "react"

import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  /** Primary action for the page, rendered right-aligned on the title row. */
  action?: React.ReactNode
  className?: string
}

/**
 * One heading treatment for every app route. Previously each page hand-rolled
 * `text-2xl font-bold`, which meant the page title outweighed the artist name
 * on the cards below it — the wrong thing was loudest.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="font-heading text-xl font-bold tracking-[-0.02em] uppercase sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
