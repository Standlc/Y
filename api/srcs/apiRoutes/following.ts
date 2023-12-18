import { FastifyPluginAsync } from "fastify";
import { db } from "../database";
import { join } from "path";

const checkUserExists = async (userId: number) => {
  const user = await db
    .selectFrom("user")
    .where("user.id", "=", userId)
    .select("user.id")
    .executeTakeFirst();

  return user != undefined;
};

const findFollowEvent = async (sourceId: number, targetId: number) => {
  const event = await db
    .selectFrom("following")
    .where("sourceId", "=", sourceId)
    .where("targetId", "=", targetId)
    .selectAll()
    .executeTakeFirst();

  return event;
};

const followingRoutes: FastifyPluginAsync = async (app, options) => {
  app.post<{ Params: { userid: number } }>(
    "/:userid",
    { preHandler: app.verifyJwt },
    async (req, res) => {
      if (req.user.id == req.params.userid) {
        return res.status(406).send("User Cannot Follow Itself");
      }

      try {
        if (!(await checkUserExists(req.params.userid))) {
          return res.status(404).send("User Does Not Exist");
        }

        if (await findFollowEvent(req.user.id, req.params.userid)) {
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

  app.delete<{ Params: { userid: number } }>(
    "/:userid",
    { preHandler: app.verifyJwt },
    async (req, res) => {
      try {
        if (!(await checkUserExists(req.params.userid))) {
          return res.status(404).send("User Does Not Exist");
        }

        if (!(await findFollowEvent(req.user.id, req.params.userid))) {
          return res.status(401).send("User Not Yet Followed");
        }

        await db
          .deleteFrom("following")
          .where("targetId", "=", req.params.userid)
          .where("sourceId", "=", req.user.id)
          .execute();

        return res.send("User Has Been Unfollowed");
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );
};

export default followingRoutes;
