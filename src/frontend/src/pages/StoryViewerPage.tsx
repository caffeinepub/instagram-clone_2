import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetFollowedUsersStories, useGetUserProfile } from '../hooks/useQueries';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StoryViewerPage() {
  const { userId } = useParams({ from: '/stories/$userId' });
  const { data: allStories } = useGetFollowedUsersStories();
  const { data: profile } = useGetUserProfile(userId);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const userStories = allStories?.find(([id]) => id.toString() === userId)?.[1] || [];

  useEffect(() => {
    if (userStories.length === 0) {
      navigate({ to: '/feed' });
      return;
    }

    const timer = setTimeout(() => {
      if (currentIndex < userStories.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        navigate({ to: '/feed' });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, userStories.length, navigate]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < userStories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate({ to: '/feed' });
    }
  };

  const handleClose = () => {
    navigate({ to: '/feed' });
  };

  if (userStories.length === 0) {
    return null;
  }

  const currentStory = userStories[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {userStories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-white transition-all ${idx === currentIndex ? 'w-full' : idx < currentIndex ? 'w-full' : 'w-0'}`}
              style={{ transitionDuration: idx === currentIndex ? '5s' : '0s' }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20" />
          <span className="text-white font-semibold">{profile?.username || 'User'}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Story content */}
      <img
        src={currentStory.content.getDirectURL()}
        alt="Story"
        className="max-h-full max-w-full object-contain"
      />

      {/* Navigation */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2"
      >
        <ChevronRight className="h-8 w-8" />
      </button>
    </div>
  );
}
