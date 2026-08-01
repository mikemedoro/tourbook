import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Ticket — the app's primary surface, shaped after the perforated stub in the
 * Tourbook logo. Compose as:
 *
 *   <Ticket>
 *     <TicketBody>…</TicketBody>
 *     <TicketTear />
 *     <TicketStub>…</TicketStub>
 *   </Ticket>
 *
 * TicketStub is fixed-height so it lines up with the notches cut by
 * `.ticket-perforated` (see --tear-offset in globals.css).
 */
function Ticket({
  className,
  perforated = true,
  ...props
}: React.ComponentProps<"div"> & { perforated?: boolean }) {
  return (
    <div className="filter-[drop-shadow(0_2px_3px_var(--ticket-shadow))]">
      <div
        data-slot="ticket"
        className={cn(
          "relative flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground",
          // Without a stub there is no tear line, and the notches would sit on
          // the bottom edge as stray nicks — so drop the mask entirely.
          perforated && "ticket-perforated",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TicketBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ticket-body"
      className={cn("flex flex-1 flex-col gap-5 p-6", className)}
      {...props}
    />
  )
}

/** The perforation. Inset so it stops short of the notches on either edge. */
function TicketTear({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ticket-tear"
      aria-hidden="true"
      className={cn("mx-4 border-t border-dashed border-border", className)}
      {...props}
    />
  )
}

function TicketStub({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ticket-stub"
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-3 px-6",
        className
      )}
      {...props}
    />
  )
}

export { Ticket, TicketBody, TicketTear, TicketStub }
