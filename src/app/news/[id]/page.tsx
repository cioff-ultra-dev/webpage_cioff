import Image from "next/image";
import { getLocale } from "next-intl/server";

import { Locale } from "@/i18n/config";
import { getArticleById } from "@/lib/articles";
import { getLanguageByLocale } from "@/db/queries/languages";
import { Section } from "@/types/article";
import RenderSections from "@/components/common/news/render-articles";
import { Header } from "@/components/common/header";

export default async function ArticleViewPage({
  params,
}: {
  params: { id: string };
}) {
  const locale = await getLocale();
  const lang = await getLanguageByLocale(locale as Locale);
  const article = await getArticleById(params.id);
  if (!article) {
    return <p>Article not found</p>;
  }

  const articleTranslated = article?.texts?.find(
    (article) => article.lang === lang?.id
  );
  const sections = articleTranslated?.sections?.sort(
    (a: any, b: any) => a.id - b.id
  ) as Section[];

  return (
    <div>
      <Header text="text-black" className="border-b" />
      <main className="flex flex-col items-center pb-5 min-h-[90vh] bg-gray-100">
        <div className="container h-full bg-white py-16 justify-center">
          <div className="flex flex-col items-center w-full mb-12">
            <h3 className="text-gray-500">
              {article.country.slug} -{" "}
              {article.originalDate
                .toISOString()
                .split("T")[0]
                ?.split("-")
                .reverse()
                .join(".")}
            </h3>
            <h1 className="font-bold mb-12 text-2xl">
              {articleTranslated?.title}
            </h1>
            <div className="h-[35rem] w-full bg-gray-400 flex justify-center items-center">
              Image here
            </div>
          </div>
          <RenderSections sections={sections ?? []} />
        </div>
      </main>
      <footer className="bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-800 text-xs sm:text-sm">info@cioff.org</p>
          <Image
            src="/logo.png"
            width="100"
            height="100"
            alt="CIOFF Logo"
            className="inline-block my-6"
          />
          <p className="text-gray-800 text-xs sm:text-sm">
            © CIOFF 1998 - 2024 | cioff.org
          </p>
        </div>
      </footer>
    </div>
  );
}
