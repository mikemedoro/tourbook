"use client"

import { useEffect, useState } from "react"

import { StarRating } from "@/components/shows/star-rating"

/**
 * Normalises any CSS colour to hex via a canvas.
 *
 * Chrome computes these tokens to `lab()`, so neither the raw property value
 * nor getComputedStyle().color is hex. Canvas fillStyle does the conversion for
 * us and returns "#rrggbb", or "rgba(...)" when there is alpha.
 */
/**
 * Normalises any CSS colour to sRGB hex by painting it and reading the pixel.
 *
 * Chrome computes these tokens to `lab()`, and both getComputedStyle and canvas
 * fillStyle serialise straight back to `lab()`, so neither gives us hex.
 * Reading the rasterised pixel does, whatever colour space the source used.
 */
function toHex(input: string): string {
  if (!input) return ""
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return input

  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = "#000"
  ctx.fillStyle = input
  ctx.fillRect(0, 0, 1, 1)

  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  const hex = [r, g, b]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")
  // Alpha comes back premultiplied, so report it rather than folding it in
  return a < 255 ? `#${hex} · ${Math.round((a / 255) * 100)}%` : `#${hex}`
}

/**
 * Reads the resolved value of a CSS custom property at runtime.
 *
 * The point of this page is to be the single source of truth, which it can only
 * be if it reports what globals.css actually says today. Hardcoding the values
 * here would create a second copy that silently drifts.
 */
export function TokenValue({ name }: { name: string }) {
  const [value, setValue] = useState<string>("")

  useEffect(() => {
    const read = () =>
      setValue(
        toHex(
          getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim()
        )
      )
    read()
    // Re-read when the theme class flips, since the value changes with it
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [name])

  return (
    <code className="font-mono text-[10px] break-all text-muted-foreground">
      {value || " "}
    </code>
  )
}

/** Live star rating so the interactive state is demonstrable, not just described. */
export function StarRatingDemo() {
  const [value, setValue] = useState(4)
  return <StarRating value={value} onChange={setValue} label="Overall" />
}

/** Toggles the `dark` class so both themes can be checked on one page. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    return () => document.documentElement.classList.remove("dark")
  }, [dark])

  return (
    <button
      type="button"
      onClick={() => setDark((d) => !d)}
      className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
    >
      {dark ? "→ light" : "→ dark"}
    </button>
  )
}
