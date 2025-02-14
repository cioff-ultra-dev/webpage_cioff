"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
      className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="aspect-video relative">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p
          className="text-gray-600 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: description }}
        ></p>
      </div>
    </div>
  );
}

export default NewsCard;
