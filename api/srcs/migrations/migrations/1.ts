import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("username", "varchar", (col) => col.notNull().unique())
    .addColumn("password", "varchar", (col) => col.notNull())
    .addColumn("profilePictureUrl", "varchar")
    .addColumn("bio", "text")
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
/////

await db.schema
.createTable("post")
.addColumn("id", "serial", (col) => col.primaryKey())
.addColumn("caption", "text")
.addColumn("photoUrl", "varchar")
.addColumn("authorId", "integer", (col) =>
  col.references("user.id").onDelete("cascade").notNull()
)
.addColumn("createdAt", "timestamp", (col) =>
  col.defaultTo(sql`now()`).notNull()
)
.addColumn("updatedAt", "timestamp", (col) =>
  col.defaultTo(sql`now()`).notNull()
)
.addColumn("replyTargetId", "integer", (col) =>
col.references("post.id").onDelete("cascade")
)
.addColumn("replySourceTargetId", "integer", (col) =>
    col.references("post.id").onDelete("cascade")
)
.execute();

  // remove primary key
  await db.schema
    .createTable("following")
    .addColumn("sourceId", "integer", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("targetId", "integer", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();
/////

    await db.schema
    .createTable("like")
    .addColumn("postId", "integer", (col) =>
    col.references("post.id").onDelete("cascade").notNull()
    )
    .addColumn("userId", "integer", (col) =>
    col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("createdAt", "timestamp", (col) =>
    col.defaultTo(sql`now()`).notNull()
    )
    .execute();


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
    .createIndex("likePostIdIndex")
    .on("like")
    .column("postId")
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

  await db.schema
    .createIndex("threadAuthorIdIndex")
    .on("thread")
    .column("authorId")
    .execute();

  await db.schema
    .createIndex("postAuthorIdIndex")
    .on("post")
    .column("authorId")
    .execute();

  await db.schema
    .createIndex("followingTargetIdIndex")
    .on("following")
    .column("targetId")
    .execute();

  await db.schema
    .createIndex("likeUserIdIndex")
    .on("like")
    .column("userId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user").execute();
  await db.schema.dropTable("post").execute();
  await db.schema.dropTable("comment").execute();
  await db.schema.dropTable("following").execute();
  await db.schema.dropTable("like").execute();
}
