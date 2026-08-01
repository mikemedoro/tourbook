import * as React from "react"

import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  /** Primary action for the page, rendered right-aligned on the title row. */
  action?: React.ReactNode
  /** Auth and onboarding screens are single-column and centred. */
  align?: "start" | "center"
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
  align = "start",
  className,
}: PageHeaderProps) {
  const centered = align === "center"

  return (
    <div
      className={cn(
        "flex gap-4",
        centered ? "flex-col items-center" : "items-start justify-between",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1",
          centered && "items-center text-center"
        )}
      >
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
