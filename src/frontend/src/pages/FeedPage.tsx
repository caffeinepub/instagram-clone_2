import { useGetUserFeed } from '../hooks/useQueries';
import PostCard from '../components/PostCard';
import StoriesBar from '../components/StoriesBar';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
  const { data: posts, isLoading } = useGetUserFeed();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StoriesBar />
      
      <div className="space-y-8 mt-8">
        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id.toString()} post={post} />)
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Follow some users to see their posts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
