import { useGetFollowing, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@tanstack/react-router';
import { Loader2, MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const { identity } = useInternetIdentity();
  const currentUserId = identity?.getPrincipal().toString() || '';
  const { data: following, isLoading } = useGetFollowing(currentUserId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      {following && following.length > 0 ? (
        <div className="space-y-2">
          {following.map((principal) => (
            <ConversationItem key={principal.toString()} userId={principal.toString()} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-2">Follow users to start messaging</p>
        </div>
      )}
    </div>
  );
}

function ConversationItem({ userId }: { userId: string }) {
  const { data: profile } = useGetUserProfile(userId);

  return (
    <Link
      to={`/messages/${userId}`}
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src="/assets/generated/default-avatar.dim_200x200.png" />
        <AvatarFallback>{profile?.username?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-semibold">{profile?.username || 'User'}</p>
        <p className="text-sm text-muted-foreground">Click to message</p>
      </div>
    </Link>
  );
}
