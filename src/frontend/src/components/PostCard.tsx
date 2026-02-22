import { useState } from 'react';
import { useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@tanstack/react-router';
import type { Post } from '../backend';
import PostInteractions from './PostInteractions';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [authorId] = useState(() => {
    return post.comments[0]?.author.toString() || '';
  });
  const { data: authorProfile } = useGetUserProfile(authorId);

  const timestamp = Number(post.timestamp) / 1_000_000;
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  const imageUrl = post.content.getDirectURL();

  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <Link to={`/profile/${authorId}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/assets/generated/default-avatar.dim_200x200.png" />
            <AvatarFallback>{authorProfile?.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link to={`/profile/${authorId}`} className="font-semibold text-sm hover:underline">
            {authorProfile?.username || 'User'}
          </Link>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <img src={imageUrl} alt={post.caption} className="w-full h-full object-cover" />
      </div>

      {/* Interactions */}
      <PostInteractions post={post} authorId={authorId} />

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-4">
          <p className="text-sm">
            <Link to={`/profile/${authorId}`} className="font-semibold mr-2 hover:underline">
              {authorProfile?.username || 'User'}
            </Link>
            {post.caption}
          </p>
        </div>
      )}
    </article>
  );
}
