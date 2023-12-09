import { FastifyPluginAsync } from "fastify";
import { User } from "../schema";
import { db } from "../database";
import { IUserIdParams } from "./posts";

// export const userOpts: RouteShorthandOptions = {
//   preHandler: ,
// };

const usersRoutes: FastifyPluginAsync = async (app, options) => {
  app.get<{ Body: User }>(
    "/",
    { preHandler: app.verifyJwt },
    async (req, res) => {
      try {
      } catch (error) {
        return error;
      }
    }
  );

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

  app.post<{ Params: IUserIdParams }>(
    "/follow/:userid",
    { preHandler: app.verifyJwt },
    async (req, res) => {
      if (req.user.id == req.params.userid) {
        return res.status(406).send("User Cannot Follow Itself");
      }

      try {
        const targetId = await db
          .selectFrom("following")
          .innerJoin(
            (eb) =>
              eb
                .selectFrom("following")
                .where("sourceId", "=", req.user.id)
                .select("targetId")
                .as("userFollowings"),
            (join) => join.on("userFollowings.targetId", "=", req.params.userid)
          )
          .executeTakeFirst();

        if (targetId) {
          return res.status(409).send("Already Followed");
        }

        await db
          .insertInto("following")
          .values({
            sourceId: req.user.id,
            targetId: req.params.userid,
          })
          .execute();
        return res.status(200).send("User Has Been Followed");
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  );
};

export default usersRoutes;
