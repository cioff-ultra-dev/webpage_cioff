"use server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { languages, design } from "@/db/schema";
import { defaultLocale, Locale } from "@/i18n/config";
import { getTranslateText } from "@/lib/translate";
import { getAllLanguages } from "@/db/queries/languages";

export type DesignListType = Awaited<ReturnType<typeof getBannerFromLocale>>;
export type DesignType = Awaited<ReturnType<typeof getBannerFromLocale>>[0];
type Param = Pick<DesignType, "key" | "value">;

export async function getBannerFromLocale(locale: Locale = defaultLocale) {
  const [{ id }] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale))
    .limit(1);

  return db.query.design.findMany({
    where: eq(design.lang, id),
    with: {
      lang: true,
    },
  });
}

export async function updateBannerInfo(
  data: {
    title: Param;
    subtitle: Param;
    image: Param;
  },
  locale: Locale,
) {
  const allLanguages = await getAllLanguages();

  return db.transaction(async (tx) => {
    const { image, subtitle, title } = data;
    await tx
      .update(design)
      .set({
        value: image.value,
      })
      .where(eq(design.key, "image"));

    const titleTranslations = await getTranslateText(title.value, locale);

    await [{ locale, result: title.value }, ...titleTranslations].reduce(
      async (accumulator, item) => {
        await accumulator;

        const language = allLanguages.find((lang) => lang.code === item.locale);

        await tx
          .update(design)
          .set({
            value: item.result,
          })
          .where(
            and(eq(design.key, "title"), eq(design.lang, language?.id ?? 0)),
          );
      },
      Promise.resolve(),
    );

    const subtitleTranslations = await getTranslateText(subtitle.value, locale);

    await [{ locale, result: subtitle.value }, ...subtitleTranslations].reduce(
      async (accumulator, item) => {
        await accumulator;

        const language = allLanguages.find((lang) => lang.code === item.locale);

        await tx
          .update(design)
          .set({
            value: item.result,
          })
          .where(
            and(eq(design.key, "subtitle"), eq(design.lang, language?.id ?? 0)),
          );
      },
      Promise.resolve(),
    );
  });
}
