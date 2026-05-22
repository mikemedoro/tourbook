"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Profile } from "@/types/database"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { userAvatarGradient } from "@/lib/utils"

interface ProfileHeaderProps {
  profile: Profile
  isOwner: boolean
  isFollowing: boolean
  currentUserId?: string
}

export function ProfileHeader({
  profile,
  isOwner,
  isFollowing,
  currentUserId,
}: ProfileHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [following, setFollowing] = useState(isFollowing)
  const [loading, setLoading] = useState(false)

  const initials = profile.display_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? profile.username.slice(0, 2).toUpperCase()

  async function toggleFollow() {
    if (!currentUserId) {
      router.push("/login")
      return
    }
    setLoading(true)

    if (following) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", profile.id)
      setFollowing(false)
      toast.success(`Unfollowed ${profile.username}`)
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: profile.id })
      setFollowing(true)
      toast.success(`Following ${profile.username}`)
    }

    setLoading(false)
  }

  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback className="text-xl" style={userAvatarGradient(profile.username)}>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {profile.display_name && (
          <p className="text-xl font-bold">{profile.display_name}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className={profile.display_name ? "text-sm font-medium text-muted-foreground" : "text-xl font-bold"}>
            @{profile.username}
          </h1>
          {!profile.is_public && (
            <Badge variant="outline" className="text-xs">Private</Badge>
          )}
        </div>
        {profile.bio && (
          <p className="text-sm mt-2 max-w-prose">{profile.bio}</p>
        )}
      </div>

      {isOwner ? (
        <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Edit profile
        </Link>
      ) : (
        <Button
          variant={following ? "outline" : "default"}
          size="sm"
          onClick={toggleFollow}
          disabled={loading}
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      )}
    </div>
  )
}
