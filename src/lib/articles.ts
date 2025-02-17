"use server";

import { eq, and, not } from "drizzle-orm";
import { JSDOM } from "jsdom";

import {
  SelectedSubPage,
  Section,
  ArticleBody,
  ButtonContent,
} from "@/types/article";
import { db } from "@/db";
import { SubPagesProd, SubPagesTextsLangProd } from "@/db/schema";
import { getTranslateText } from "@/lib/translate";
import { Locale, pickLocales } from "@/i18n/config";
import { getAllLanguages } from "@/db/queries/languages";
import { buildConditions } from "@/lib/query";

interface SubPage {
  isNews: boolean;
  originalDate: Date;
  title: string;
  subtitle: string;
  url: string;
  countryId: number;
  sections: Section[];
  mainImage: string;
  published?: boolean;
}

interface SubPageText {
  title: string;
  subtitle: string;
  sections: Section[];
  subPageId: number;
  lang: number;
}

type SubPagesParams = Partial<typeof SubPagesProd.$inferSelect> & {
  limit?: number;
};

export async function getArticleById(
  id: string
): Promise<SelectedSubPage | null> {
  try {
    const result = await db.query.SubPagesProd.findFirst({
      where: and(
        eq(SubPagesProd.id, parseInt(id)),
        eq(SubPagesProd.isNews, true)
      ),
      with: {
        texts: true,
        country: true,
      },
    });

    return result as SelectedSubPage | null;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export async function updateArticle(id: string, content: ArticleBody) {
  try {
    const subPage = await db?.query?.SubPagesProd?.findFirst({
      where: and(
        eq(SubPagesProd.url, content.url),
        not(eq(SubPagesProd.id, parseInt(id)))
      ),
    });

    if (subPage !== undefined) return "repeated url";

    const result = await db.transaction(async (tx) => {
      const updatedSubPage = await tx
        .update(SubPagesProd)
        .set({
          updatedAt: new Date(),
          slug: generateSlug(content.title),
          url: "/news/" + generateSlug(content.title),
        })
        .where(
          and(eq(SubPagesProd.id, parseInt(id)), eq(SubPagesProd.isNews, true))
        )
        .returning();

      if (updatedSubPage.length === 0) {
        throw new Error("Article not found or not a news article");
      }

      await tx
        .update(SubPagesTextsLangProd)
        .set({
          title: content.title,
          subtitle: content.subtitle,
          sections: JSON.stringify(content.sections),
          updatedAt: new Date(),
        })
        .where(eq(SubPagesTextsLangProd.subPageId, parseInt(id)));

      return updatedSubPage[0];
    });
    return result;
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
}

function extractTextFromHTML(html: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const textSet = new Set<string>();

  document.querySelectorAll("p").forEach((node: any) => {
    if (node.textContent && node.textContent.trim()) {
      textSet.add(node.textContent.trim());
    }
  });

  return Array.from(textSet);
}

async function TranslateSubPage(content: SubPage, locale: Locale) {
  const filteredLocales = pickLocales(locale);
  const translatedSections: Record<string, SubPageText> = Object.fromEntries(
    filteredLocales.map((item) => [
      item,
      { title: "", subtitle: "", sections: [], subPageId: 0, lang: 0 },
    ])
  );

  await Promise.all(
    content.sections.map(async (section) => {
      if (section.type !== "paragraph" && section.type !== "button") {
        filteredLocales.map((locale) =>
          translatedSections[locale].sections.push(section)
        );

        return section;
      }

      const obj: Record<string, string> = Object.fromEntries(
        filteredLocales.map((item) => [item, ""])
      );

      if (section.type === "button") {
        const buttonContent = section.content as ButtonContent;

        const response = await getTranslateText(
          buttonContent.buttonLabel,
          locale
        );

        response
          .flat()
          .forEach(
            ({ result, locale }) =>
              (obj[locale] = result ?? buttonContent.buttonLabel)
          );

        filteredLocales.map((locale) =>
          translatedSections[locale].sections.push({
            ...section,
            content: {
              ...buttonContent,
              buttonLabel: obj[locale],
            },
          })
        );
      } else {
        const textArray = extractTextFromHTML(section.content as string);

        const texts = await Promise.all(
          textArray.map(async (text) => {
            const response = await getTranslateText(text, locale);

            return response.map((item) => ({ ...item, initialText: text }));
          })
        );

        texts.flat().map(({ result, locale, initialText }) => {
          obj[locale] = (obj[locale] ? obj[locale] : section.content) as string;

          obj[locale] = obj[locale].replace(initialText, result);
        });

        filteredLocales.map((locale) =>
          translatedSections[locale].sections.push({
            ...section,
            content: obj[locale],
          })
        );
      }

      return section;
    })
  );

  const title = await getTranslateText(content.title, locale);
  const subtitle = await getTranslateText(content.subtitle, locale);
  const languages = await getAllLanguages();
  const lang = languages.find((language) => language.code === locale);

  title.map(
    ({ result, locale }) => (translatedSections[locale].title = result)
  );

  subtitle.map(
    ({ result, locale }) => (translatedSections[locale].subtitle = result)
  );

  Object.keys(translatedSections).map((locale) => {
    const lang = languages.find((language) => language.code === locale);

    translatedSections[locale].lang = lang?.id ?? 0;
  });

  return {
    otherLanguages: filteredLocales,
    translatedSections,
    currentLang: lang,
  };
}

export async function saveArticle(
  content: SubPage,
  userId: string,
  locale: Locale
) {
  const { otherLanguages, translatedSections, currentLang } =
    await TranslateSubPage(content, locale);

  const subPage = await db?.query?.SubPagesProd?.findFirst({
    where: eq(SubPagesProd.url, content.url),
  });

  if (subPage !== undefined) return "repeated url";

  return db.transaction(async (tx) => {
    const [subPage] = await tx
      .insert(SubPagesProd)
      .values({
        slug: generateSlug(content.title),
        url: content.url,
        isNews: content.isNews,
        originalDate: content.originalDate,
        published: false,
        createdBy: userId,
        countryId: content.countryId,
        mainImage: content.mainImage,
      })
      .returning();

    otherLanguages.map(
      (locale) => (translatedSections[locale].subPageId = subPage.id)
    );

    await tx.insert(SubPagesTextsLangProd).values([
      {
        title: content.title,
        subtitle: content.subtitle,
        sections: content.sections,
        subPageId: subPage.id,
        lang: currentLang?.id ?? 1,
      },
      ...Object.values(translatedSections),
    ]);

    return subPage;
  });
}

export async function getAllSubPages({
  limit,
  ...restParams
}: SubPagesParams): Promise<SelectedSubPage[]> {
  try {
    const where = buildConditions(restParams, SubPagesProd);

    const articles = await db?.query?.SubPagesProd?.findMany({
      where,
      with: {
        texts: true,
        country: true,
      },
      orderBy: (subPages, { desc }) => [desc(subPages.createdAt)],
      limit,
    });

    return articles as SelectedSubPage[];
  } catch (error) {
    console.error("Error fetching all articles:", error);

    throw error;
  }
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

export async function deleteArticle(subPageId: number) {
  try {
    return db.transaction(async (tx) => {
      await tx
        .delete(SubPagesTextsLangProd)
        .where(eq(SubPagesTextsLangProd.subPageId, subPageId));
      await tx.delete(SubPagesProd).where(eq(SubPagesProd.id, subPageId));
    });
  } catch (error) {
    console.error("Error deleting articles:", error);
    throw error;
  }
}

export async function publishArticle(subPageId: number, published: boolean) {
  try {
    return db.transaction(async (tx) => {
      await tx
        .update(SubPagesProd)
        .set({ published })
        .where(eq(SubPagesProd.id, subPageId));
    });
  } catch (error) {
    console.error("Error updating articles:", error);
    throw error;
  }
}

export async function getSubPage(
  params: Partial<typeof SubPagesProd.$inferSelect>
): Promise<SelectedSubPage | null> {
  try {
    const where = buildConditions(params, SubPagesProd);

    const articles = await db?.query?.SubPagesProd?.findFirst({
      where,
      with: {
        texts: true,
        country: true,
      },
    });

    return articles as SelectedSubPage | null;
  } catch (error) {
    console.error("Error fetching article:", error);

    return null;
  }
}

export async function updateSubPage(
  subPageId: number,
  content: SubPage,
  userId: string,
  locale: Locale
) {
  try {
    const { otherLanguages, translatedSections, currentLang } =
      await TranslateSubPage(content, locale);

    const subPage = await db?.query?.SubPagesProd?.findFirst({
      where: and(
        eq(SubPagesProd.url, content.url),
        not(eq(SubPagesProd.id, subPageId))
      ),
    });

    if (subPage !== undefined) return "repeated url";

    return db.transaction(async (tx) => {
      const subPage = await tx
        .update(SubPagesProd)
        .set({
          updatedAt: new Date(),
          url: content.url,
          isNews: content.isNews,
          originalDate: content.originalDate,
          updatedBy: userId,
          countryId: content.countryId,
          mainImage: content.mainImage,
        })
        .where(eq(SubPagesProd.id, subPageId))
        .returning();

      otherLanguages.map(
        (locale) => (translatedSections[locale].subPageId = subPageId)
      );

      const subPagesTexts = await tx.query.SubPagesTextsLangProd.findMany({
        where: eq(SubPagesTextsLangProd.subPageId, subPageId),
      });

      const sections = [
        {
          title: content.title,
          subtitle: content.subtitle,
          sections: content.sections,
          subPageId: subPageId,
          lang: currentLang?.id ?? 1,
        },
        ...Object.values(translatedSections),
      ];

      await subPagesTexts.reduce(async (accum, item) => {
        await accum;

        const currentSection = sections.find(
          (section) => section.lang === item.lang
        );
        if (!currentSection) return;

        await tx
          .update(SubPagesTextsLangProd)
          .set(currentSection)
          .where(eq(SubPagesTextsLangProd.id, item.id));
      }, Promise.resolve());

      return subPage;
    });
  } catch (error) {
    console.error("Error updating article:", error);
    throw error;
  }
}
