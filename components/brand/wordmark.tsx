import { cn } from "@/lib/utils"

/**
 * Typographic wordmark — no container.
 *
 * public/logo.svg sets TOURBOOK in light, widely letterspaced caps inside a
 * white ticket. The ticket needs a dark ground and goes illegible below ~40px,
 * so for inline UI we keep its type character and drop the badge.
 */
export function Wordmark({
  className,
  size = "default",
}: {
  className?: string
  size?: "default" | "lg"
}) {
  return (
    <span
      className={cn(
        "font-heading tracking-[0.12em] font-bold text-foreground uppercase",
        size === "lg"
          ? "text-lg"
          : "text-[0.9375rem]",
        className
      )}
    >
      Tourbook
    </span>
  )
}
