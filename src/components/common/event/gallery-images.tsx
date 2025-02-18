"use client";

import { useState } from "react";
import { Gallery, Image, StyleProp } from "react-grid-gallery";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export interface CustomImage extends Image {}

export function GalleryImageEvent({
  gallery,
  thumbnailStyle = { width: 300, borderRadius: "5px" },
  tileViewportStyle = { width: 300, borderRadius: "5px" },
  containerClass = ""
}: {
  gallery: CustomImage[];
  tileViewportStyle?: StyleProp;
  thumbnailStyle?: StyleProp;
  containerClass?: string;
}) {
  const photos: CustomImage[] = gallery;
  const [index, setIndex] = useState(-1);

  const handleClick = (index: number, _item: CustomImage) => setIndex(index);

  return (
    <div className={containerClass}>
      <Gallery
        images={photos}
        onClick={handleClick}
        enableImageSelection={false}
        tileViewportStyle={tileViewportStyle}
        margin={6}
        thumbnailStyle={thumbnailStyle}
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
