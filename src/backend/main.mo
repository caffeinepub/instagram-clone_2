import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let followersMap = Map.empty<Principal, Set.Set<Principal>>();
  let followingMap = Map.empty<Principal, Set.Set<Principal>>();
  let postsMap = Map.empty<Principal, List.List<Post>>();
  let storiesMap = Map.empty<Principal, List.List<Story>>();

  let messagesMaps = Map.empty<Principal, List.List<MessagePair>>();

  public type UserProfile = {
    username : Text;
    bio : Text;
    profilePicture : Blob;
  };

  public type Post = {
    id : Time.Time;
    content : Storage.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
    likes : Nat;
    comments : [Comment];
  };

  public type Comment = {
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Story = {
    content : Storage.ExternalBlob;
    timestamp : Time.Time;
  };

  public type Message = {
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type MessagePair = {
    messages : [Message];
  };

  module Post {
    public func compare(a : Post, b : Post) : Order.Order {
      Int.compare(b.id, a.id);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Follow/Unfollow Functionality
  public shared ({ caller }) func followUser(userToFollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == userToFollow) {
      Runtime.trap("Cannot follow yourself");
    };

    let callerSet = switch (followersMap.get(userToFollow)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };
    callerSet.add(caller);
    followersMap.add(userToFollow, callerSet);

    let followingSet = switch (followingMap.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };
    followingSet.add(userToFollow);
    followingMap.add(caller, followingSet);
  };

  public shared ({ caller }) func unfollowUser(userToUnfollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    switch (followersMap.get(userToUnfollow)) {
      case (?set) { set.remove(caller) };
      case (null) {};
    };

    switch (followingMap.get(caller)) {
      case (?set) { set.remove(userToUnfollow) };
      case (null) {};
    };
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view followers");
    };

    switch (followersMap.get(user)) {
      case (?set) { set.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view following");
    };

    switch (followingMap.get(user)) {
      case (?set) { set.toArray() };
      case (null) { [] };
    };
  };

  // Feed Functionality
  public query ({ caller }) func getUserFeed() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view feed");
    };

    let following = followingMap.get(caller);
    let posts = List.empty<Post>();

    switch (following) {
      case (?followedUsers) {
        for (user in followedUsers.values()) {
          switch (postsMap.get(user)) {
            case (?userPosts) {
              posts.addAll(userPosts.values());
            };
            case (null) {};
          };
        };
      };
      case (null) {};
    };

    posts.toArray().sort();
  };

  // Post Management
  public shared ({ caller }) func createPost(content : Storage.ExternalBlob, caption : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let post = {
      id = Time.now();
      content;
      caption;
      timestamp = Time.now();
      likes = 0;
      comments = [] : [Comment];
    };

    let userPosts = switch (postsMap.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Post>() };
    };

    userPosts.add(post);
    postsMap.add(caller, userPosts);
  };

  public query ({ caller }) func getUserPosts(user : Principal) : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    switch (postsMap.get(user)) {
      case (?list) { list.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func likePost(author : Principal, postId : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    switch (postsMap.get(author)) {
      case (?userPosts) {
        let updatedPosts = userPosts.map<Post, Post>(
          func(post) {
            if (post.id == postId) {
              { post with likes = post.likes + 1 };
            } else {
              post;
            };
          }
        );
        postsMap.add(author, updatedPosts);
      };
      case (null) {
        Runtime.trap("Post not found");
      };
    };
  };

  public shared ({ caller }) func commentOnPost(author : Principal, postId : Time.Time, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on posts");
    };

    let comment = {
      author = caller;
      content;
      timestamp = Time.now();
    };

    switch (postsMap.get(author)) {
      case (?userPosts) {
        let updatedPosts = userPosts.map<Post, Post>(
          func(post) {
            if (post.id == postId) {
              let newComments = List.fromArray<Comment>(post.comments);
              newComments.add(comment);
              { post with comments = newComments.toArray() };
            } else {
              post;
            };
          }
        );
        postsMap.add(author, updatedPosts);
      };
      case (null) {
        Runtime.trap("Post not found");
      };
    };
  };

  // Stories Functionality
  public shared ({ caller }) func postStory(content : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post stories");
    };

    let story = {
      content;
      timestamp = Time.now();
    };

    let userStories = switch (storiesMap.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Story>() };
    };

    userStories.add(story);
    storiesMap.add(caller, userStories);
  };

  public query ({ caller }) func getFollowedUsersStories() : async [(Principal, [Story])] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories");
    };

    let following = followingMap.get(caller);
    let result = List.empty<(Principal, [Story])>();
    let now = Time.now();
    let twentyFourHours = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds

    switch (following) {
      case (?followedUsers) {
        for (user in followedUsers.values()) {
          switch (storiesMap.get(user)) {
            case (?stories) {
              // Filter stories that are less than 24 hours old
              let recentStories = stories.filter(
                func(story : Story) : Bool {
                  (now - story.timestamp) < twentyFourHours;
                }
              );
              if (recentStories.size() > 0) {
                result.add((user, recentStories.toArray()));
              };
            };
            case (null) {};
          };
        };
      };
      case (null) {};
    };

    result.toArray();
  };

  // Direct Messaging
  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (caller == receiver) {
      Runtime.trap("Cannot send message to yourself");
    };

    let message = {
      sender = caller;
      receiver;
      content;
      timestamp = Time.now();
    };

    // Store message in both directions for easier retrieval
    let key1 = caller;
    let key2 = receiver;

    let existingMessages1 = switch (messagesMaps.get(key1)) {
      case (?list) { list };
      case (null) { List.empty<MessagePair>() };
    };
    // Update messages for both users
    let messagePair = { messages = [message] };
    existingMessages1.add(messagePair);
    messagesMaps.add(key1, existingMessages1);

    let existingMessages2 = switch (messagesMaps.get(key2)) {
      case (?list) { list };
      case (null) { List.empty<MessagePair>() };
    };
    existingMessages2.add(messagePair);
    messagesMaps.add(key2, existingMessages2);
  };

  public query ({ caller }) func getMessages(withUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    // User can only view messages they are part of
    let messages = switch (messagesMaps.get(caller)) {
      case (?list) {
        let messageIter = list.values();
        let allMessages = messageIter.toArray();
        let filteredMessages = allMessages.filter(
          func(messagePair) {
            let messageIter = messagePair.messages.values();
            messageIter.any(
              func(message) {
                message.sender == withUser or message.receiver == withUser;
              }
            );
          }
        );
        filteredMessages;
      };
      case (null) { [] };
    };
    [] : [Message];
  };

  // Explore Page - Get posts from all users (public content discovery)
  public query ({ caller }) func getExplorePosts(limit : Nat) : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can explore posts");
    };

    let allPosts = List.empty<Post>();
    for (userPosts in postsMap.values()) {
      allPosts.addAll(userPosts.values());
    };

    let sortedPosts = allPosts.toArray().sort();

    // Return limited number of posts
    if (sortedPosts.size() <= limit) {
      sortedPosts;
    } else {
      Array.tabulate<Post>(limit, func(i) { sortedPosts[i] });
    };
  };
};
