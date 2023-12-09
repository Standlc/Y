import { Pool, types } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "./schema";
import dotenv from "dotenv";

types.setTypeParser(types.builtins.INT8, (val) => parseInt(val));
types.setTypeParser(types.builtins.INT4, (val) => parseInt(val));
types.setTypeParser(types.builtins.INT2, (val) => parseInt(val));
types.setTypeParser(types.builtins.FLOAT4, (val) => parseFloat(val));
types.setTypeParser(types.builtins.FLOAT8, (val) => parseFloat(val));
types.setTypeParser(types.builtins.NUMERIC, (val) => parseFloat(val));

dotenv.config();
const dialect = new PostgresDialect({
  pool: new Pool({
    host: "localhost",
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
