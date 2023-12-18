import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("post")
    .alterColumn("caption", (col) => col.dropNotNull())
    .addColumn("replyTargetId", "integer", (col) =>
      col.references("post.id").onDelete("cascade")
    )
    .addColumn("replySourceTargetId", "integer", (col) =>
      col.references("post.id").onDelete("cascade")
    )
    .execute();

  await db.schema
    .createIndex("replyTargetIdIndex")
    .on("post")
    .column("replyTargetId")
    .execute();

  await db.schema
    .createIndex("replySourceTargetIdIndex")
    .on("post")
    .column("replySourceTargetId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("replySourceTargetIdIndex").execute();
  await db.schema.dropIndex("replyTargetIdIndex").execute();
  await db.schema
    .alterTable("post")
    .dropColumn("replyTargetId")
    .dropColumn("replySourceTargetId")
    .execute();
  //   await db.schema.alterTable("reply").dropColumn("id").execute();
  //   await db.schema.alterTable("reply").dropColumn("postId").execute();
}
