import { FastifyPluginAsync, FastifyInstance, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import { db } from "../database";
import { NewUser } from "../types";

const authRoutes: FastifyPluginAsync = async (app, options) => {
  app.post<{ Body: NewUser }>("/register", async (req, res) => {
    const user = req.body;
    const hashedPassword = await bcrypt.hash(user.password, 10);

    if (user.username == "" || user.password.length < 3) {
      return res.status(406).send("User Credentials Are Not Acceptable");
    }

    try {
      const newUser = await db
        .insertInto("user")
        .values({ ...user, password: hashedPassword })
        .returningAll()
        .executeTakeFirstOrThrow();

      app.signAndSetCookie(newUser, res);
      const { password, ...other } = newUser;
      return { ...other };
    } catch (error) {
      console.log(error);
      return error;
    }
  });

  app.get("/logout", async (req, res) => {
    res.setCookie("token", "", {
      httpOnly: true,
      sameSite: true,
      path: "/",
    });
  });

  app.post<{ Body: { username: string; password: string } }>(
    "/login",
    async (req, res) => {
      try {
        const user = await db
          .selectFrom("user")
          .where("username", "=", req.body.username)
          .selectAll()
          .executeTakeFirstOrThrow();

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
          return res.status(401).send("Wrong Credentials");
        }

        app.signAndSetCookie(user, res);
        const { password, ...other } = user;
        return { ...other };
      } catch (error) {
        console.log(error);
        res.status(404).send("No User Found");
      }
    }
  );

  app.get<{ Params: { username: string } }>(
    "/unicity/:username",
    async (req, res) => {
      try {
        const user = await db
          .selectFrom("user")
          .where("username", "=", req.params.username)
          .selectAll()
          .executeTakeFirst();

        if (user) {
          return res.status(409).send("This User Already Exists");
        }
        return res.status(200).send("OK");
      } catch (error) {
        return error;
      }
    }
  );
};

export default authRoutes;
