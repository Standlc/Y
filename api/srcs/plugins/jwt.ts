import {
  FastifyPluginAsync,
  preHandlerHookHandler,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import fp from "fastify-plugin";
import { jwtSignType } from "../types";
import { User } from "../schema";
import { Selectable } from "kysely";

declare module "fastify" {
  interface FastifyInstance {
    verifyJwt: preHandlerHookHandler;
    signAndSetCookie: jwtSignType;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number };
    user: {
      id: number;
    };
  }
}

const jwtDecorations: FastifyPluginAsync = async (app, options) => {
  app.decorate("verifyJwt", async (req: FastifyRequest, res: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch (error) {
      res.send(error);
    }
  });

  app.decorate(
    "signAndSetCookie",
    (user: Selectable<User>, res: FastifyReply) => {
      const accessToken = app.jwt.sign(
        { id: user.id },
        { expiresIn: "2 days" }
      );
      res.setCookie("token", accessToken, {
        httpOnly: true,
        sameSite: true,
        path: "/",
      });
      return accessToken;
    }
  );
};

export default fp(jwtDecorations);
