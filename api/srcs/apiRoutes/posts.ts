import { FastifyPluginAsync } from "fastify";
import { AppPost, NewPost } from "../types";
import { db } from "../database";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { ExpressionBuilder, Kysely } from "kysely";
import { DB } from "../schema";

export interface IUserIdParams {
  userid: number;
}

const checkPostExists = async (postId: number) => {
  const post = await db
    .selectFrom("post")
    .where("id", "=", postId)
    .select("post.id")
    .executeTakeFirst();
  return post != undefined;
};

const postsRoutes: FastifyPluginAsync = async (app, options) => {
  app.post<{ Body: NewPost }>(
    "/",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppPost> => {
      try {
        const newPost = await db
          .insertInto("post")
          .values({
            authorId: req.user.id,
            ...req.body,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        const user = await db
          .selectFrom("user")
          .where("user.id", "=", newPost.authorId)
          .select("profilePictureUrl")
          .executeTakeFirstOrThrow();

        const appPost: AppPost = {
          ...newPost,
          authorUsername: req.user.username,
          authorId: req.user.id,
          authorPP: user.profilePictureUrl,
          likesCount: 0,
          isPostLikedByUser: 0,
          repliesCount: 0,
          isAuthorFollowedByUser: 0,
          repliesUsersPP: [],
        };
        return appPost;
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );

  app.delete<{ Params: { postid: number } }>(
    "/:postid",
    { preHandler: app.verifyJwt },
    async (req, res) => {
      try {
        if (!(await checkPostExists(req.params.postid))) {
          return res.status(404).send("Post Does Not Exist");
        }

        await db
          .deleteFrom("post")
          .where("post.id", "=", req.params.postid)
          .execute();
        return res.status(200).send("Post Has Been Deleted");
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );

  app.get<{ Params: { userid: number } }>(
    "/all/:userid",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppPost[]> => {
      try {
        const posts = db
          .selectFrom("post")
          .where("post.authorId", "=", req.params.userid)
          .where("post.replySourceTargetId", "is", null)
          .innerJoin("user", "user.id", "post.authorId")
          .select([
            "user.username as authorUsername",
            "user.profilePictureUrl as authorPP",
            "user.id as authorId",
          ])
          .selectAll("post")
          .select((eb) =>
            eb
              .selectFrom("like")
              .whereRef("like.postId", "=", "post.id")
              .select((eb) => eb.fn.countAll<number>().as("likesCount"))
              .as("likesCount")
          )
          .select((eb) =>
            eb
              .selectFrom("like")
              .whereRef("like.postId", "=", "post.id")
              .select((eb) =>
                eb.fn
                  .countAll<number>()
                  .filterWhere("like.userId", "=", req.user.id)
                  .as("isPostLikedByUser")
              )
              .as("isPostLikedByUser")
          )
          .select((eb) =>
            eb
              .selectFrom("thread")
              .where((eb) => eb("post.id", "=", eb.fn.any("thread.postIds")))
              .select((eb) => eb.fn.countAll<number>().as("repliesCount"))
              .as("repliesCount")
          )
          .select((eb) =>
            jsonArrayFrom(
              eb
                .selectFrom("thread")
                .where((eb) => eb("post.id", "=", eb.fn.any("thread.postIds")))
                .innerJoin(
                  "user as replyAuthor",
                  "replyAuthor.id",
                  "thread.authorId"
                )
                .select("replyAuthor.profilePictureUrl as value")
                .distinct()
                .limit(3)
            ).as("repliesUsersPP")
          )
          .select((eb) =>
            eb
              .selectFrom("following")
              .whereRef("targetId", "=", "post.authorId")
              .where("sourceId", "=", req.user.id)
              .select((eb) =>
                eb.fn.countAll<number>().as("isAuthorFollowedByUser")
              )
              .as("isAuthorFollowedByUser")
          )
          .distinctOn(["post.id", "post.createdAt"])
          .orderBy("post.createdAt desc")
          .execute();

        return posts;
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );

  app.get<{ Params: { postid: number } }>(
    "/:postid",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppPost> => {
      try {
        const post = await db
          .selectFrom("post")
          .where("post.id", "=", req.params.postid)
          .innerJoin("user", "user.id", "post.authorId")
          .select([
            "user.username as authorUsername",
            "user.profilePictureUrl as authorPP",
            "user.id as authorId",
          ])
          .selectAll("post")
          .select((eb) =>
            eb
              .selectFrom("like")
              .whereRef("like.postId", "=", "post.id")
              .select((eb) => eb.fn.countAll<number>().as("likesCount"))
              .as("likesCount")
          )
          .select((eb) =>
            eb
              .selectFrom("like")
              .whereRef("like.postId", "=", "post.id")
              .select((eb) =>
                eb.fn
                  .countAll<number>()
                  .filterWhere("like.userId", "=", req.user.id)
                  .as("isPostLikedByUser")
              )
              .as("isPostLikedByUser")
          )
          .select((eb) =>
            eb
              .selectFrom("thread")
              .where((eb) => eb("post.id", "=", eb.fn.any("thread.postIds")))
              .select((eb) => eb.fn.countAll<number>().as("repliesCount"))
              .as("repliesCount")
          )
          .select((eb) =>
            jsonArrayFrom(
              eb
                .selectFrom("user as replyAuthor")
                .innerJoin("post as reply", "reply.replyTargetId", "post.id")
                .whereRef("reply.authorId", "=", "replyAuthor.id")
                .select("replyAuthor.profilePictureUrl as value")
                .distinct()
                .limit(3)
            ).as("repliesUsersPP")
          )
          .select((eb) =>
            eb
              .selectFrom("following")
              .whereRef("targetId", "=", "post.authorId")
              .where("sourceId", "=", req.user.id)
              .select((eb) =>
                eb.fn.countAll<number>().as("isAuthorFollowedByUser")
              )
              .as("isAuthorFollowedByUser")
          )
          .executeTakeFirst();

        if (!post) {
          return res.status(404).send("Post Does Not Exist");
        }

        return post;
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );
};

// const allPosts = [
//   ...user.follings.map((u) => u.posts).flat(),
//   ...user.posts,
// ];

export default postsRoutes;
