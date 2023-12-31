import { FastifyPluginAsync } from "fastify";
import { db } from "../database";
import { AppPost, NewReply } from "../types";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { getThreadPostIds } from "./thread";

export const getPost = async (postId: number) => {
  const post = await db
    .selectFrom("post")
    .where("post.id", "=", postId)
    .selectAll()
    .executeTakeFirst();

  return post;
};

const replyRoutes: FastifyPluginAsync = async (app, options) => {
  app.post<{ Body: NewReply }>(
    "/",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppPost> => {
      try {
        const targetPost = await getPost(req.body.replyTargetId);
        if (!targetPost) {
          return res.status(404).send("No Such Post");
        }

        const sourcePostId = targetPost.replySourceTargetId ?? targetPost.id;
        const newReply = await db
          .insertInto("post")
          .values({
            ...req.body,
            authorId: req.user.id,
            replySourceTargetId: sourcePostId,
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        const user = await db
          .selectFrom("user")
          .where("user.id", "=", req.user.id)
          .select(["profilePictureUrl", "user.username"])
          .executeTakeFirstOrThrow();

        const post: AppPost = {
          ...newReply,
          repliesCount: 0,
          repliesUsersPP: [],
          likesCount: 0,
          isPostLikedByUser: 0,
          isAuthorFollowedByUser: 0,
          authorUsername: user.username,
          authorPP: user.profilePictureUrl,
        };

        // CREATE THREAD
        let targetThread = await getThreadPostIds(targetPost.id);
        if (!targetThread) {
          targetThread = {
            postIds: [targetPost.id],
          };
        }

        await db
          .insertInto("thread")
          .values({
            id: newReply.id,
            postIds: [...targetThread.postIds, targetPost.id],
            authorId: req.user.id,
          })
          .execute();

        return post;
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );

  app.get<{ Params: { postid: number } }>(
    "/:postid",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppPost[]> => {
      try {
        if (!getPost(req.params.postid)) {
          return res.status(404).send("No Such Post");
        }

        const replies = await db
          .selectFrom("post")
          .where("post.replyTargetId", "=", req.params.postid)
          .innerJoin("user", "user.id", "post.authorId")
          .select([
            "user.profilePictureUrl as authorPP",
            "user.username as authorUsername",
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

        return replies;
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );
};

export default replyRoutes;
