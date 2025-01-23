"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Autoplay from "embla-carousel-autoplay";
import { useLocale } from "next-intl";
import Image from "next/image";

import { getTimelineFromLocale } from "@/db/queries/timeline";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Locale } from "@/i18n/config";
import { TimelineSection } from "@/types/customization";

export default function CarouselHistory({
  containerClass = "",
}: {
  containerClass?: string;
}) {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [carousel, setCarousel] = useState<TimelineSection[]>([]);

  const locale = useLocale();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    async function fetchData() {
      const response = await getTimelineFromLocale(locale as Locale);
      const sections = response?.sections as TimelineSection[];

      setCarousel(sections ?? []);
    }

    fetchData();
  }, [locale]);

  const items = useMemo(
    () =>
      carousel
        .sort(
          (a: TimelineSection, b: TimelineSection) => a?.position - b?.position
        )
        .map((section, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent className="relative flex aspect-square items-center justify-center p-6">
                  {section.type === "image" ? (
                    <Image
                      key={section.id}
                      src={section.url}
                      alt={section.description}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : section.type === "video" ? (
                    <video
                      key={section.id}
                      controls
                      className="inset-0 w-full h-full object-cover rounded-lg"
                    >
                      <source src={section.url} type="video/mp4" />
                    </video>
                  ) : (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${
                        section.url.split("v=")[1]
                      }`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full object-cover md:basis-1/2 lg:basis-1/3"
                    ></iframe>
                  )}
                  {section.type === "image" ? (
                    <p className="absolute text-sm text-center text-muted-foreground ">
                      {section.description}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        )),
    [carousel]
  );

  return (
    <div className={cn("w-full", containerClass)}>
      <Carousel
        className="w-full"
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setApi}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>{items}</CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="py-2 text-center text-sm text-muted-foreground">
        Slide {current} of {count}
      </div>
    </div>
  );
}
