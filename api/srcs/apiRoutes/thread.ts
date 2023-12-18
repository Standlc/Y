import { FastifyPluginAsync } from "fastify";
import { AppPost } from "../types";
import { getPost } from "./reply";
import { db } from "../database";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const getThreadPostIds = async (postId: number) => {
  const thread = await db
    .selectFrom("thread")
    .where("thread.id", "=", postId)
    .select("postIds")
    .executeTakeFirst();

  return thread;
};

const threadRoutes: FastifyPluginAsync = async (app, options) => {
  app.get<{ Params: { postid: number } }>(
    "/:postid",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppPost[]> => {
      try {
        const reply = await getPost(req.params.postid);
        if (!reply) {
          return res.status(404).send("No Such Post");
        }

        const targetThread = await getThreadPostIds(reply.id);
        if (!targetThread) {
          return [];
        }

        const posts = await db
          .selectFrom("post")
          .where("post.id", "in", targetThread.postIds)
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
          .orderBy("post.createdAt asc")
          .execute();

        return posts;
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );
};

export default threadRoutes;
