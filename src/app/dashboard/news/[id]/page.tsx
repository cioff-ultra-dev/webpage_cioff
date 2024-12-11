import { auth } from "@/auth";
import EditableArticleTemplate from "@/components/common/news/news-articles-form";
import { getArticleById, updateArticle } from "@/lib/articles";
import { SelectedSubPage, ArticleBody } from "@/types/article";
import { getAllCountries } from "@/db/queries/countries";

export default async function ArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user) {
    return <p>User not authenticated</p>;
  }

  const article = await getArticleById(params.id);
  const countryCast = await getAllCountries();

  if (!article) {
    return <p>Article not found</p>;
  }

  const handleSave = async (content: ArticleBody) => {
    await updateArticle(params.id, content);
  };

  return (
    <EditableArticleTemplate
      initialContent={article as SelectedSubPage}
      onSave={handleSave}
      currentUser={{
        id: session.user.id,
        name: session.user.name || "",
        image: session.user.image || undefined,
      }}
      countries={countryCast}
    />
  );
}
