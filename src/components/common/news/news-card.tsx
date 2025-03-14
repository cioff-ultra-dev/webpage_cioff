"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface NewsCardProps {
  image?: string;
  title: string;
  subPageId: number;
  description: string;
  url: string;
}

function NewsCard(props: NewsCardProps) {
  const { image, title, subPageId, description, url } = props;

  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(url ?? `/news/${subPageId}`);
  }, [router, url, subPageId]);

  return (
    <div
      onClick={handleClick}
      className="group rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-auto flex flex-col bg-primary-foreground cursor-pointer mb-3"
    >
      <div className="h-auto overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 !h-auto !relative"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="px-4 pt-3 pb-2 relative text-center h-32">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="text-sm font-medium mb-2 line-clamp-1 transition-colors text-secular">
              {title}
            </h3>
          </TooltipTrigger>
          <TooltipContent side="top">{title}</TooltipContent>
        </Tooltip>
        <p
          className="text-xs line-clamp-3 text-poppins"
          dangerouslySetInnerHTML={{ __html: description }}
        ></p>
      </div>
    </div>
  );
}

export default NewsCard;
