import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { buttonVariants } from "@/components/ui/button"

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-5 py-4 sm:px-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-40">
        <Link href="/" aria-label="Tourbook home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Log in
          </Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>
            Sign up
          </Link>
        </div>
      </header>
      <main className="flex-1 container max-w-4xl mx-auto px-5 py-14 sm:px-6 sm:py-20">
        {children}
      </main>
    </div>
  )
}
