import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button contract — pick by intent, not by appearance.
 *
 *   default      The one commit action in a view. Max one per screen region.
 *                Log show · Save changes · Sign in · Follow
 *   outline      Alternative or escape route sitting beside a primary.
 *                Cancel · Log in · Load more · Find people
 *   secondary    A toggled-ON state, not an action. Reads as "already done".
 *                Following · Selected
 *   ghost        Low-emphasis chrome: icon-only nav, row affordances.
 *   destructive  Anything that deletes. Never hand-roll with text-destructive.
 *   link         Inline text navigation only.
 *
 * Size:
 *   lg       marketing surfaces only (landing)
 *   default  page-level and form actions
 *   sm       dense contexts — list rows, card actions, the sticky navbar
 *   icon*    icon-only, matched to the neighbouring control's height
 */
const buttonVariants = cva(
  // Display caps in Instrument Sans, matching the headings and the mono-caps
  // metadata. Sentence-case Geist was the only lowercase type in the app and
  // made every button read as a stock component dropped into the layout.
  "group/button font-heading inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-[0.8125rem] font-bold tracking-[0.045em] whitespace-nowrap uppercase transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:brightness-[0.95] active:brightness-[0.9]",
        // bg-card, not bg-background: the page is bone and the card surface is
        // near-white, so this is what makes an outline button read as raised.
        outline:
          "border-border bg-card shadow-xs hover:bg-card/60 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-[0.96] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        // Low-emphasis destructive: a Delete sitting in a form footer next to
        // Save shouldn't outshout it. The confirm inside the dialog is where
        // the weight belongs — that uses destructive-solid.
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        "destructive-solid":
          "bg-destructive text-destructive-foreground shadow-xs hover:brightness-[0.95] active:brightness-[0.9] focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-11 gap-2 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
