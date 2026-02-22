import { useGetFollowedUsersStories } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import StoryUploadModal from './StoryUploadModal';
import { useGetUserProfile } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';

export default function StoriesBar() {
  const { data: stories } = useGetFollowedUsersStories();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);

  const filteredStories = stories?.filter(([_, userStories]) => {
    const now = Date.now() * 1_000_000;
    const twentyFourHours = BigInt(24 * 60 * 60 * 1_000_000_000);
    return userStories.some((story) => BigInt(now) - story.timestamp < twentyFourHours);
  }) || [];

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => setShowUpload(true)}
          className="flex flex-col items-center gap-2 shrink-0"
        >
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-muted">
              <AvatarImage src="/assets/generated/default-avatar.dim_200x200.png" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
              <Plus className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">Your Story</span>
        </button>

        {filteredStories.map(([userId, userStories]) => (
          <StoryItem key={userId.toString()} userId={userId.toString()} hasStories={userStories.length > 0} />
        ))}
      </div>

      {showUpload && <StoryUploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}

function StoryItem({ userId, hasStories }: { userId: string; hasStories: boolean }) {
  const { data: profile } = useGetUserProfile(userId);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/stories/$userId', params: { userId } });
  };

  return (
    <button onClick={handleClick} className="flex flex-col items-center gap-2 shrink-0">
      <div className={`p-0.5 rounded-full ${hasStories ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : ''}`}>
        <Avatar className="h-16 w-16 border-2 border-background">
          <AvatarImage src="/assets/generated/default-avatar.dim_200x200.png" />
          <AvatarFallback>{profile?.username?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>
      <span className="text-xs text-muted-foreground max-w-[64px] truncate">
        {profile?.username || 'User'}
      </span>
    </button>
  );
}
