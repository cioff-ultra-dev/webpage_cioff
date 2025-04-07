import dynamic from "next/dynamic";
import { getTranslations, getLocale } from "next-intl/server";

import { getAllSubPages } from "@/lib/articles";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Locale } from "@/i18n/config";

const NewsCard = dynamic(() => import("./news-card"), { ssr: false });

interface LatestNewsProps {
  limit?: number;
  classes?: string;
  resultClasses?: string;
}

async function LatestNews({ limit, classes, resultClasses }: LatestNewsProps) {
  const translations = await getTranslations("latestNews");
  const locale = (await getLocale()) as Locale;
  const articles = await getAllSubPages(locale, {
    limit,
    isNews: true,
    published: true,
  });

  const items = articles.map((articleData) => {
    const text = articleData?.texts?.[0];
    if (!text) return null;

    return (
      <NewsCard
        key={articleData.id}
        date={articleData.originalDate}
        image={articleData.mainImage}
        title={text.title}
        subPageId={articleData.id}
        url={articleData.url}
      />
    );
  });

  return (
    <div className={cn("bg-white", classes)}>
      <section className="py-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-9 text-center text-roboto uppercase">
            {translations("title")}
          </h2>
          <div className={cn("columns-4 gap-2", resultClasses)}>
            <TooltipProvider>
              {items.length > 0 ? (
                items
              ) : (
                <div className="h-[300px] w-full flex justify-center items-center">
                  {translations("emptyContent")}
                </div>
              )}
            </TooltipProvider>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LatestNews;
