import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile, Post, Story, Message, Comment } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!actor) return null;
      const principal = Principal.fromText(userId);
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error(error);
    },
  });
}

// Feed Queries
export function useGetUserFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['userFeed'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserFeed();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserPosts(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      if (!actor) return [];
      const principal = Principal.fromText(userId);
      return actor.getUserPosts(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, caption }: { content: ExternalBlob; caption: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createPost(content, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFeed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explorePosts'] });
      toast.success('Post created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create post');
      console.error(error);
    },
  });
}

// Post Interactions
export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ author, postId }: { author: string; postId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(author);
      await actor.likePost(principal, postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFeed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explorePosts'] });
    },
    onError: (error) => {
      toast.error('Failed to like post');
      console.error(error);
    },
  });
}

export function useCommentOnPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ author, postId, content }: { author: string; postId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(author);
      await actor.commentOnPost(principal, postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFeed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explorePosts'] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error(error);
    },
  });
}

// Follow/Unfollow
export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToFollow: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userToFollow);
      await actor.followUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userFeed'] });
      toast.success('User followed');
    },
    onError: (error) => {
      toast.error('Failed to follow user');
      console.error(error);
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToUnfollow: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userToUnfollow);
      await actor.unfollowUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['userFeed'] });
      toast.success('User unfollowed');
    },
    onError: (error) => {
      toast.error('Failed to unfollow user');
      console.error(error);
    },
  });
}

export function useGetFollowers(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!actor) return [];
      const principal = Principal.fromText(userId);
      return actor.getFollowers(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useGetFollowing(userId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['following', userId],
    queryFn: async () => {
      if (!actor) return [];
      const principal = Principal.fromText(userId);
      return actor.getFollowing(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

// Stories
export function usePostStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.postStory(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success('Story posted');
    },
    onError: (error) => {
      toast.error('Failed to post story');
      console.error(error);
    },
  });
}

export function useGetFollowedUsersStories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[Principal, Story[]][]>({
    queryKey: ['stories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowedUsersStories();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Messages
export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, content }: { receiver: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(receiver);
      await actor.sendMessage(principal, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message sent');
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error(error);
    },
  });
}

export function useGetMessages(withUser: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', withUser],
    queryFn: async () => {
      if (!actor) return [];
      const principal = Principal.fromText(withUser);
      return actor.getMessages(principal);
    },
    enabled: !!actor && !actorFetching && !!withUser,
  });
}

// Explore
export function useGetExplorePosts(limit: number = 30) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['explorePosts', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExplorePosts(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}
