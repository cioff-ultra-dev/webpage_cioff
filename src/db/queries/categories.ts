import { db } from "@/db";
import { languages } from "@/db/schema";
import { defaultLocale, Locale } from "@/i18n/config";
import { eq } from "drizzle-orm";

export async function getAllCategories(locale: Locale = defaultLocale) {
  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  return db.query.categories.findMany({
    where(fields, operators) {
      return operators.notInArray(fields.slug, ["international", "cioff"]);
    },
    with: {
      langs: {
        where(fields, { eq }) {
          return eq(fields.lang, sq);
        },
        with: {
          l: true,
        },
      },
    },
  });
}

export type CategoriesType = Awaited<ReturnType<typeof getAllCategories>>;
export type CategoryType = Awaited<ReturnType<typeof getAllCategories>>[0];
