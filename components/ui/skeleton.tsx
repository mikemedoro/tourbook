import { cn } from "@/lib/utils"

/**
 * Placeholder block for streamed content.
 *
 * Uses --muted rather than a shimmer gradient: muted sits close to the page on
 * purpose, so a wall of these reads as pending rather than as a broken layout.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}
