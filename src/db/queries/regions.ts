import { db } from "@/db";
import { inArray } from "drizzle-orm";
import { languages, SelectLanguages } from "@/db/schema";
import { defaultLocale } from "@/i18n/config";
import { getLocale } from "next-intl/server";

export async function getAllRegions() {
  const locale = await getLocale();
  const localeValue = locale as SelectLanguages["code"];
  const currentDefaultLocale = defaultLocale as SelectLanguages["code"];

  const pushLocales = [localeValue];

  if (localeValue !== currentDefaultLocale) {
    pushLocales.push(currentDefaultLocale);
  }

  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(inArray(languages.code, pushLocales));

  return db.query.regions.findMany({
    with: {
      langs: {
        where(fields, { inArray }) {
          return inArray(fields.lang, sq);
        },
        with: {
          l: true,
        },
      },
    },
  });
}

export type RegionsType = Awaited<ReturnType<typeof getAllRegions>>;
