import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { NewPost } from "../types";
import { db } from "../database";
import { jsonObjectFrom } from "kysely/helpers/postgres";

export interface IUserIdParams {
  userid: number;
}

const postsRoutes: FastifyPluginAsync = async (app, options) => {
  app.post<{ Body: NewPost }>(
    "/create",
    { preHandler: app.verifyJwt },
    async (req, res) => {
      try {
        const post = await db
          .insertInto("post")
          .values(req.body)
          .returningAll()
          .executeTakeFirstOrThrow();

        return post;
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  );

  app.get("/feed", { preHandler: app.verifyJwt }, async (req, res) => {
    try {
      const posts = await db
        .selectFrom("post")
        .leftJoin("following", "following.targetId", "post.authorId")
        .where((w) =>
          w("following.sourceId", "=", req.user.id).or(
            "post.authorId",
            "=",
            req.user.id
          )
        )
        .selectAll("post")

        .innerJoin("user", "user.id", "post.authorId")
        .select([
          "user.username as authorUsername",
          "user.profilePictureUrl as authorPP",
          "user.id as authorId",
        ])

        .select((eb) =>
          jsonObjectFrom(
            eb
              .selectFrom("like")
              .whereRef("like.postId", "=", "post.id")
              .select((eb) => [
                eb.fn.countAll<number>().as("likesCount"),
                eb.fn
                  .countAll()
                  .filterWhere("like.userId", "=", req.user.id)
                  .as("isPostLikedByUser"),
              ])
          ).as("likes")
        )

        .select((eb) =>
          eb
            .selectFrom("reply")
            .whereRef("reply.postId", "=", "post.id")
            .select((eb) => eb.fn.countAll().as("repliesCount"))
            .as("repliesCount")
        )

        // SELECT LIKES
        // .select((eb) =>
        //   jsonArrayFrom(
        //     eb
        //       .selectFrom("like")
        //       .select("like.userId")
        //       .whereRef("like.postId", "=", "post.id")
        //       .orderBy("like.createdAt desc")
        //   ).as("likes")
        // )

        .orderBy("post.createdAt desc")
        .execute();

      console.log(posts);
      return posts;
    } catch (error) {
      console.error(error);
      return error;
    }
  });
};

// const allPosts = [
//   ...user.follings.map((u) => u.posts).flat(),
//   ...user.posts,
// ];

export default postsRoutes;
