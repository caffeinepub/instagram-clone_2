import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetFollowers, useGetFollowing, useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import FollowButton from './FollowButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface FollowListModalProps {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

export default function FollowListModal({ userId, type, onClose }: FollowListModalProps) {
  const { data: followers, isLoading: followersLoading } = useGetFollowers(userId);
  const { data: following, isLoading: followingLoading } = useGetFollowing(userId);
  const { identity } = useInternetIdentity();

  const list = type === 'followers' ? followers : following;
  const isLoading = type === 'followers' ? followersLoading : followingLoading;
  const currentUserId = identity?.getPrincipal().toString();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'followers' ? 'Followers' : 'Following'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : list && list.length > 0 ? (
            list.map((principal) => (
              <UserListItem
                key={principal.toString()}
                userId={principal.toString()}
                showFollowButton={currentUserId !== principal.toString()}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No {type} yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserListItem({ userId, showFollowButton }: { userId: string; showFollowButton: boolean }) {
  const { data: profile } = useGetUserProfile(userId);

  return (
    <div className="flex items-center justify-between">
      <Link to={`/profile/${userId}`} className="flex items-center gap-3 flex-1">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/assets/generated/default-avatar.dim_200x200.png" />
          <AvatarFallback>{profile?.username?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{profile?.username || 'User'}</p>
          {profile?.bio && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{profile.bio}</p>
          )}
        </div>
      </Link>
      {showFollowButton && <FollowButton userId={userId} />}
    </div>
  );
}
