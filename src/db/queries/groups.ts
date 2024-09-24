import { db } from "@/db";
import { groups, InsertTypeGroup, SelectGroup, typeGroups } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function getAllGroups() {
  return db.query.groups.findMany({
    with: {
      country: true,
    },
  });
}

export type AllGroupType = Awaited<ReturnType<typeof getAllGroups>>;

export async function getGroupById(id: SelectGroup["id"]) {
  return db.query.groups.findFirst({
    where: eq(groups.id, id),
    with: {
      directorPhoto: true,
    },
  });
}

export type GroupDetailsType = Awaited<ReturnType<typeof getGroupById>>;
