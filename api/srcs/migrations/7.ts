import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("thread")
    .addColumn("id", "integer", (col) =>
      col.references("post.id").onDelete("cascade").notNull().primaryKey()
    )
    .addColumn("postIds", sql`integer[]`, (col) => col.notNull())
    .addColumn("authorId", "integer", (col) =>
      col.references("user.id").notNull().onDelete("cascade")
    )
    .execute();

  await db.schema
    .createIndex("threadAuthorIdIndex")
    .on("thread")
    .column("authorId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("thread").execute();
  await db.schema.dropIndex("threadAuthorIdIndex").execute();
}
