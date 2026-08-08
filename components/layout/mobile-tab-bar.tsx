"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusCircle, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileTabBarProps {
  unreadNotifications?: number
}

export function MobileTabBar({ unreadNotifications = 0 }: MobileTabBarProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <TabLink href="/feed" label="Feed" icon={Home} active={isActive("/feed")} />
      <TabLink href="/find" label="Find" icon={Search} active={isActive("/find")} />
      <TabLink
        href="/notifications"
        label="Alerts"
        icon={Bell}
        active={isActive("/notifications")}
        badge={unreadNotifications}
      />
      <TabLink href="/log-show" label="Log" icon={PlusCircle} active={isActive("/log-show")} highlight />
    </nav>
  )
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  highlight,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  badge?: number
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-16 flex-col items-center justify-center gap-1",
        highlight || active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span className="relative">
        {highlight ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Icon className="h-5 w-5" />
          </span>
        ) : (
          <Icon className="h-5 w-5" />
        )}
        {!!badge && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] leading-none text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className="font-mono text-[9px] tracking-[0.1em] uppercase">{label}</span>
    </Link>
  )
}
