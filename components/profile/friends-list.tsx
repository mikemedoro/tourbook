import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { UserRow } from "@/components/users/user-row"
import { Profile } from "@/types/database"

type FriendProfile = Pick<Profile, "id" | "username" | "display_name">

interface FriendsListProps {
  following: FriendProfile[]
  followers: FriendProfile[]
}

export function FriendsList({ following, followers }: FriendsListProps) {
  return (
    <Tabs defaultValue="following">
      <TabsList>
        <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
        <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="following" className="mt-6">
        {following.length === 0 ? (
          <EmptyState title="Not following anyone yet" className="py-10" />
        ) : (
          <div className="-mx-5 divide-y">
            {following.map((p) => (
              <UserRow
                key={p.id}
                username={p.username}
                displayName={p.display_name}
                secondary={p.display_name ? `@${p.username}` : undefined}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="followers" className="mt-6">
        {followers.length === 0 ? (
          <EmptyState title="No followers yet" className="py-10" />
        ) : (
          <div className="-mx-5 divide-y">
            {followers.map((p) => (
              <UserRow
                key={p.id}
                username={p.username}
                displayName={p.display_name}
                secondary={p.display_name ? `@${p.username}` : undefined}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
