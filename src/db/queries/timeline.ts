"use server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { timeline, languages } from "@/db/schema";
import { defaultLocale, Locale, pickLocales } from "@/i18n/config";
import { getTranslateText } from "@/lib/translate";
import { getAllLanguages } from "@/db/queries/languages";
import { TimelineSection } from "@/types/customization";

export type TimelineType = Awaited<ReturnType<typeof getTimelineFromLocale>>;

export async function getTimelineFromLocale(locale: Locale = defaultLocale) {
  const [{ id }] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale))
    .limit(1);

  return db.query.timeline.findFirst({
    where: eq(timeline.lang, id),
    with: {
      language: true,
    },
  });
}

async function TranslateTimeline(content: TimelineSection[], locale: Locale) {
  const filteredLocales = pickLocales(locale);
  const translatedSections: Record<string, TimelineSection[]> =
    Object.fromEntries(filteredLocales.map((item) => [item, []]));

  await Promise.all(
    content.map(async (section) => {
      const response = await getTranslateText(section.description, locale);

      const obj: Record<string, string> = Object.fromEntries(
        response.map((item) => [item.locale, item.result])
      );

      filteredLocales.map((locale) =>
        translatedSections[locale].push({
          ...section,
          description: obj[locale],
        })
      );

      return section;
    })
  );

  return {
    translatedSections: { [locale]: content, ...translatedSections },
    filteredLocales,
  };
}

export async function updateTimelineInfo(
  data: TimelineSection[],
  locale: Locale
) {
  const languages = await getAllLanguages();
  const { translatedSections } = await TranslateTimeline(data, locale);

  return db.transaction(async (tx) => {
    await Object.keys(translatedSections).reduce(async (accumulator, key) => {
      await accumulator;

      const lang = languages.find((language) => language.code === key);
      const sections = translatedSections[key];

      await tx
        .update(timeline)
        .set({ sections })
        .where(eq(timeline.lang, lang?.id ?? 0));
    }, Promise.resolve());
  });
}
