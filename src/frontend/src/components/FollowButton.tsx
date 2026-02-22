import { Button } from '@/components/ui/button';
import { useFollowUser, useUnfollowUser, useGetFollowing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
}

export default function FollowButton({ userId }: FollowButtonProps) {
  const { identity } = useInternetIdentity();
  const currentUserId = identity?.getPrincipal().toString() || '';
  const { data: following } = useGetFollowing(currentUserId);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isFollowing = following?.some((p) => p.toString() === userId) || false;
  const isPending = followUser.isPending || unfollowUser.isPending;

  const handleClick = async () => {
    if (isFollowing) {
      await unfollowUser.mutateAsync(userId);
    } else {
      await followUser.mutateAsync(userId);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}
