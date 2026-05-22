import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Music, BookOpen, Star, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Music className="h-5 w-5" />
          Tourbook
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Log in</Link>
          <Link href="/register" className={buttonVariants()}>Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="px-6 py-24 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Every show deserves a memory.
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Tourbook lets you log every concert you&apos;ve attended — the setlist, the venue,
            the vibe — and share it with friends who were there too.
          </p>
          <Link href="/register" className={buttonVariants({ size: "lg" })}>Start your tourbook</Link>
        </section>

        {/* Features */}
        <section className="border-t px-6 py-20">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-3">
              <BookOpen className="h-7 w-7 text-primary" />
              <h3 className="font-semibold text-lg">Your concert archive</h3>
              <p className="text-muted-foreground text-sm">
                Every show you&apos;ve logged in one place. Browse your history and relive your best nights.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Music className="h-7 w-7 text-primary" />
              <h3 className="font-semibold text-lg">Auto-populated setlists</h3>
              <p className="text-muted-foreground text-sm">
                Search via Setlist.fm and the songs auto-fill. Highlight your favorites.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Star className="h-7 w-7 text-primary" />
              <h3 className="font-semibold text-lg">Rate every element</h3>
              <p className="text-muted-foreground text-sm">
                Sound, setlist, venue, crowd — break down exactly what made the night.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Users className="h-7 w-7 text-primary" />
              <h3 className="font-semibold text-lg">Follow friends</h3>
              <p className="text-muted-foreground text-sm">
                See what your friends are seeing in a live feed. Discover new artists.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Tourbook
      </footer>
    </div>
  )
}
