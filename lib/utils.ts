import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function hashUsername(username: string): number {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

/**
 * Deterministic avatar colour for a username. These are the only avatars in the
 * app, so they need to read as designed rather than as placeholders.
 *
 * Built in OKLCH with fixed lightness and chroma so the full hue wheel stays
 * available for telling people apart, while no single avatar comes out louder
 * than the rest. The old HSL version varied perceived lightness wildly by hue,
 * which is why yellows looked neon next to blues.
 *
 * Both stops sit inside sRGB at every hue, so nothing gets clipped, and the
 * bone initials clear 4.9:1 against the lighter stop whatever the hash lands on.
 */
export function userAvatarGradient(username: string): {
  background: string
  color: string
} {
  const hue = hashUsername(username) % 360
  return {
    background: `linear-gradient(135deg, oklch(0.5 0.082 ${hue}), oklch(0.42 0.07 ${hue}))`,
    color: "#f3ece6",
  }
}

export function getInitials(displayName: string | null | undefined, username: string): string {
  return (
    displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? username.slice(0, 2).toUpperCase()
  )
}
