import type { Metadata } from "next"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Ticket, TicketBody, TicketTear, TicketStub } from "@/components/ui/ticket"
import { FormActions } from "@/components/ui/form-actions"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { UserRow } from "@/components/users/user-row"
import { StarRating } from "@/components/shows/star-rating"
import { Wordmark } from "@/components/brand/wordmark"
import { TokenValue, ThemeToggle, StarRatingDemo } from "./token-readout"

export const metadata: Metadata = {
  title: "Tourbook style guide",
}

const meta = "font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"

function Section({
  n,
  title,
  lede,
  children,
}: {
  n: string
  title: string
  lede?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6 border-t pt-8">
      <div className="flex flex-col gap-2">
        <span className={meta}>{n}</span>
        <h2 className="font-heading text-2xl font-bold tracking-[-0.02em] uppercase">
          {title}
        </h2>
        {lede && <p className="max-w-2xl text-sm text-muted-foreground">{lede}</p>}
      </div>
      {children}
    </section>
  )
}

function Swatch({
  name,
  className,
  note,
}: {
  name: string
  className: string
  note?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 rounded-md border ${className}`} />
      <div className="flex flex-col gap-0.5">
        <code className="font-mono text-[11px]">--{name}</code>
        <TokenValue name={`--${name}`} />
        {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t py-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="w-40 shrink-0">
        <span className={meta}>{label}</span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export default function StyleGuide() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-5 py-14 sm:px-6 sm:py-20">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Wordmark />
          <ThemeToggle />
        </div>
        <PageHeader
          title="Style guide"
          description="The single source of truth for Tourbook's visual system. Token values on this page are read from globals.css at runtime and every component below is the real one, so this cannot drift from the app."
        />
      </header>

      <Section
        n="01"
        title="Brand"
        lede="The app is a logbook for gig tickets, and the ticket is the organising idea: perforated card surfaces, poster-scale artist names, and serial-number metadata."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Ticket className="rotate-[-1.2deg]">
            <TicketBody className="gap-2 p-4">
              <h3 className="font-heading text-lg leading-none font-bold tracking-[-0.02em] uppercase">
                Big Thief
              </h3>
              <p className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                Webster Hall · NY
              </p>
            </TicketBody>
            <TicketTear />
            <TicketStub className="h-12 px-4">
              <span className={meta}>Nov 02 2023</span>
            </TicketStub>
          </Ticket>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">
              The perforation is a real CSS mask, not a border image. It cuts notches
              out of both edges at the tear line so the background, border and any
              full-bleed photo clip together. The shadow is a{" "}
              <code className="font-mono text-xs">drop-shadow()</code> filter on the
              parent, because a box-shadow would be clipped by the mask.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Use the perforation only for a show. Surfaces without a stub pass{" "}
              <code className="font-mono text-xs">perforated={"{false}"}</code>.
            </p>
          </div>
        </div>
      </Section>

      <Section
        n="02"
        title="Colour"
        lede="Derived from amber.health. Every neutral carries warm chroma, so nothing reads as default grey. Amber is reserved for actions and ratings; everything structural is ink on bone."
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className={`${meta} mb-3`}>Surfaces</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Swatch name="background" className="bg-background" note="The page. Bone." />
              <Swatch name="card" className="bg-card" note="Lifts off the page." />
              <Swatch name="secondary" className="bg-secondary" note="Clay. Chips, bands, the Following state." />
              <Swatch name="muted" className="bg-muted" note="Wells and hover. Sits close to the page on purpose." />
            </div>
          </div>

          <div>
            <p className={`${meta} mb-3`}>Ink</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Swatch name="foreground" className="bg-foreground" note="14.3:1 on bone" />
              <Swatch name="muted-foreground" className="bg-muted-foreground" note="4.9:1 on bone" />
              <Swatch name="border" className="bg-border" note="Dividers only" />
              <Swatch name="input" className="bg-input" note="Field edges. 3:1 min." />
            </div>
          </div>

          <div>
            <p className={`${meta} mb-3`}>Accent</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Swatch name="primary" className="bg-primary" note="Actions. Ink on top." />
              <Swatch name="star" className="bg-star" note="Ratings only" />
              <Swatch name="destructive" className="bg-destructive" note="Delete" />
              <Swatch name="accent" className="bg-accent" note="Menu hover surface" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border bg-secondary/50 p-5">
          <p className="font-heading text-sm font-bold tracking-[-0.01em] uppercase">
            Four rules that are easy to get wrong
          </p>
          <ol className="flex list-decimal flex-col gap-2 pl-4 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Warm fills take ink, never white.</strong>{" "}
              White on the amber primary is 1.9:1 and on the destructive red 3.4:1. Ink
              is 9.1:1 and 4.9:1. Every warm fill in this palette pairs with{" "}
              <code className="font-mono text-xs">--foreground</code>.
            </li>
            <li>
              <strong className="text-foreground">
                <code className="font-mono text-xs">--accent</code> is a surface, not a
                brand colour.
              </strong>{" "}
              shadcn uses it for dropdown and select hover. Setting it to the brand
              amber turns every menu hover into a vivid block.
            </li>
            <li>
              <strong className="text-foreground">Surfaces are a ladder, not a set.</strong>{" "}
              Card sits above the page and secondary below it, each by a visible step.
              amber.health puts its sand against white; against a bone page the same
              value lands at 1.1:1 and reads as a smudge rather than a tint.
            </li>
            <li>
              <strong className="text-foreground">
                <code className="font-mono text-xs">--border</code> and{" "}
                <code className="font-mono text-xs">--input</code> are not the same.
              </strong>{" "}
              Dividers are decorative and stay light. A field boundary identifies the
              control, so WCAG 1.4.11 wants 3:1 against the surface behind it.
            </li>
          </ol>
        </div>
      </Section>

      <Section
        n="03"
        title="Typography"
        lede="Three families with three jobs. The split is what stops the app reading as a template: display for names, mono for anything that behaves like a serial number, and a plain sans for prose."
      >
        <div className="flex flex-col">
          <Row label="Display / --font-heading">
            <p className="font-heading text-3xl leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Godspeed You! Black Emperor
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Instrument Sans. Artist names, page titles, stat numerals and every
              button. Always caps
              with <code className="font-mono">-0.02em</code> tracking; it runs tight
              and needs the leading pulled in at display sizes. Applied automatically
              to every <code className="font-mono">h1</code>–<code className="font-mono">h6</code>.
            </p>
          </Row>

          <Row label="Body / --font-sans">
            <p className="text-base">
              Three encores. The room went completely silent before Storm and stayed
              that way for a full minute.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Geist. Notes, descriptions, form labels, empty-state copy. Sentence
              case.
            </p>
          </Row>

          <Row label="Metadata / --font-mono">
            <p className="font-mono text-xs tracking-[0.08em] uppercase">
              Brooklyn Steel · Brooklyn / Mar 14 2024 · 11 songs
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              JetBrains Mono. Dates, venues, counts, handles, timestamps, eyebrows. Caps
              with tracking from <code className="font-mono">0.08em</code> to{" "}
              <code className="font-mono">0.18em</code>: looser as the type gets
              smaller. Never for prose. A bio set in mono caps looks like a serial
              number.
            </p>
          </Row>
        </div>

        <div className="flex flex-col gap-2">
          <p className={meta}>Scale in use</p>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
            {[
              ["text-3xl", "text-3xl", "Artist, feed card"],
              ["text-2xl", "text-2xl", "Page title, profile name"],
              ["text-xl", "text-xl", "Section, card title"],
              ["text-base", "text-base", "Body"],
              ["text-sm", "text-sm", "Secondary body"],
              ["text-xs", "text-xs", "Metadata"],
              ["text-[10px]", "text-[10px]", "Eyebrow, label"],
            ].map(([token, cls, use]) => (
              <div key={token} className="flex flex-col gap-0.5">
                <span className={`font-heading font-bold ${cls}`}>Aa</span>
                <code className="font-mono text-[10px] text-muted-foreground">{token}</code>
                <span className="text-[10px] text-muted-foreground">{use}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        n="04"
        title="Shape and space"
        lede="One radius token drives every corner in the app. The spacing rhythm is deliberately loose: cards breathe at gap-10 and up."
      >
        <div className="flex flex-col">
          <Row label="Radius">
            <div className="flex flex-wrap items-end gap-4">
              {[
                ["rounded-sm", "rounded-sm"],
                ["rounded-md", "rounded-md"],
                ["rounded-lg", "rounded-lg"],
                ["rounded-xl", "rounded-xl"],
                ["rounded-2xl", "rounded-2xl"],
              ].map(([token, cls]) => (
                <div key={token} className="flex flex-col items-center gap-1.5">
                  <div className={`size-14 border bg-card ${cls}`} />
                  <code className="font-mono text-[10px] text-muted-foreground">{token}</code>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              All computed from <code className="font-mono">--radius</code> (
              <TokenValue name="--radius" />
              ). Change that one value and the whole app moves together. Cards use{" "}
              <code className="font-mono">rounded-xl</code>, controls{" "}
              <code className="font-mono">rounded-md</code>.
            </p>
          </Row>

          <Row label="Spacing">
            <div className="flex flex-wrap items-end gap-3">
              {["2", "3", "4", "5", "6", "8", "10", "12"].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1.5">
                  <div className={`w-4 bg-primary h-${n}`} style={{ height: `${Number(n) * 4}px` }} />
                  <code className="font-mono text-[10px] text-muted-foreground">{n}</code>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              4px base. Card interiors use 6 (<code className="font-mono">p-6</code>),
              page gutters 5 to 6, gaps between feed cards 10 to 12, and section breaks
              on the landing page 24 to 28.
            </p>
          </Row>
        </div>
      </Section>

      <Section
        n="05"
        title="Buttons"
        lede="Pick by intent, not by appearance. Every variant below has exactly one job; when in doubt the question is what the button means, not what weight looks right."
      >
        <div className="flex flex-col">
          {[
            ["default", "The one commit action in a view", <Button key="a">Log a show</Button>],
            ["outline", "Alternative or escape route", <Button key="b" variant="outline">Cancel</Button>],
            ["secondary", "A toggled-on state, not an action", <Button key="c" variant="secondary">Following</Button>],
            ["ghost", "Low-emphasis chrome, icon nav", <Button key="d" variant="ghost">Filter</Button>],
            ["destructive", "Delete trigger, low emphasis", <Button key="e" variant="destructive"><Trash2 className="mr-1.5 size-4" />Delete</Button>],
            ["destructive-solid", "Confirm inside the dialog", <Button key="f" variant="destructive-solid">Delete show</Button>],
          ].map(([variant, use, node]) => (
            <Row key={variant as string} label={variant as string}>
              <div className="flex flex-wrap items-center gap-4">
                {node as React.ReactNode}
                <span className="text-xs text-muted-foreground">{use as string}</span>
              </div>
            </Row>
          ))}
          <Row label="Sizes">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Large</Button>
              <Button>Default</Button>
              <Button size="sm">Small</Button>
              <Button size="xs">XS</Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              <code className="font-mono">lg</code> is for marketing surfaces only.{" "}
              <code className="font-mono">default</code> for page and form actions,{" "}
              <code className="font-mono">sm</code> inside dense rows and the navbar.
            </p>
          </Row>
          <Row label="Type">
            <p className="text-sm text-muted-foreground">
              Buttons are set in Instrument Sans caps with{" "}
              <code className="font-mono text-xs">0.045em</code> tracking, the same
              family as the headings. Sentence-case Geist was the only lowercase type
              in the interface and made every button read as a stock component.
            </p>
          </Row>
          <Row label="States">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled outline</Button>
            </div>
          </Row>
        </div>
      </Section>

      <Section n="06" title="Components">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className={meta}>Ticket · the show surface</p>
            <Ticket>
              <TicketBody className="gap-3">
                <h3 className="font-heading text-2xl leading-[0.95] font-bold tracking-[-0.02em] uppercase">
                  Black Country, New Road
                </h3>
                <p className="border-l-2 border-primary pl-2.5 font-mono text-xs tracking-[0.08em] uppercase">
                  Music Hall of Williamsburg
                  <span className="text-muted-foreground"> · Brooklyn</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  <span className={meta}>Highlights</span>
                  <p className="font-mono text-xs leading-relaxed tracking-[0.08em] uppercase">
                    Sunglasses · Basketball Shoes
                  </p>
                </div>
              </TicketBody>
              <TicketTear />
              <TicketStub>
                <span className={meta}>Jun 21 2023 · 9 songs</span>
                <StarRating value={5} readonly size="sm" label="Overall" />
              </TicketStub>
            </Ticket>
            <p className="text-xs text-muted-foreground">
              <code className="font-mono">TicketStub</code> is fixed at{" "}
              <code className="font-mono">h-12</code> to match{" "}
              <code className="font-mono">--tear-offset</code>. If you change one you
              must change the other, or the notches drift off the dashed line.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className={meta}>UserRow · people lists</p>
            <Ticket perforated={false}>
              <TicketBody className="gap-0 p-0">
                <div className="divide-y">
                  <UserRow
                    username="mikemedoro"
                    displayName="Mike Medoro"
                    primary={<span>@mikemedoro</span>}
                    secondary="Brooklyn. Mostly post-rock."
                    action={<Button size="sm">Follow</Button>}
                  />
                  <UserRow
                    username="dana"
                    displayName="Dana Reyes"
                    primary={
                      <>
                        <span className="font-semibold">@dana</span>{" "}
                        <span className="font-normal">started following you</span>
                      </>
                    }
                    meta="2 days ago"
                    action={
                      <Button size="sm" variant="secondary" className="min-w-24">
                        Following
                      </Button>
                    }
                  />
                </div>
              </TicketBody>
            </Ticket>
            <p className="text-xs text-muted-foreground">
              <code className="font-mono">secondary</code> is prose and{" "}
              <code className="font-mono">meta</code> is mono caps. Bios go in the
              first, timestamps in the second.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className={meta}>Form fields and actions</p>
            <Ticket perforated={false}>
              <TicketBody className="gap-5 p-6">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sg-venue">Venue</Label>
                  <Input id="sg-venue" placeholder="e.g. Madison Square Garden" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sg-notes">Notes</Label>
                  <Textarea id="sg-notes" rows={2} placeholder="How was the night?" />
                </div>
                <FormActions
                  destructive={
                    <Button variant="destructive">
                      <Trash2 className="mr-1.5 size-4" />
                      Delete
                    </Button>
                  }
                >
                  <Button>Save changes</Button>
                  <Button variant="outline">Cancel</Button>
                </FormActions>
              </TicketBody>
            </Ticket>
            <p className="text-xs text-muted-foreground">
              Commit and cancel on the left, destructive pushed right so it is not on
              the path to Save. Auth forms are the one exception and keep a full-width
              submit.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className={meta}>Empty state</p>
            <Ticket perforated={false}>
              <TicketBody className="p-0">
                <EmptyState
                  title="Nothing here yet"
                  description="Follow a few friends, or log the last show you went to."
                  action={
                    <>
                      <Button>Log a show</Button>
                      <Button variant="outline">Find people</Button>
                    </>
                  }
                />
              </TicketBody>
            </Ticket>
            <p className="text-xs text-muted-foreground">
              Title is a short display-caps phrase with no full stop. Guidance goes in
              the description.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className={meta}>Ratings</p>
            <div className="flex flex-wrap items-end gap-8 rounded-md border bg-card p-5">
              <div className="flex flex-col gap-2">
                <span className={meta}>Interactive</span>
                <StarRatingDemo />
              </div>
              <div className="flex flex-col gap-2">
                <span className={meta}>Read-only</span>
                <StarRating value={4} readonly label="Overall" />
              </div>
              <div className="flex w-40 flex-col gap-1.5">
                <span className={meta}>Sound</span>
                <span
                  className="flex gap-0.5"
                  role="img"
                  aria-label="Sound: 4 out of 5"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-1 flex-1 rounded-full ${n <= 4 ? "bg-primary" : "bg-border"}`}
                    />
                  ))}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Stars carry the overall score. Sub-ratings use meters, because four more
              rows of stars on one card is 25 identical glyphs. Read-only ratings are
              output, not controls, so they render as an image with a label rather than
              disabled buttons.
            </p>
          </div>
        </div>
      </Section>

      <Section
        n="07"
        title="Writing"
        lede="Copy conventions that keep the interface sounding like one person wrote it."
      >
        <div className="flex flex-col">
          <Row label="Page titles">
            <p className="text-sm">Display caps, no full stop. “Log a show”, not “Log A Show”.</p>
          </Row>
          <Row label="Toasts">
            <p className="text-sm">
              Sentence case, always end in a full stop, never an exclamation mark.
              “Show logged.” not “Show logged!”
            </p>
          </Row>
          <Row label="Separators">
            <p className="text-sm">
              A middle dot (·) between metadata values. No em or en dashes anywhere in
              the interface; they are the most reliable tell of machine-written copy.
            </p>
          </Row>
          <Row label="Empty states">
            <p className="text-sm">
              Short title, then one sentence of guidance that names the next action.
            </p>
          </Row>
        </div>
      </Section>

      <footer className="border-t pt-8">
        <p className="text-xs text-muted-foreground">
          Live at <code className="font-mono">/style-guide</code>. Values are read from{" "}
          <code className="font-mono">app/globals.css</code> in the browser and the
          components are imported from the app, so editing a token or a component
          updates this page automatically.
        </p>
      </footer>
    </div>
  )
}
