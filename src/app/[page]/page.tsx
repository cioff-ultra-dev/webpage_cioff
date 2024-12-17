import { getLocale } from "next-intl/server";
import { Locale } from "@/i18n/config";
import { headers } from "next/headers";

import { getSubPage } from "@/lib/articles";
import { getLanguageByLocale } from "@/db/queries/languages";
import { Section } from "@/types/article";
import NewsDetailTemplate from "@/components/common/news/news-detail-template";

export default async function DynamicPage({
  params,
}: {
  params: { page: string };
}) {
  const headersList = headers();
  const locale = await getLocale();
  const lang = await getLanguageByLocale(locale as Locale);

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = headersList.get("host");
  const url = `${protocol}://${host}/${params.page}`;

  const article = await getSubPage({ url, published: true });

  if (!article) {
    return <p>Page not found</p>;
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
