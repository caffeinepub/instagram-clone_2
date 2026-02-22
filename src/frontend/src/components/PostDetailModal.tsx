import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Post } from '../backend';
import PostCard from './PostCard';

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <PostCard post={post} />
      </DialogContent>
    </Dialog>
  );
}
