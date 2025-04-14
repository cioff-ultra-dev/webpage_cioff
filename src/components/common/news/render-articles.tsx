import { useMemo, Suspense } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import CarouselHistory from "@/components/common/carousel-history";
import { BannerContent, ButtonContent, Section } from "@/types/article";
import LatestNews from "@/components/common/news/latest-news";
import Button from "./button-content";
import { CustomImage, GalleryImageEvent } from "../event/gallery-images";
import Banner from "../banner";

function RenderArticles({ sections }: { sections: Section[] }) {
  const translations = useTranslations("news.form");

  const items = useMemo(
    () =>
      sections.map((section: Section) => {
        switch (section.type) {
          case "image":
            const content = section.content as string;

            const gallery: CustomImage[] =
              content.split(",").map((item) => ({
                key: item!,
                src: item!,
                width: 600,
                height: 600,
              })) || [];

            return gallery.length > 1 ? (
              <GalleryImageEvent
                containerClass="flex-1 w-full justify-center items-center"
                gallery={gallery}
                thumbnailStyle={{
                  height: 180,
                  width: 180,
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                tileViewportStyle={{
                  height: 180,
                  width: 180,
                  borderRadius: "5px",
                }}
              />
            ) : (
              gallery.map((content) => (
                <Image
                  key={section.id}
                  src={content.src}
                  alt={content.src}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover rounded-lg py-6"
                />
              ))
            );
          case "paragraph":
            const paragraph = section.content as string;

            return (
              <div
                key={section.id}
                className="text-base editor my-4 text-start [&>p]:mb-3"
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
          case "banner":
            const bannerInfo = section.content as BannerContent;
            return (
                <Banner
                  key={section.id}
                  image={bannerInfo.image}
                  title={bannerInfo.title}
                  description={bannerInfo.description}
                  justify={bannerInfo.justify}
                  containerClass="my-32 w-screen"
                />
            );
          default:
            return section.content as string;
        }
      }),
    [sections]
  );

  return (
    <section className="[&>div:not(#banner)]:px-28 [&>div:not(#banner)]:container [&>*:not(#banner)]:mx-auto text-center">
      {items}
    </section>
  );
}

export default RenderArticles;
