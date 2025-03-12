"use client";

import { useRef, useMemo } from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

import {
  Carousel,
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
  images: ICarouselImage[];
}

export function CarouselImage(props: CarouselProps) {
  const { images, containerClass = "" } = props;

  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));

  const items = useMemo(
    () =>
      images.map((image, index) => (
        <CarouselItem key={index} className="w-full">
          <Image
            key={index}
            src={image.url}
            alt={image.name}
            width={200}
            height={400}
            className="w-full h-full object-cover"
          />
        </CarouselItem>
      )),
    [images]
  );

  const arrows = useMemo(() => {
    if (items.length <= 1) return null;

    return [
      <CarouselPrevious
        key="arrow-prev"
        className="absolute left-2 bg-transparent hover:bg-transparent border-none"
        icon={<ChevronLeft className="text-white" strokeWidth={4} size={48} />}
      />,
      <CarouselNext
        key="arrow-next"
        className="absolute right-2 bg-transparent hover:bg-transparent border-none"
        icon={<ChevronRight className="text-white" strokeWidth={4} size={48} />}
      />,
    ];
  }, [items]);

  return (
    <div className={cn("w-full h-full", containerClass)}>
      <Carousel
        className="w-full h-full"
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="h-full">{items}</CarouselContent>
        {arrows}
      </Carousel>
    </div>
  );
}
