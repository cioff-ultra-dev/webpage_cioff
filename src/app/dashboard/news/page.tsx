import { auth } from "@/auth";
import NewsArticlesTable from "@/components/common/news/news-articles-table";
import { getAllArticles } from "@/lib/articles";

export default async function NewsPage() {
    const session = await auth();

    if (!session?.user) {
        return <p>User not authenticated</p>;
    }

    const articles = await getAllArticles();

    return <NewsArticlesTable user={session.user} articles={articles} />;
}
