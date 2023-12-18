import { Kysely } from "kysely";

// couldn't remove primaryKey from following and like tables
// so this migration first deletes the primaryKey rows

export async function up(db: Kysely<any>): Promise<void> {
  // await db.schema
  //   .alterTable("following")
  //   .addColumn("sourceId", "integer", (col) =>
  //     col.references("user.id").onDelete("cascade").notNull()
  //   )
  //   .execute();
  // await db.schema.alterTable("following").dropColumn("sourceId").execute();

  console.log("drop userid");
  await db.schema.alterTable("like").dropColumn("postId").execute();
  // await db.schema
  //   .alterTable("like")
  //   .addColumn("postId", "integer", (col) =>
  //     col.references("user.id").onDelete("cascade").notNull()
  //   )
  //   .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  console.log("drop userid");
  //
}
