import { db } from "@/db";
import { countriesTable } from "@/db/schema";
import { parse } from "csv-parse";
import { and, eq, ilike, isNull } from "drizzle-orm";
import fs from "node:fs";
import path from "path";

export default async function run() {
  const currentPath = path.resolve(
    ".",
    "src",
    "scripts",
    "exports",
    "countries.csv"
  );
  const parser = fs.createReadStream(currentPath).pipe(parse({}));

  for await (const [_, lat, lng, name] of parser) {
    const result = await db
      .update(countriesTable)
      .set({ lat, lng })
      .where(
        and(
          eq(countriesTable.name, name),
          isNull(countriesTable.lat),
          isNull(countriesTable.lng)
        )
      )
      .returning({
        updatedId: countriesTable.id,
        name: countriesTable.name,
      });
  }

  console.log("Finished 👋🏽");
}
