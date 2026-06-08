import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { userAvatarGradient, getInitials } from "@/lib/utils"
import { Profile } from "@/types/database"

type FriendProfile = Pick<Profile, "id" | "username" | "display_name" | "avatar_url">

interface FriendsListProps {
  following: FriendProfile[]
  followers: FriendProfile[]
}

function FriendCard({ profile }: { profile: FriendProfile }) {
  const initials = getInitials(profile.display_name, profile.username)

  return (
    <Link
      href={`/profile/${profile.username}`}
      className="flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback style={userAvatarGradient(profile.username)}>{initials}</AvatarFallback>
      </Avatar>
      <div>
        {profile.display_name && (
          <p className="text-sm font-semibold leading-tight">{profile.display_name}</p>
        )}
        <p
          className={
            profile.display_name
              ? "text-xs text-muted-foreground"
              : "text-sm font-semibold"
          }
        >
          @{profile.username}
        </p>
      </div>
    </Link>
  )
}

export function FriendsList({ following, followers }: FriendsListProps) {
  return (
    <Tabs defaultValue="following">
      <TabsList>
        <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
        <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="following" className="mt-4">
        {following.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not following anyone yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {following.map((p) => (
              <FriendCard key={p.id} profile={p} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="followers" className="mt-4">
        {followers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No followers yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {followers.map((p) => (
              <FriendCard key={p.id} profile={p} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
