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

export function userAvatarGradient(username: string): { background: string; color: string } {
  const hue = hashUsername(username) % 360
  return {
    background: `linear-gradient(135deg, hsl(${hue} 65% 55%), hsl(${(hue + 45) % 360} 65% 40%))`,
    color: "#fff",
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
