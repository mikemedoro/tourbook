"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Music, PlusCircle, LogOut, User, Settings, Search, Bell } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { userAvatarGradient } from "@/lib/utils"
import { toast } from "sonner"

interface NavbarProps {
  user: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
  unreadNotifications?: number
}

export function Navbar({ user, unreadNotifications = 0 }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/")
    router.refresh()
  }

  const initials = user?.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? user?.username.slice(0, 2).toUpperCase()

  return (
    <header className="border-b px-6 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-40">
      <Link href="/feed" className="flex items-center gap-2 font-semibold">
        <Music className="h-5 w-5" />
        Tourbook
      </Link>

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
              <AvatarImage src={user?.avatar_url ?? undefined} />
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
