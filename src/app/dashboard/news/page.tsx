import { auth } from "@/auth";
import NewsArticlesTable from "@/components/common/news/news-articles-table";
import { getAllArticles } from "@/lib/articles";
import { getAllCountries } from "@/db/queries/countries";

export default async function NewsPage() {
  const session = await auth();
  const countryCast = await getAllCountries();

  if (!session?.user) {
    return <p>User not authenticated</p>;
  }

  const articles = await getAllArticles();

  return (
    <NewsArticlesTable
      user={session.user}
      articles={articles}
      countries={countryCast}
    />
  );
}
