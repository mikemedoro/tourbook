"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FriendsList } from "@/components/profile/friends-list"
import { Profile } from "@/types/database"

type FriendProfile = Pick<Profile, "id" | "username" | "display_name">

interface FriendsDialogProps {
  following: FriendProfile[]
  followers: FriendProfile[]
}

export function FriendsDialog({ following, followers }: FriendsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        nativeButton={false}
        render={<span className="cursor-pointer" />}
        className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <span className="font-semibold text-foreground">{following.length}</span>{" "}
        following
        {" · "}
        <span className="font-semibold text-foreground">{followers.length}</span>{" "}
        followers
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Friends</DialogTitle>
        <FriendsList following={following} followers={followers} />
      </DialogContent>
    </Dialog>
  )
}
