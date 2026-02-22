import { useState } from 'react';
import type { Post } from '../backend';
import PostDetailModal from './PostDetailModal';

interface PostGridProps {
  posts: Post[];
}

export default function PostGrid({ posts }: PostGridProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {posts.map((post) => (
          <button
            key={post.id.toString()}
            onClick={() => setSelectedPost(post)}
            className="aspect-square bg-muted overflow-hidden hover:opacity-80 transition-opacity"
          >
            <img
              src={post.content.getDirectURL()}
              alt={post.caption}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}
