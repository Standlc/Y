import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("like")
    .addColumn("postId", "integer", (col) =>
      col.references("post.id").onDelete("cascade").notNull()
    )
    .execute();

  await db.schema
    .alterTable("like")
    .addColumn("userId", "integer", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .execute();

  await db.schema
    .createIndex("likePostIdIndex")
    .on("like")
    .column("postId")
    .execute();

  await db.schema
    .createIndex("likeUserIdIndex")
    .on("like")
    .column("userId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("like").dropColumn("postId").execute();
  await db.schema.alterTable("like").dropColumn("userId").execute();
}
