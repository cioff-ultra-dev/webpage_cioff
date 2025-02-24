"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Rating } from "@smastrom/react-rating";
import { useFormatter } from "next-intl";
import { Badge } from "../ui/badge";

export type CommentsProps = {
  // Add your type definitions here
  items: Array<{
    title?: string;
    authorName: string;
    comment: string;
    rating: number;
    createdAt: Date;
    logoUrl?: string;
  }>;
};

export default function Comments({ items }: CommentsProps) {
  const format = useFormatter();
  return (
    <div className="mx-auto space-y-8">
      <div className="space-y-6">
        {items.map(
          ({ logoUrl, authorName, createdAt, rating, comment }, index) => (
            <div className="space-y-4" key={`comment-${index}`}>
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={logoUrl} alt={authorName} />
                  <AvatarFallback>
                    {authorName.at(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{authorName}</h3>
                    <time className="text-sm text-muted-foreground">
                      {format.relativeTime(createdAt)}
                    </time>
                  </div>
                  <div className="flex gap-0.5 items-center">
                    <Rating readOnly style={{ maxWidth: 100 }} value={rating} />{" "}
                    ·{" "}
                    <span className="text-sm text-muted-foreground">
                      {rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
