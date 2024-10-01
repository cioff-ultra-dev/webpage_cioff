import { db } from "@/db";
import { countries } from "@/db/schema";
import { parse } from "csv-parse";
import { and, eq, isNull } from "drizzle-orm";
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
      .update(countries)
      .set({ lat, lng })
      .where(
        and(
          eq(countries.name, name),
          isNull(countries.lat),
          isNull(countries.lng)
        )
      )
      .returning({
        updatedId: countries.id,
        name: countries.name,
      });
  }

  console.log("Finished 👋🏽");
}
