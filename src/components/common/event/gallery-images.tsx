"use client";

import { useState } from "react";
import { SelectFestival } from "@/db/schema";
import { Gallery, Image } from "react-grid-gallery";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export interface CustomImage extends Image {}

export function GalleryImageEvent({ event }: { event: SelectFestival }) {
  const photos: CustomImage[] =
    event?.photos?.split(",").map((item) => {
      return {
        src: item,
        width: 600,
        height: 400,
      };
    }) || [];
  const [index, setIndex] = useState(-1);

  const handleClick = (index: number, _item: CustomImage) => setIndex(index);

  return (
    <div>
      <Gallery
        images={photos}
        onClick={handleClick}
        enableImageSelection={false}
      />
      <Lightbox
        slides={photos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
      />
    </div>
  );
}
