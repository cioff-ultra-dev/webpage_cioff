"use server";

import { eq } from "drizzle-orm";
import slug from "slug";

import { Locale } from "@/i18n/config";
import { getAllLanguages } from "@/db/queries/languages";
import { db } from "@/db";
import {
  categories,
  categoriesLang,
  festivalToCategories,
  groupToCategories,
  ratingQuestions,
  ratingQuestionsLang,
  subgroupToCategories,
} from "@/db/schema";
import { getTranslateText } from "@/lib/translate";

export async function createRatingQuestion(
  name: string,
  ratingTypeId: number,
  locale: Locale,
) {
  const languages = await getAllLanguages();
  const route = await getTranslateText(name, locale);
  const slugName = slug(name, { locale: "en" });

  return db.transaction(async (tx) => {
    const [insertedQuestion] = await tx
      .insert(ratingQuestions)
      .values({
        slug: slugName,
        ratingTypeId,
      })
      .returning({ id: ratingQuestions.id });

    const langs = route.map(({ result, locale }) => {
      const language = languages.find((lang) => lang.code === locale);

      return {
        name: result,
        lang: language?.id ?? 0,
        ratingQuestionlId: insertedQuestion.id,
      };
    });
    const currentLang = languages.find((lang) => lang.code === locale);

    await tx.insert(ratingQuestionsLang).values([
      {
        name: name,
        lang: currentLang?.id ?? 0,
        ratingQuestionlId: insertedQuestion.id,
      },
      ...langs,
    ]);
  });
}

export async function changeStatusRatingQuestion(ratingQuestionId: number) {
  return db.transaction(async (tx) => {
    const currentRatingQuestion = await tx.query.ratingQuestions.findFirst({
      columns: {
        id: true,
        active: true,
      },
      where(fields, { eq }) {
        return eq(fields.id, ratingQuestionId);
      },
    });

    if (currentRatingQuestion?.id) {
      await tx
        .update(ratingQuestions)
        .set({
          active: !currentRatingQuestion.active,
        })
        .where(eq(ratingQuestions.id, ratingQuestionId));
    }
  });
}

export async function updateRatingQuestion(
  ratingQuestionId: number,
  name: string,
  locale: Locale,
) {
  const languages = await getAllLanguages();
  const translations = await getTranslateText(name, locale);
  const slugName = slug(name);

  if (!ratingQuestionId) return;

  return db.transaction(async (tx) => {
    await tx
      .update(ratingQuestions)
      .set({
        slug: slugName,
      })
      .where(eq(ratingQuestions.id, ratingQuestionId));

    const ratingQuestionRecords = await tx.query.ratingQuestionsLang.findMany({
      where(fields, { eq }) {
        return eq(fields.ratingQuestionlId, ratingQuestionId);
      },
    });

    await [{ locale, result: name }, ...translations].reduce(
      async (accum, item) => {
        await accum;

        const language = languages.find((lang) => lang.code === item.locale);
        const ratingQuestionLang = ratingQuestionRecords.find(
          (ratingQuestionRecord) => ratingQuestionRecord.lang === language?.id,
        );

        if (!ratingQuestionLang?.id) return;

        await tx
          .update(ratingQuestionsLang)
          .set({ name: item.result })
          .where(eq(ratingQuestionsLang.id, ratingQuestionLang?.id ?? 0));
      },
      Promise.resolve(),
    );
  });
}
