import React from "react";
import { findFlagUrlByCountryName } from "country-flags-svg";
import Image from "next/image";

export interface CouncilItemProps {
  image: string;
  title: string;
  description: string;
  flag: string;
}

export function CouncilItem(props: CouncilItemProps) {
  const { title, description, flag, image } = props;

    const urlFlag = findFlagUrlByCountryName(flag);

  return (
    <div className="flex h-auto gap-4 mt-14">
      <div className="rounded-xl overflow-hidden relative h-60 w-40">
        <Image src={image} fill alt={title} objectFit="cover" />
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-xl font-poppins mb-2 max-md:text-lg">
          {title}
        </p>
        <p className="text-lg font-poppins font-semibold max-w-48 max-md:text-sm">
          {description}
        </p>
        <div className="mt-4">
          <Image
            src={urlFlag}
            width={40}
            height={40}
            alt={title}
            objectFit="cover"
          />
        </div>
      </div>
    </div>
  );
}

export default CouncilItem;
