import { eq } from "drizzle-orm";

import { db } from "@/db";
import { languages } from "@/db/schema";
import { Locale } from "@/i18n/config";

export async function getAllLanguages() {
  return db.query.languages.findMany();
}

export async function getLanguageByLocale(locale: Locale) {
  return db.query.languages.findFirst({ where: eq(languages.code, locale) });
}

export type LanguagesType = Awaited<ReturnType<typeof getAllLanguages>>;
