import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

/**
 * The profile route calls notFound() for two different situations: no such
 * username, and a private profile the viewer is not allowed to see. Both are
 * answered the same way on purpose, so this page never reveals whether a
 * private account exists.
 */
export default function ProfileNotFound() {
  return (
    <EmptyState
      title="Profile not found"
      description="This account does not exist, or it is private."
      action={
        <>
          <Link href="/find" className={buttonVariants()}>
            Find people
          </Link>
          <Link href="/feed" className={buttonVariants({ variant: "outline" })}>
            Back to feed
          </Link>
        </>
      }
    />
  )
}
