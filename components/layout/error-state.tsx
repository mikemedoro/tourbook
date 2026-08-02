"use client"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

interface ErrorStateProps {
  title?: string
  description?: string
  /** Server-generated hash for matching this failure to server logs. */
  digest?: string
  onRetry: () => void
  retryLabel?: string
}

/**
 * Shared body for the error boundaries.
 *
 * Errors thrown in Server Components arrive with a generic message in
 * production, so there is nothing useful to show the user beyond the digest.
 * That gets surfaced in small type because it is the only handle support has
 * for finding the matching server log.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "That did not load. It is usually temporary, so trying again is worth a shot.",
  digest,
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState
        title={title}
        description={description}
        action={<Button onClick={onRetry}>{retryLabel}</Button>}
      />
      {digest && (
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          Ref {digest}
        </p>
      )}
    </div>
  )
}
