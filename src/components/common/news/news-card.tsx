"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarRange } from "lucide-react";

interface NewsCardProps {
  image?: string;
  title: string;
  subPageId: number;
  date: Date;
  url: string;
}

function NewsCard(props: NewsCardProps) {
  const { image, title, subPageId, date, url } = props;

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
      <div className="px-4 pt-3 pb-2 relative text-center h-28">
        <h3 className="text-sm font-medium mb-3 transition-colors text-secular">
          {title}
        </h3>
        <p className="text-sm line-clamp-3 text-poppins flex items-center justify-center gap-4">
          <CalendarRange size={20} strokeWidth={2} className="text-primary" />
          {format(date, "dd/MM/yyyy")}
        </p>
      </div>
    </div>
  );
}

export default NewsCard;
