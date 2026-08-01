import type { SVGProps } from "react"

/**
 * Compact ticket mark for inline UI (navbar, auth header).
 *
 * public/logo.svg is the full lockup — a 800x330 ticket wrapping the wordmark —
 * where the perforation is only ~6% of the height and disappears below ~40px.
 * This redraws the same idea at a legible aspect: notches on both edges at the
 * midpoint, matching the tear line on ShowCard so the mark and the cards read
 * as one language. Traced as a single path so it needs no <mask> id.
 */
export function TicketMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 44 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6 0H38A6 6 0 0 1 44 6V10.5A4.5 4.5 0 0 0 44 19.5V24A6 6 0 0 1 38 30H6A6 6 0 0 1 0 24V19.5A4.5 4.5 0 0 0 0 10.5V6A6 6 0 0 1 6 0Z"
        fill="currentColor"
      />
    </svg>
  )
}
