"use server";

import { eq } from "drizzle-orm";

import { Locale } from "@/i18n/config";
import { getAllLanguages } from "@/db/queries/languages";
import { db } from "@/db";
import {
  categories,
  categoriesLang,
  festivalToCategories,
  groupToCategories,
  subgroupToCategories,
} from "@/db/schema";
import { getTranslateText } from "@/lib/translate";

export async function createCategory(name: string, locale: Locale) {
  const languages = await getAllLanguages();
  const route = await getTranslateText(name, locale);

  return db.transaction(async (tx) => {
    const [insertedCategory] = await tx
      .insert(categories)
      .values({
        slug: name.split(" ").join("-").toLowerCase(),
      })
      .returning();

    const langs = route.map(({ result, locale }) => {
      const language = languages.find((lang) => lang.code === locale);

      return {
        name: result,
        lang: language?.id ?? 0,
        categoryId: insertedCategory.id,
      };
    });
    const currentLang = languages.find((lang) => lang.code === locale);

    await tx.insert(categoriesLang).values([
      {
        name: name,
        lang: currentLang?.id ?? 0,
        categoryId: insertedCategory.id,
      },
      ...langs,
    ]);
  });
}

export async function deleteCategory(categoryId: number) {
  return db.transaction(async (tx) => {
    await tx
      .delete(categoriesLang)
      .where(eq(categoriesLang.categoryId, categoryId));

    await tx
      .delete(festivalToCategories)
      .where(eq(festivalToCategories.categoryId, categoryId));

    await tx
      .delete(subgroupToCategories)
      .where(eq(subgroupToCategories.categoryId, categoryId));

    await tx
      .delete(groupToCategories)
      .where(eq(groupToCategories.categoryId, categoryId));

    await tx.delete(categories).where(eq(categories.id, categoryId));
  });
}

export async function updateCategory(
  categoryId: number,
  name: string,
  locale: Locale
) {
  const languages = await getAllLanguages();
  const translations = await getTranslateText(name, locale);

  if (!categoryId) return;

  return db.transaction(async (tx) => {
    await tx
      .update(categories)
      .set({
        slug: name.split(" ").join("-").toLowerCase(),
      })
      .where(eq(categories.id, categoryId));

    const categoriesRecords = await tx.query.categoriesLang.findMany({
      where: eq(categoriesLang.categoryId, categoryId),
    });

    await [{ locale, result: name }, ...translations].reduce(
      async (accum, item) => {
        await accum;

        const language = languages.find((lang) => lang.code === item.locale);
        const categoryLang = categoriesRecords.find(
          (categoryRecord) => categoryRecord.lang === language?.id
        );

        if (!categoryLang?.id) return;

        await tx
          .update(categoriesLang)
          .set({ name: item.result })
          .where(eq(categoriesLang.id, categoryLang?.id ?? 0));
      },
      Promise.resolve()
    );
  });
}
