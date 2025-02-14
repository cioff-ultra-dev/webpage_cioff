import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";

import { getAllSubPages } from "@/lib/articles";
import { Section } from "@/types/article";
import { cn } from "@/lib/utils";

const NewsCard = dynamic(() => import("./news-card"), { ssr: false });

interface LatestNewsProps {
  limit?: number;
  classes?: string;
}

async function LatestNews({ limit, classes }: LatestNewsProps) {
  const translations = await getTranslations("latestNews");
  const articles = await getAllSubPages({
    limit,
    isNews: true,
    published: true,
  });

  const items = articles.map((articleData) => {
    const text = articleData?.texts?.[0];
    if (!text) return null;

    const sections = text.sections ?? [];

    const firstParagraph = (sections.find(
      (section: Section) => section.type === "paragraph"
    )?.content || "") as string;

    const description =
      firstParagraph.split(" ").slice(0, 30).join(" ") +
      (firstParagraph.split(" ").length > 30 ? "..." : "");

    return (
      <NewsCard
        key={articleData.id}
        description={description}
        image={articleData.mainImage}
        title={text.title}
        subPageId={articleData.id}
        url={articleData.url}
      />
    );
  });

  return (
    <div className={cn("bg-white", classes)}>
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">{translations("title")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {items.length > 0 ? (
              items
            ) : (
              <div className="col-span-3 h-[300px] w-full flex justify-center items-center">
                {translations("emptyContent")}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LatestNews;
