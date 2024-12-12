import { getLocale } from "next-intl/server";

import { auth } from "@/auth";
import NewsArticlesTable from "@/components/common/news/news-articles-table";
import { getAllCountries } from "@/db/queries/countries";
import { getAllArticles } from "@/lib/articles";
import { Locale } from "@/i18n/config";
import { getLanguageByLocale } from "@/db/queries/languages";

export default async function NewsPage() {
  const locale = await getLocale();
  const session = await auth();
  const countryCast = await getAllCountries();

  if (!session?.user) {
    return <p>User not authenticated</p>;
  }

  const localeId = await getLanguageByLocale(locale as Locale);
  const articles = await getAllArticles();

  return (
    <NewsArticlesTable
      user={session.user}
      articles={articles}
      countries={countryCast}
      localeId={localeId?.id ?? 0}
    />
  );
}
