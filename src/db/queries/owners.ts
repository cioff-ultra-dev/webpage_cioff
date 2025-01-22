"use server";

import { db } from "@/db";
import { owners, users } from "@/db/schema";
import { or, inArray, eq } from "drizzle-orm";

interface params {
  groupsId: number[];
  festivalsId: number[];
  nationalSectionsId: number[];
}

export async function getEmailsFromOwners({
  festivalsId,
  groupsId,
  nationalSectionsId,
}: params): Promise<string[]> {
  const query = db
    .select({ email: users.email })
    .from(users)
    .leftJoin(owners, eq(owners.userId, users.id))
    .where(or())
    .$dynamic();

  if (groupsId.length > 0) query.where(or(inArray(owners.groupId, groupsId)));

  if (festivalsId.length > 0)
    query.where(or(inArray(owners.festivalId, festivalsId)));

  if (nationalSectionsId.length > 0)
    query.where(or(inArray(owners.nsId, nationalSectionsId)));

  const result = await query.groupBy(owners.userId, users.email);

  return result.map((row) => row.email);
}
