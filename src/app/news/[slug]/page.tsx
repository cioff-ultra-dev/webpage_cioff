import { getLocale } from "next-intl/server";
import { Locale } from "@/i18n/config";
import { headers } from "next/headers";

import { getArticleByUrl } from "@/lib/articles";
import { getLanguageByLocale } from "@/db/queries/languages";
import { Section } from "@/types/article";
import NewsDetailTemplate from "@/components/common/news/news-detail-template";

export default async function DetailArticle({
  params,
}: {
  params: { slug: string };
}) {
  const headersList = headers();
  const locale = await getLocale();
  const lang = await getLanguageByLocale(locale as Locale);

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = headersList.get("host");
  const url = `${protocol}://${host}/news/${params.slug}`;

  const article = await getArticleByUrl(url);

  if (!article) {
    return <p>Article not found</p>;
  }

  const articleTranslated = article?.texts?.find(
    (article) => article.lang === lang?.id
  );
  const sections = articleTranslated?.sections?.sort(
    (a: Section, b: Section) => (a?.position ?? a?.id) - (b?.position ?? b?.id)
  ) as Section[];

  return (
    <NewsDetailTemplate
      sections={sections}
      subPage={article}
      title={articleTranslated?.title ?? ""}
    />
  );
}
