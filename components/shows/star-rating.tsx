"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  /** What is being rated, used to name the control for screen readers. */
  label?: string
}

const sizeClasses = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-6",
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  label = "Rating",
}: StarRatingProps) {
  // Read-only ratings are output, not controls. Rendering them as disabled
  // buttons put five unlabelled stops in the tab order and announced nothing.
  if (readonly) {
    return (
      <span
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${label}: ${value} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            className={cn(
              sizeClasses[size],
              star <= value
                ? "fill-star stroke-star"
                : "fill-none stroke-muted-foreground"
            )}
          />
        ))}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-0.5" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange?.(star)}
          className="cursor-pointer transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Star
            aria-hidden="true"
            className={cn(
              sizeClasses[size],
              star <= value
                ? "fill-star stroke-star"
                : "fill-none stroke-muted-foreground"
            )}
          />
        </button>
      ))}
    </span>
  )
}
