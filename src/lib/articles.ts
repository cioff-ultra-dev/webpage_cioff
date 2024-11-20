import { eq, and } from "drizzle-orm";
import { Section } from "@/types/article";
import { db } from "@/db";
import { SubPagesProd, SubPagesTextsLangProd } from "@/db/schema";

interface ArticleText {
  title: string;
  description: string;
  sections: string;
  lang: number;
  subPageId: number;
}

interface SubPage {
  id: number;
  texts: ArticleText[];
  //... Any other fields needed will goes here
}

export async function getArticleById(id: string): Promise<SubPage | null> {
  try {
    const result = (await db.query.SubPagesProd.findFirst({
      where: and(
        eq(SubPagesProd.id, parseInt(id)),
        eq(SubPagesProd.isNews, true)
      ),
      with: {
        texts: true,
      },
    })) as SubPage | null;

    if (result && result.texts[0]) {
      result.texts[0].sections = JSON.parse(result.texts[0].sections || "[]");
    }
    return result;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export async function updateArticle(
  id: string,
  content: { title: string; description: string; sections: Section[] }
) {
  try {
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
          description: content.description,
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

export async function saveArticle(
  content: { title: string; description: string; sections: Section[] },
  userId: string
) {
  return db.transaction(async (tx) => {
    const [subPage] = await tx
      .insert(SubPagesProd)
      .values({
        slug: generateSlug(content.title),
        url: "/news/" + generateSlug(content.title),
        isNews: true,
        originalDate: new Date(),
        published: false,
        createdBy: userId,
      })
      .returning();

    await tx.insert(SubPagesTextsLangProd).values({
      title: content.title,
      description: content.description,
      sections: JSON.stringify(content.sections),
      lang: 1, // Assuming 1 is the default language ID
      subPageId: subPage.id,
    });

    return subPage;
  });
}

export async function getAllArticles() {
  try {
    const articles = await db.query.SubPagesProd.findMany({
      where: eq(SubPagesProd.isNews, true),
      with: {
        texts: true,
      },
      orderBy: (subPages, { desc }) => [desc(subPages.createdAt)],
    });
    return articles;
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
