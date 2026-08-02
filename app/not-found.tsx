import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Wordmark } from "@/components/brand/wordmark"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5">
      <Link href="/" aria-label="Tourbook home">
        <Wordmark />
      </Link>
      <EmptyState
        title="Page not found"
        description="That link does not go anywhere. It may have moved, or never existed."
        action={
          <Link href="/" className={buttonVariants()}>
            Go home
          </Link>
        }
      />
    </div>
  )
}
