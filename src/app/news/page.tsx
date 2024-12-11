import Image from "next/image";
import Link from "next/link";

import { getAllArticles } from "@/lib/articles";
import { Section } from "@/types/article";

export default async function NewsPage() {
  const articles = await getAllArticles();

  return (
    <div className="bg-white min-h-screen">
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Latest News</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((articleData) => {
              const text = articleData?.texts?.[0];
              if (!text) return null;

              const sections = text.sections ?? [];
              const coverImage = sections.find(
                (section: Section) => section.type === "image"
              )?.content;

              const firstParagraph =
                sections.find(
                  (section: Section) => section.type === "paragraph"
                )?.content || "";

              const description =
                firstParagraph.split(" ").slice(0, 30).join(" ") +
                (firstParagraph.split(" ").length > 30 ? "..." : "");

              return (
                <Link
                  key={articleData.id}
                  href={`/news/${articleData.id}`}
                  className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-video relative">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={text.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {text.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">{description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
