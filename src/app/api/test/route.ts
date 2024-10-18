import { db } from "@/db";
import { storages } from "@/db/schema";
import { Locale } from "@/i18n/config";
import { getTranslateText } from "@/lib/translate";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const query = db
    .update(storages)
    .set({ name: "container" })
    .where(eq(storages.id, 198))
    .returning({
      name: storages.name,
      foo: sql`${db
        .select({ oldName: storages.name })
        .from(storages)
        .where(eq(storages.id, 198))}`,
    });

  console.log(query.toSQL());

  const results = await query;

  return Response.json({ results });
}
