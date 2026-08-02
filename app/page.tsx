import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Ticket, TicketBody, TicketTear, TicketStub } from "@/components/ui/ticket"
import { Wordmark } from "@/components/brand/wordmark"
import { BookOpen, ListMusic, SlidersHorizontal, Users, Star } from "lucide-react"

const eyebrow = "font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"

const steps = [
  {
    n: "01",
    title: "Search the show",
    body: "Type an artist and pick the night. Tourbook finds the date, the venue and the city so you're not typing them out.",
  },
  {
    n: "02",
    title: "The setlist fills itself",
    body: "Pulled straight from Setlist.fm, song by song. Star the ones that wrecked you and they show up as highlights on your ticket.",
  },
  {
    n: "03",
    title: "Rate it and file it",
    body: "Score the sound, setlist, venue and crowd. Add a photo and a note while it's fresh. It lands in your archive and your friends' feed.",
  },
]

const features = [
  {
    icon: BookOpen,
    title: "Your concert archive",
    body: "Every show in one place, oldest to newest, with counts by year, city and venue.",
  },
  {
    icon: ListMusic,
    title: "Auto-populated setlists",
    body: "No transcribing from memory at 2am. Search Setlist.fm, confirm the night, and the songs arrive already in order.",
  },
  {
    icon: SlidersHorizontal,
    title: "Rate every element",
    body: "One star rating flattens a whole night. Break it into sound, setlist, venue and crowd and you can say why it was great.",
  },
  {
    icon: Users,
    title: "Follow friends",
    body: "A feed of what everyone's been to. Find the people who were at the same show and see how they scored it.",
  },
]

/* Plain statements of what the app does. The previous version dressed these up
   as metrics ("∞ shows logged", "Cost: Free"), which reads as filler where real
   usage numbers would go. */
const trackables = [
  { term: "Setlists", detail: "Auto-filled from Setlist.fm, song by song" },
  { term: "Four ratings", detail: "Sound, setlist, venue and crowd, scored separately" },
  { term: "Photos", detail: "One shot per show, kept at full size" },
  { term: "Free", detail: "You don't need a card and there's no paid tier" },
]

/* A real ticket rendered from the same primitives as the feed, not a mockup. */
function SampleTicket() {
  return (
    <Ticket className="rotate-[-1.2deg]">
      <TicketBody>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-2xl leading-[0.95] font-bold tracking-[-0.02em] uppercase sm:text-3xl">
            Godspeed You! Black Emperor
          </h3>
          <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            with Jerusalem In My Heart
          </p>
        </div>

        <p className="border-l-2 border-primary pl-2.5 font-mono text-xs leading-relaxed tracking-[0.08em] uppercase">
          Brooklyn Steel
          <span className="text-muted-foreground"> · Brooklyn</span>
        </p>

        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Highlights
          </span>
          <p className="font-mono text-xs leading-relaxed tracking-[0.08em] uppercase">
            Storm · Sleep
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {[
            ["Sound", 5],
            ["Setlist", 4],
            ["Venue", 4],
            ["Crowd", 5],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {label}
              </span>
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`h-1 flex-1 rounded-full ${n <= (value as number) ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>
      </TicketBody>

      <TicketTear />

      <TicketStub>
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Mar 14 2024 · 11 songs
        </span>
        <span className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className="size-3.5 fill-star stroke-star" />
          ))}
        </span>
      </TicketStub>
    </Ticket>
  )
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Wordmark />
        <div className="flex items-center gap-3">
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            Log in
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-[1.05fr_1fr] lg:py-32">
          <div className="flex flex-col items-start gap-6">
            <p className={eyebrow}>A logbook for live music</p>
            <h1 className="font-heading text-5xl leading-[0.92] font-bold tracking-[-0.03em] uppercase sm:text-6xl">
              Every show
              <br />
              deserves a<br />
              memory
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              You remember the night. You don&apos;t remember the date, the openers,
              or whether they played the one you&apos;d waited nine years for.
              Tourbook keeps the receipt.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                Start your Tourbook
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                I already have one
              </Link>
            </div>
            <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              Setlists via Setlist.fm
            </p>
          </div>

          <div className="lg:pl-4">
            <SampleTicket />
          </div>
        </section>

        {/* What's in the box */}
        <section className="border-y bg-secondary/40">
          <dl className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {trackables.map((t) => (
              <div key={t.term} className="flex flex-col gap-1.5">
                <dt className="font-heading text-lg font-bold tracking-[-0.02em]">
                  {t.term}
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                  {t.detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
          <div className="flex flex-col gap-3">
            <p className={eyebrow}>How it works</p>
            <h2 className="font-heading max-w-2xl text-3xl font-bold tracking-[-0.02em] uppercase sm:text-4xl">
              Three minutes on the train home
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col gap-3 border-t pt-4">
                <span className="font-mono text-xs tracking-[0.18em] text-muted-foreground tabular-nums">
                  {s.n}
                </span>
                <h3 className="font-heading text-xl font-bold tracking-[-0.02em]">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-t">
          <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
            <div className="flex flex-col gap-3">
              <p className={eyebrow}>What you get</p>
              <h2 className="font-heading max-w-2xl text-3xl font-bold tracking-[-0.02em] uppercase sm:text-4xl">
                Built for people who keep the stub
              </h2>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {features.map((f) => {
                const Icon = f.icon
                return (
                  <Ticket key={f.title} perforated={false}>
                    <TicketBody className="gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-foreground">
                        <Icon className="size-4.5" />
                      </span>
                      <h3 className="font-heading text-lg font-bold tracking-[-0.02em]">
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {f.body}
                      </p>
                    </TicketBody>
                  </Ticket>
                )
              })}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t bg-foreground">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center text-background sm:py-28">
            <h2 className="font-heading text-4xl leading-[0.95] font-bold tracking-[-0.03em] uppercase sm:text-5xl">
              Start with the last show you went to
            </h2>
            <p className="max-w-xl text-base text-background/70">
              You&apos;ll remember more than you think once the setlist is in front of
              you. Work backwards from there.
            </p>
            <Link
              href="/register"
              className={buttonVariants({ size: "lg", className: "mt-2" })}
            >
              Create your Tourbook
            </Link>
          </div>
        </section>
      </main>

      <footer className="flex flex-col items-center gap-3 border-t px-6 py-12">
        <Wordmark />
        <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          © {new Date().getFullYear()} · Setlist data by Setlist.fm
        </p>
      </footer>
    </div>
  )
}
