"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { PlusCircle, LogOut, User, Settings, Search, Bell } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { cn, userAvatarGradient, getInitials } from "@/lib/utils"
import { toast } from "sonner"

interface NavbarProps {
  user: {
    username: string
    display_name: string | null
  } | null
  unreadNotifications?: number
}

export function Navbar({ user, unreadNotifications = 0 }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/")
    router.refresh()
  }

  const initials = user ? getInitials(user.display_name, user.username) : undefined

  return (
    <header className="border-b px-5 py-4 sm:px-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-40">
      <div className="flex items-center gap-5">
        <Link href="/feed" aria-label="Tourbook home" className="shrink-0">
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-4">
          {[{ href: "/feed", label: "Feed" }].map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-mono text-[11px] tracking-[0.12em] uppercase transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <Link href="/find" aria-label="Find people" className={buttonVariants({ variant: "ghost", size: "sm" })} title="Find people">
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/notifications" aria-label={unreadNotifications > 0 ? `Notifications (${unreadNotifications} unread)` : "Notifications"} className={buttonVariants({ variant: "ghost", size: "sm" })} title="Notifications">
            <span className="relative">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2.5 h-4 min-w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center px-0.5 leading-none">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </span>
          </Link>
        </div>
        <Link href="/log-show" className={buttonVariants({ size: "sm" })}>
          <PlusCircle className="h-4 w-4 sm:mr-1.5" />
          <span className="max-sm:sr-only">Log show</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs" style={user ? userAvatarGradient(user.username) : undefined}>{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem render={<Link href={`/profile/${user?.username}`} />}>
              <User className="h-4 w-4 mr-2" />
              My profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="h-4 w-4 mr-2" />
              Edit profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
