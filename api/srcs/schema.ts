import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Following {
  createdAt: Generated<Timestamp>;
  sourceId: number;
  targetId: number;
}

export interface Like {
  createdAt: Generated<Timestamp>;
  postId: number;
  userId: number;
}

export interface Post {
  authorId: number;
  caption: string;
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  photoUrl: string | null;
  updatedAt: Generated<Timestamp>;
}

export interface Reply {
  authorId: number;
  content: string | null;
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  postId: number;
  updatedAt: Generated<Timestamp>;
}

export interface User {
  bio: string | null;
  createdAt: Generated<Timestamp>;
  id: Generated<number>;
  password: string;
  profilePictureUrl: string | null;
  username: string;
}

export interface DB {
  following: Following;
  like: Like;
  post: Post;
  reply: Reply;
  user: User;
}
