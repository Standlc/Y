import { FastifyReply } from "fastify";
import { Following, Like, Post, User } from "./schema";
import { Insertable, Selectable } from "kysely";

export type jwtSignType = (user: Selectable<User>, res: FastifyReply) => string;

export type NewUser = Insertable<User>;
export type NewLike = Insertable<Like>;
export type NewFollowing = Insertable<Following>;

export type NewPost = {
  caption: string;
  photoUrl?: string | null;
};

export type AppUser = {
  bio: string | null;
  createdAt: Date;
  id: number;
  profilePictureUrl: string | null;
  username: string;
};

export type NewReply = {
  caption?: string | null | undefined;
  photoUrl?: string | null | undefined;
  replyTargetId: number;
};

export type AppPost = Selectable<Post> & {
  authorUsername: string;
  authorPP: string | null;
  likesCount: number | null;
  isPostLikedByUser: number | null;
  repliesCount: number | null;
  isAuthorFollowedByUser: number | null;
  repliesUsersPP: { value: string | null }[] | null;
};

export type AppProfile = {
  followings: number | null;
  followers: number | null;
  isUserFollowedByUser: number | null;
  createdAt: Date;
  bio: string | null;
  id: number;
  profilePictureUrl: string | null;
  username: string;
  postsCount: number | null;
};
