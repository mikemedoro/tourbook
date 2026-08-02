"use client" // Error boundaries must be Client Components

import { ErrorState } from "@/components/layout/error-state"

/**
 * Catches anything thrown below the root layout, including the (app) layout's
 * auth and profile lookups. Errors inside the app shell are caught closer to
 * the page by app/(app)/error.tsx so the navbar survives.
 */
export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <ErrorState digest={error.digest} onRetry={() => unstable_retry()} />
    </div>
  )
}
