import type { Metadata } from "next"
import { Geist, Figtree } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

const figtreeHeading = Figtree({subsets:['latin'],variable:'--font-heading'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Tourbook — Log every show",
  description: "Track the concerts you've attended, rate the experience, and share with friends.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("dark", "h-full", "antialiased", geistSans.variable, "font-sans", geist.variable, figtreeHeading.variable)}>
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
