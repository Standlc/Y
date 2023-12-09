import Fastify from "fastify";
import multipart from "@fastify/multipart";
import jwt from "@fastify/jwt";
import postsRoutes from "./apiRoutes/posts";
import authRoutes from "./apiRoutes/auth";
import usersRoutes from "./apiRoutes/users";
import fastifyCookie from "@fastify/cookie";
import jwtDecorations from "./plugins/jwt";
import util from "util";
import { pipeline } from "stream";
import fs from "fs";
import dotenv from "dotenv";
import { fastifyStatic } from "@fastify/static";
import path from "path";
import replyRoutes from "./apiRoutes/reply";
import likeRoutes from "./apiRoutes/like";

export const UPLOAD_PATH = __dirname + "/../upload/";

const app = Fastify({ logger: false });

dotenv.config();
app.register(fastifyStatic, { root: path.join(__dirname, "../upload") });
app.register(jwt, {
  secret: process.env.JWT_SECRET || "",
  cookie: {
    cookieName: "token",
    signed: false,
  },
});
app.register(jwtDecorations);
app.register(multipart);
app.register(fastifyCookie);
app.register(postsRoutes, { prefix: "/api/posts" });
app.register(authRoutes, { prefix: "/api/auth" });
app.register(usersRoutes, { prefix: "/api/users" });
app.register(replyRoutes, { prefix: "/api/reply" });
app.register(likeRoutes, { prefix: "/api/like" });

app.get("/", async (req, res) => {
  return res.status(200).send("Vu api is running");
});

const pump = util.promisify(pipeline);
app.post("/api/upload", { preHandler: app.verifyJwt }, async (req, res) => {
  try {
    const form = await req.file();
    if (!form || !form.filename || !form.file) {
      return res.status(400).send("Bad Request");
    }

    const filename = Date.now() + form.filename;
    await pump(form.file, fs.createWriteStream(UPLOAD_PATH + filename));
    return filename;
  } catch (error) {
    console.log(error);
    return "hey";
  }
});

app.get<{ Params: { imgurl: string } }>(
  "/public/:imgurl",
  { preHandler: app.verifyJwt },
  (req, res) => {
    try {
      return res.sendFile(req.params.imgurl);
    } catch (error) {
      console.log("ERROR");
      console.log(error);
      return error;
    }
  }
);

const start = async () => {
  try {
    await app.listen({ port: 5000 });
  } catch (err) {
    console.log(err);
    app.log.error(err);
  }
};

start();