"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FollowButton } from "@/components/follows/follow-button"
import { Profile } from "@/types/database"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { userAvatarGradient, getInitials } from "@/lib/utils"

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
  const initials = getInitials(profile.display_name, profile.username)

  return (
    <div className="flex items-start gap-4">
      <Avatar className="size-16">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback className="text-xl" style={userAvatarGradient(profile.username)}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        {profile.display_name && (
          <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] uppercase">
            {profile.display_name}
          </h1>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {profile.display_name ? (
            <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              @{profile.username}
            </p>
          ) : (
            <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] uppercase">
              @{profile.username}
            </h1>
          )}
          {!profile.is_public && (
            <Badge variant="outline" className="text-xs">
              Private
            </Badge>
          )}
        </div>
        {profile.bio && <p className="mt-2 max-w-prose text-sm">{profile.bio}</p>}
      </div>

      {isOwner ? (
        <Link
          href="/settings"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Edit profile
        </Link>
      ) : (
        <FollowButton
          targetUserId={profile.id}
          username={profile.username}
          initialFollowing={isFollowing}
          onRequireAuth={currentUserId ? undefined : () => router.push("/login")}
        />
      )}
    </div>
  )
}
