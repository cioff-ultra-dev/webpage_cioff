import { useMemo, Suspense } from "react";
import Image from "next/image";

import CarouselHistory from "@/components/common/carousel-history";
import { Section } from "@/types/article";
import LatestNews from "@/components/common/news/latest-news";

function RenderArticles({ sections }: { sections: Section[] }) {
  const items = useMemo(
    () =>
      sections.map((section: Section) => {
        switch (section.type) {
          case "image":
            return (
              <Image
                key={section.id}
                src={section.content.replace(",", "")}
                alt={section.content}
                width={800}
                height={400}
                className="w-full h-auto object-cover rounded-lg py-6"
              />
            );
          case "paragraph":
            return (
              <div
                key={section.id}
                className="text-base editor my-4"
                dangerouslySetInnerHTML={{ __html: section.content ?? "" }}
              />
            );
          case "video":
            return (
              <video
                key={section.id}
                controls
                className="inset-0 w-full max-h-[50vh] object-cover"
              >
                <source
                  src={section.content.replace(",", "")}
                  type="video/mp4"
                />
              </video>
            );
          case "carousel":
            return <CarouselHistory key={section.id} />;
          case "news":
            return (
              <Suspense key={section.id} fallback={<p>Loading...</p>}>
                <LatestNews limit={3} classes="w-full" />
              </Suspense>
            );
          default:
            return section.content;
        }
      }),
    [sections]
  );

  return <section className="w-full h-full px-28">{items}</section>;
}

export default RenderArticles;
