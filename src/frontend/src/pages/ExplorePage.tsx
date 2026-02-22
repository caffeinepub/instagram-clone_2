import { useGetExplorePosts } from '../hooks/useQueries';
import PostGrid from '../components/PostGrid';
import { Loader2 } from 'lucide-react';

export default function ExplorePage() {
  const { data: posts, isLoading } = useGetExplorePosts(30);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Explore</h1>
      {posts && posts.length > 0 ? (
        <PostGrid posts={posts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts to explore yet</p>
        </div>
      )}
    </div>
  );
}
