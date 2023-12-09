import { FastifyReply } from "fastify";
import { Reply, Following, Like, Post, User } from "./schema";
import { Insertable, Selectable } from "kysely";

export type jwtSignType = (user: Selectable<User>, res: FastifyReply) => string;

export type NewUser = Insertable<User>;
export type NewPost = Insertable<Post>;
export type NewReply = Insertable<Reply>;
export type NewLike = Insertable<Like>;
export type NewFollowing = Insertable<Following>;

export type AppPost = Selectable<Post> & {
  authorUsername: string;
  authorId: number;
  authorPP: string | undefined;
  likes: {
    likesCount: number;
    isPostLikedByUser: number;
  };
  repliesCount: number;
};
