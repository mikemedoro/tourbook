import type { Metadata } from "next"
import { Geist, Instrument_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

// Body copy
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

// Headings / display
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
})

// Tertiary: dates, venue codes, counts, anything tabular
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Tourbook: log every show",
  description: "Track the concerts you've attended, rate the experience, and share with friends.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "font-sans",
        geist.variable,
        instrumentSans.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
