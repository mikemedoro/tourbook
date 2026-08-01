import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The footer every app form uses: commit and cancel grouped on the left,
 * destructive pushed to the far right so it can't be hit on the way to Save.
 *
 * Auth forms (login/register/onboarding) deliberately keep their full-width
 * submit — a single-purpose card in a narrow column is a different pattern.
 */
export function FormActions({
  children,
  destructive,
  className,
  ...props
}: React.ComponentProps<"div"> & { destructive?: React.ReactNode }) {
  return (
    <div
      data-slot="form-actions"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t pt-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">{children}</div>
      {destructive && <div className="shrink-0">{destructive}</div>}
    </div>
  )
}
