import { useState, useEffect, useRef } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetMessages, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import MessageBubble from '../components/MessageBubble';

export default function MessageThreadPage() {
  const { userId } = useParams({ from: '/messages/$userId' });
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetUserProfile(userId);
  const { data: messages, isLoading } = useGetMessages(userId);
  const sendMessage = useSendMessage();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = identity?.getPrincipal().toString() || '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage.mutateAsync({ receiver: userId, content: message.trim() });
    setMessage('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/assets/generated/default-avatar.dim_200x200.png" />
          <AvatarFallback>{profile?.username?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{profile?.username || 'User'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              isOwn={msg.sender.toString() === currentUserId}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-border">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" disabled={sendMessage.isPending || !message.trim()}>
          {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
