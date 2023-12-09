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

  // remove primary key
  await db.schema
    .createTable("following")
    .addColumn("sourceId", "integer", (col) =>
      col.references("user.id").onDelete("cascade").notNull().primaryKey()
    )
    .addColumn("targetId", "integer", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  await db.schema
    .createTable("post")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("caption", "text", (col) => col.notNull())
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
    .execute();

  // remove primary key
  await db.schema
    .createTable("like")
    .addColumn("postId", "integer", (col) =>
      col.references("post.id").onDelete("cascade").notNull().primaryKey()
    )
    .addColumn("userId", "integer", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // create id row
  await db.schema
    .createTable("comment")
    .addColumn("content", "text")
    .addColumn("authorId", "integer", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("postId", "integer", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn("updatedAt", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // add followingSourceIdIndex
  // add likePostIdIndex

  await db.schema
    .createIndex("postAuthorIdIndex")
    .on("post")
    .column("authorId")
    .execute();

  await db.schema
    .createIndex("likeUserIdIndex")
    .on("like")
    .column("userId")
    .execute();

  await db.schema
    .createIndex("followingTargetIdIndex")
    .on("following")
    .column("targetId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user").execute();
  await db.schema.dropTable("post").execute();
  await db.schema.dropTable("comment").execute();
  await db.schema.dropTable("following").execute();
  await db.schema.dropTable("like").execute();
}
