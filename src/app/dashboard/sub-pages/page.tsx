import { getLocale } from "next-intl/server";

import { auth } from "@/auth";
import NewsArticlesTable from "@/components/common/news/news-articles-table";
import { getAllCountries } from "@/db/queries/countries";
import { getAllSubPages } from "@/lib/articles";
import { Locale } from "@/i18n/config";
import { getLanguageByLocale } from "@/db/queries/languages";

interface NewsArticlesTableProps {
  searchParams: {
    tab: "all" | "published" | "draft";
  };
}

export default async function NewsPage({
  searchParams: { tab = "all" },
}: NewsArticlesTableProps) {
  const locale = await getLocale();
  const session = await auth();
  const countryCast = await getAllCountries();
  const params: any = {};

  if (!session?.user) {
    return <p>User not authenticated</p>;
  }

  const localeId = await getLanguageByLocale(locale as Locale);
  const isPublished = tab === "published";

  if (tab !== "all") params["published"] = isPublished;

  const articles = await getAllSubPages(params);

  return (
    <NewsArticlesTable
      currentTab={tab}
      user={session.user}
      articles={articles}
      countries={countryCast}
      localeId={localeId?.id ?? 0}
    />
  );
}
