"use client";
import Image from "next/image";

export function CoverImageEvent({ cover }: { cover: string }) {
  return (
    <Image
      loader={({ src }) => `${src}`}
      src={cover || "/placeholder.svg"}
      alt="Banner"
      className="object-cover w-full h-full"
      width="1200"
      height="400"
      style={{ aspectRatio: "1200/400", objectFit: "cover" }}
    />
  );
}
