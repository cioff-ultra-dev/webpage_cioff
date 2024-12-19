"use client";

import { useState } from "react";
import { Gallery, Image } from "react-grid-gallery";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export interface CustomImage extends Image {}

export function GalleryImageEvent({ gallery }: { gallery: CustomImage[] }) {
  const photos: CustomImage[] = gallery;
  const [index, setIndex] = useState(-1);

  const handleClick = (index: number, _item: CustomImage) => setIndex(index);

  return (
    <div>
      <Gallery
        images={photos}
        onClick={handleClick}
        enableImageSelection={false}
        tileViewportStyle={{ width: 300, borderRadius: "5px" }}
        margin={6}
        thumbnailStyle={{ width: 300, borderRadius: "5px" }}
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
