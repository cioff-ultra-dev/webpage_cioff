import { getLocale } from "next-intl/server";

import { auth } from "@/auth";
import NewsArticlesTable from "@/components/common/news/news-articles-table";
import { getAllCountries } from "@/db/queries/countries";
import { getAllArticles } from "@/lib/articles";
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

  if (!session?.user) {
    return <p>User not authenticated</p>;
  }

  const localeId = await getLanguageByLocale(locale as Locale);
  const isPublished = tab === "published";

  const articles = await getAllArticles(
    undefined,
    tab === "all" ? undefined : isPublished
  );

  return (
    <NewsArticlesTable
      user={session.user}
      articles={articles}
      countries={countryCast}
      localeId={localeId?.id ?? 0}
    />
  );
}
