import { db } from "@/db";
import { InsertTypeGroup, typeGroups } from "../schema";

const _queryAllPrepared = db
  .select()
  .from(typeGroups)
  .prepare("statement_all_type_groups");

export async function getAllTypeGroups() {
  return _queryAllPrepared.execute();
}

export async function createTypeGroup(type: InsertTypeGroup) {
  return db.insert(typeGroups).values(type).returning();
}
