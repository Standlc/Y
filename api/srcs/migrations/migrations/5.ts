import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("comment")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .execute();

  await db.schema.alterTable("comment").renameTo("reply").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("reply").renameTo("comment").execute();
  await db.schema.alterTable("comment").dropColumn("id").execute();
}
