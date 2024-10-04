import { db } from "@/db";
import { categoryGroups } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest) {
  const result = await db.query.categoryGroups.findMany({
    where: inArray(categoryGroups.slug, [
      "type-of-festival",
      "age-of-participants",
      "style-of-festival",
    ]),
    with: {
      categories: true,
    },
  });

  return Response.json({ result });
}
