import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Comment {
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface Story {
    content: ExternalBlob;
    timestamp: Time;
}
export interface Post {
    id: Time;
    content: ExternalBlob;
    likes: bigint;
    timestamp: Time;
    caption: string;
    comments: Array<Comment>;
}
export interface Message {
    content: string;
    sender: Principal;
    timestamp: Time;
    receiver: Principal;
}
export interface UserProfile {
    bio: string;
    username: string;
    profilePicture: Uint8Array;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    commentOnPost(author: Principal, postId: Time, content: string): Promise<void>;
    createPost(content: ExternalBlob, caption: string): Promise<void>;
    followUser(userToFollow: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExplorePosts(limit: bigint): Promise<Array<Post>>;
    getFollowedUsersStories(): Promise<Array<[Principal, Array<Story>]>>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getMessages(withUser: Principal): Promise<Array<Message>>;
    getUserFeed(): Promise<Array<Post>>;
    getUserPosts(user: Principal): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(author: Principal, postId: Time): Promise<void>;
    postStory(content: ExternalBlob): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, content: string): Promise<void>;
    unfollowUser(userToUnfollow: Principal): Promise<void>;
}
