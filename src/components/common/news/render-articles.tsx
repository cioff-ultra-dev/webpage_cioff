import { useMemo, Suspense } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import CarouselHistory from "@/components/common/carousel-history";
import { ButtonContent, Section } from "@/types/article";
import LatestNews from "@/components/common/news/latest-news";
import Button from "./button-content";

function RenderArticles({ sections }: { sections: Section[] }) {
  const translations = useTranslations("news.form");

  const items = useMemo(
    () =>
      sections.map((section: Section) => {
        switch (section.type) {
          case "image":
            const content = section.content as string;
            return (
              <Image
                key={section.id}
                src={content.replace(",", "")}
                alt={content}
                width={800}
                height={400}
                className="w-full h-auto object-cover rounded-lg py-6"
              />
            );
          case "paragraph":
            const paragraph = section.content as string;

            return (
              <div
                key={section.id}
                className="text-base editor my-4"
                dangerouslySetInnerHTML={{ __html: paragraph ?? "" }}
              />
            );
          case "youtube":
            const videoYoutube = section.content as string;
            const videoId = videoYoutube.split("v=")[1];

            return (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-[50vh] object-cover"
              ></iframe>
            );
          case "video":
            const videoUrl = section.content as string;
            return (
              <video
                key={section.id}
                controls
                className="inset-0 w-full max-h-[50vh] object-cover"
              >
                <source src={videoUrl.replace(",", "")} type="video/mp4" />
              </video>
            );
          case "carousel":
            return <CarouselHistory key={section.id} containerClass="my-8" />;
          case "news":
            return (
              <Suspense key={section.id} fallback={<p>Loading...</p>}>
                <LatestNews limit={3} classes="w-full" />
              </Suspense>
            );
          case "button":
            const buttonInfo = section.content as ButtonContent;

            return <Button key={section.id} {...buttonInfo} />;
          default:
            return section.content as string;
        }
      }),
    [sections]
  );

  return <section className="w-full h-full px-28">{items}</section>;
}

export default RenderArticles;
