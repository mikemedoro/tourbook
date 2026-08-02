"use client" // Error boundaries must be Client Components

import { ErrorState } from "@/components/layout/error-state"

/**
 * Errors inside the signed-in app. This sits below (app)/layout.tsx, so the
 * navbar stays rendered and the user keeps a way out of the failed page.
 */
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return <ErrorState digest={error.digest} onRetry={() => unstable_retry()} />
}
