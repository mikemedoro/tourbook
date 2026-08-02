"use client" // Error boundaries must be Client Components

import { Geist, Instrument_Sans, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

/**
 * Last resort: this replaces the root layout when the layout itself throws, so
 * it has to bring its own html, body, fonts and stylesheet.
 *
 * Deliberately built from plain markup rather than the component library. If
 * the root layout failed, the fewer things this page depends on, the better its
 * chances of rendering at all. metadata exports are unsupported here, so the
 * title comes from React's <title>.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geist.variable,
        instrumentSans.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <title>Something went wrong · Tourbook</title>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
          <p className="font-heading text-base font-bold tracking-[0.2em] uppercase">
            Tourbook
          </p>
          <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] uppercase">
            Something went wrong
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The app failed to start up. Trying again usually clears it.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="font-heading mt-2 rounded-md bg-primary px-3.5 py-2 text-[0.8125rem] font-bold tracking-[0.045em] text-primary-foreground uppercase"
          >
            Try again
          </button>
          {error.digest && (
            <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Ref {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
