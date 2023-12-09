import { FastifyPluginAsync } from "fastify";
import { db } from "../database";

const likeRoutes: FastifyPluginAsync = async (app, options) => {
  app.post<{ Params: { postid: number } }>(
    "/:postid",
    { preHandler: app.verifyJwt },
    async (req, res) => {
      try {
        const post = await db
          .selectFrom("post")
          .where("post.id", "=", req.params.postid)
          .select("post.id")
          .executeTakeFirst();

        if (!post) {
          return res.status(404).send("Post Does Not Exist");
        }

        const likeEvent = await db
          .selectFrom("like")
          .where("like.postId", "=", req.params.postid)
          .where("like.userId", "=", req.user.id)
          .executeTakeFirst();

        if (likeEvent) {
          return res.status(409).send("User Already Likes This Post");
        }

        await db
          .insertInto("like")
          .values({
            userId: req.user.id,
            postId: post.id,
          })
          .execute();

        return res.send("Post Was Liked");
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  );

  app.post<{ Params: { postid: number } }>(
    "/undo/:postid",
    { preHandler: app.verifyJwt },
    async (req, res) => {
      try {
        const post = await db
          .selectFrom("post")
          .where("post.id", "=", req.params.postid)
          .select("post.id")
          .executeTakeFirst();

        if (!post) {
          return res.status(404).send("Post Does Not Exist");
        }

        const likeEvent = await db
          .selectFrom("like")
          .where("like.postId", "=", req.params.postid)
          .where("like.userId", "=", req.user.id)
          .executeTakeFirst();

        if (!likeEvent) {
          return res.status(4040).send("Like Event Does Not Exist");
        }

        await db
          .deleteFrom("like")
          .where("like.postId", "=", req.params.postid)
          .where("like.userId", "=", req.user.id)
          .execute();

        return res.send("Post Was Unliked");
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  );
};

export default likeRoutes;
