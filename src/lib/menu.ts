"use server";

import { eq } from "drizzle-orm";

import { Locale } from "@/i18n/config";
import { getAllLanguages, getLanguageByLocale } from "@/db/queries/languages";
import { db } from "@/db";
import { menu as Menu, menuLang as MenuLang } from "@/db/schema";
import { SelectedMenu } from "@/types/customization";
import { getTranslateText } from "@/lib/translate";
import { SelectedMenuLang } from "@/types/customization";

export async function getMenuByLocale(
  locale: Locale
): Promise<SelectedMenuLang[]> {
  try {
    const language = await getLanguageByLocale(locale);

    const menuLang = await db?.query?.menuLang?.findMany({
      where: eq(MenuLang.lang, language?.id ?? 1),
      with: {
        menu: true,
      },
      orderBy: (MenuLang, { desc }) => [desc(MenuLang.createdAt)],
    });

    return menuLang as SelectedMenuLang[];
  } catch (error) {
    console.error("Error fetching all menuLangs:", error);

    throw error;
  }
}

export async function createMenuItem(
  menuLang: SelectedMenuLang,
  locale: Locale
) {
  const languages = await getAllLanguages();

  const route = await getTranslateText(menuLang.name, locale);

  return db.transaction(async (tx) => {
    const [insertedMenu] = await tx
      .insert(Menu)
      .values({
        slug: menuLang.menu.slug,
        order: menuLang.menu.order,
      })
      .returning();

    const langs = route.map(({ result, locale }) => {
      const language = languages.find((lang) => lang.code === locale);

      return {
        name: result,
        lang: language?.id ?? 0,
        menuId: insertedMenu.id,
      };
    });
    const currentLang = languages.find((lang) => lang.code === locale);

    await tx.insert(MenuLang).values([
      {
        name: menuLang.name,
        lang: currentLang?.id ?? 0,
        menuId: insertedMenu.id,
      },
      ...langs,
    ]);
  });
}

export async function removeMenuItem(menuId: number): Promise<void> {
  return db.transaction(async (tx) => {
    await tx.delete(MenuLang).where(eq(MenuLang.menuId, menuId));
    await tx.delete(Menu).where(eq(Menu.id, menuId));
  });
}

export async function updateMenuItem(
  menuLang: SelectedMenuLang,
  locale: Locale
) {
  const languages = await getAllLanguages();

  const translations = await getTranslateText(menuLang.name, locale);

  return db.transaction(async (tx) => {
    await tx
      .update(Menu)
      .set({
        slug: menuLang.menu.slug,
        order: menuLang.menu.order,
        updatedAt: new Date(),
      })
      .where(eq(Menu.id, menuLang.menu.id ?? 0));

    const records = await tx.query.menuLang.findMany({
      where: eq(MenuLang.menuId, menuLang.menu.id ?? 0),
    });

    const langs = translations.map(({ locale, result }) => {
      const language = languages.find((lang) => lang.code === locale);
      const record = records.find((item) => item.lang === language?.id);

      return {
        ...record,
        name: result,
        updatedAt: new Date(),
      };
    });

    await [
      { id: menuLang.id ?? 0, name: menuLang.name, updatedAt: new Date() },
      ...langs,
    ].reduce(async (accum, item) => {
      await accum;

      if (!item.id) return;

      await tx
        .update(MenuLang)
        .set(item)
        .where(eq(MenuLang.id, item.id ?? 0));
    }, Promise.resolve());
  });
}

export async function updateMenuPositions(menuItems: SelectedMenu[]) {
  return db.transaction(async (tx) => {
    menuItems.reduce(async (accum, item) => {
      await accum;

      if (!item.id) return;

      await tx
        .update(Menu)
        .set({ order: item.order })
        .where(eq(Menu.id, item.id ?? 0));
    }, Promise.resolve());
  });
}
