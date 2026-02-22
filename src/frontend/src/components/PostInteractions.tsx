import { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLikePost } from '../hooks/useQueries';
import type { Post } from '../backend';
import CommentSection from './CommentSection';
import { toast } from 'sonner';

interface PostInteractionsProps {
  post: Post;
  authorId: string;
}

export default function PostInteractions({ post, authorId }: PostInteractionsProps) {
  const [showComments, setShowComments] = useState(false);
  const likePost = useLikePost();

  const handleLike = async () => {
    await likePost.mutateAsync({ author: authorId, postId: post.id });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#/profile/${authorId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={likePost.isPending}
          className="p-0 h-auto hover:bg-transparent"
        >
          <Heart className="h-6 w-6 hover:text-red-500 transition-colors" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="p-0 h-auto hover:bg-transparent"
        >
          <MessageCircle className="h-6 w-6 hover:text-blue-500 transition-colors" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="p-0 h-auto hover:bg-transparent"
        >
          <Share2 className="h-6 w-6 hover:text-green-500 transition-colors" />
        </Button>
      </div>

      <div className="text-sm font-semibold">
        {Number(post.likes)} likes
      </div>

      {post.comments.length > 0 && !showComments && (
        <button
          onClick={() => setShowComments(true)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all {post.comments.length} comments
        </button>
      )}

      {showComments && <CommentSection post={post} authorId={authorId} />}
    </div>
  );
}
