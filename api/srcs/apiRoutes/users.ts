import { FastifyPluginAsync } from "fastify";
import { db } from "../database";
import { AppPost, AppProfile, AppUser } from "../types";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { sql } from "kysely";

const usersRoutes: FastifyPluginAsync = async (app, options) => {
  app.get("/auth", { preHandler: app.verifyJwt }, async (req, res) => {
    try {
      const user = await db
        .selectFrom("user")
        .where("id", "=", req.user.id)
        .selectAll()
        .executeTakeFirstOrThrow();

      const { password, ...other } = user;
      return other;
    } catch (error) {
      return error;
    }
  });

  app.get(
    "/feed",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppPost[]> => {
      try {
        const posts = await db
          .selectFrom("post")
          .where("post.replySourceTargetId", "is", null)
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
              .where("like.userId", "=", req.user.id)
              .select((eb) => eb.fn.countAll<number>().as("isPostLikedByUser"))
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

        console.log(posts);

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

        return posts;
      } catch (error) {
        console.error(error);
        return res.status(500).send(error);
      }
    }
  );

  app.get<{ Params: { username: string } }>(
    "/profile/:username",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppProfile> => {
      try {
        const profile = await db
          .selectFrom("user")
          .where("user.username", "=", req.params.username)
          .select((eb) =>
            eb
              .selectFrom("post")
              .whereRef("authorId", "=", "user.id")
              .where("post.replyTargetId", "is", null)
              .select((eb) => eb.fn.countAll<number>().as("postsCount"))
              .as("postsCount")
          )
          .select((eb) =>
            eb
              .selectFrom("following")
              .whereRef("sourceId", "=", "user.id")
              .select((eb) => eb.fn.countAll<number>().as("followings"))
              .as("followings")
          )
          .select((eb) =>
            eb
              .selectFrom("following")
              .whereRef("targetId", "=", "user.id")
              .select((eb) => eb.fn.countAll<number>().as("followers"))
              .as("followers")
          )
          .select((eb) =>
            eb
              .selectFrom("following")
              .whereRef("following.targetId", "=", "user.id")
              .where("sourceId", "=", req.user.id)
              .select((eb) =>
                eb.fn.countAll<number>().as("isUserFollowedByUser")
              )
              .as("isUserFollowedByUser")
          )
          .distinctOn("user.id")
          .selectAll()
          .executeTakeFirst();

        if (!profile) {
          return res.status(404).send("Profile Does Not Exist");
        }

        const { password, ...appProfile } = profile;
        return appProfile;
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );

  app.get<{ Params: { username: string } }>(
    "/search/:username",
    { preHandler: app.verifyJwt },
    async (req, res): Promise<AppUser[]> => {
      try {
        const users = await db
          .selectFrom("user")
          .where("user.username", "ilike", "%" + req.params.username + "%")
          .select(["username", "id", "bio", "createdAt", "profilePictureUrl"])
          .execute();

        return users;
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );
};

export default usersRoutes;
