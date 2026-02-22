import { useParams, Link } from '@tanstack/react-router';
import { useGetUserProfile, useGetUserPosts, useGetFollowers, useGetFollowing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Settings } from 'lucide-react';
import PostGrid from '../components/PostGrid';
import FollowButton from '../components/FollowButton';
import { useState } from 'react';
import ProfileEditModal from '../components/ProfileEditModal';
import FollowListModal from '../components/FollowListModal';

export default function ProfilePage() {
  const { userId } = useParams({ from: '/profile/$userId' });
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(userId);
  const { data: posts, isLoading: postsLoading } = useGetUserPosts(userId);
  const { data: followers } = useGetFollowers(userId);
  const { data: following } = useGetFollowing(userId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const currentUserId = identity?.getPrincipal().toString();
  const isOwnProfile = currentUserId === userId;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-12">
        <Avatar className="h-32 w-32 border-4 border-border">
          <AvatarImage src="/assets/generated/default-avatar.dim_200x200.png" />
          <AvatarFallback className="text-4xl">{profile.username[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {isOwnProfile ? (
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <FollowButton userId={userId} />
            )}
          </div>

          <div className="flex gap-8">
            <div>
              <span className="font-semibold">{posts?.length || 0}</span>
              <span className="text-muted-foreground ml-1">posts</span>
            </div>
            <button onClick={() => setShowFollowersModal(true)} className="hover:text-foreground">
              <span className="font-semibold">{followers?.length || 0}</span>
              <span className="text-muted-foreground ml-1">followers</span>
            </button>
            <button onClick={() => setShowFollowingModal(true)} className="hover:text-foreground">
              <span className="font-semibold">{following?.length || 0}</span>
              <span className="text-muted-foreground ml-1">following</span>
            </button>
          </div>

          {profile.bio && (
            <p className="text-sm text-foreground whitespace-pre-wrap">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      {postsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : posts && posts.length > 0 ? (
        <PostGrid posts={posts} />
      ) : (
        <div className="text-center py-12">
          <img src="/assets/generated/empty-posts.dim_300x300.png" alt="No posts" className="mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No posts yet</p>
        </div>
      )}

      {showEditModal && <ProfileEditModal onClose={() => setShowEditModal(false)} />}
      {showFollowersModal && <FollowListModal userId={userId} type="followers" onClose={() => setShowFollowersModal(false)} />}
      {showFollowingModal && <FollowListModal userId={userId} type="following" onClose={() => setShowFollowingModal(false)} />}
    </div>
  );
}
