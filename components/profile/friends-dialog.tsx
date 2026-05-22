"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FriendsList } from "@/components/profile/friends-list"
import { Profile } from "@/types/database"

type FriendProfile = Pick<Profile, "id" | "username" | "display_name" | "avatar_url">

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
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
