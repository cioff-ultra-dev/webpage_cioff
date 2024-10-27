import { auth } from "@/auth";
import EditableArticleTemplate from "@/components/common/news/news-articles-form";
import { Section } from "@/types/article";
import { getArticleById, updateArticle } from "@/lib/articles";

export default async function ArticlePage({ params }: { params: { id: string } }) {
    const session = await auth();

    if (!session?.user) {
        return <p>User not authenticated</p>;
    }

    const article = await getArticleById(params.id);

    if (!article) {
        return <p>Article not found</p>;
    }

    const handleSave = async (content: { title: string; description: string; sections: Section[] }) => {
        await updateArticle(params.id, content);
    };

    const sections = article.texts[0]?.sections ? JSON.parse(article.texts[0].sections) : [];

    return (
        <EditableArticleTemplate
            initialContent={{
                title: article.texts[0]?.title || '',
                description: article.texts[0]?.description || '',
                sections: sections,
            }}
            onSave={handleSave}
            currentUser={{
                id: session.user.id,
                name: session.user.name || '',
                image: session.user.image || undefined,
            }}
        />
    );
}
