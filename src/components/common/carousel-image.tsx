"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export interface ICarouselImage {
    name: string;
    url: string;
  }

interface CarouselProps {
  containerClass?: string;
  images:ICarouselImage[]
}

export function CarouselImage(props: CarouselProps) {
  const { images,containerClass = "" } = props;

  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const items = useMemo(
    () =>
      images.map((image, index) => (
        <CarouselItem key={index} className="w-screen">
                <Image
                  key={index}
                  src={image.url}
                  alt={image.name}
                  width={1200}
                  height={400}
                  className="w-screen h-full object-cover"
                />
        </CarouselItem>
      )),
    [images]
  );

  return (
    <div className={cn("w-full h-full", containerClass)}>
      <Carousel
        className="w-full h-full"
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setApi}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-full">{items}</CarouselContent>
        <CarouselPrevious className="absolute left-2 bg-white bg-opacity-30" />
        <CarouselNext className="absolute right-2 bg-white bg-opacity-30" />
      </Carousel>
    </div>
  );
}
