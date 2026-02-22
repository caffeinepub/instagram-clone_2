import { useState } from 'react';
import { useCommentOnPost, useGetUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Post } from '../backend';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface CommentSectionProps {
  post: Post;
  authorId: string;
}

export default function CommentSection({ post, authorId }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const commentOnPost = useCommentOnPost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await commentOnPost.mutateAsync({
      author: authorId,
      postId: post.id,
      content: comment.trim(),
    });
    setComment('');
  };

  return (
    <div className="space-y-3 border-t border-border pt-3">
      {post.comments.map((c, idx) => (
        <CommentItem key={idx} comment={c} />
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button type="submit" disabled={commentOnPost.isPending || !comment.trim()} size="sm">
          {commentOnPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
        </Button>
      </form>
    </div>
  );
}

function CommentItem({ comment }: { comment: any }) {
  const { data: profile } = useGetUserProfile(comment.author.toString());
  const timestamp = Number(comment.timestamp) / 1_000_000;
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div className="text-sm">
      <span className="font-semibold mr-2">{profile?.username || 'User'}</span>
      <span className="text-foreground">{comment.content}</span>
      <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
    </div>
  );
}
