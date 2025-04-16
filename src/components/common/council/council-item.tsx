import React from "react";
import { findFlagUrlByCountryName } from "country-flags-svg";
import Image from "next/image";
import { Mail } from "lucide-react";
import Link from "next/link";

export interface CouncilItemProps {
  image: string;
  title: string;
  description: string;
  flag: string;
  email: string;
  countryId: number;
}

export function CouncilItem(props: CouncilItemProps) {
  const { title, description, flag, image, email, countryId } = props;

  const urlFlag = findFlagUrlByCountryName(flag);

  return (
    <div className="flex h-auto gap-4 mt-14">
      <div className="rounded-xl overflow-hidden relative min-h-60 h-60 min-w-40 w-40">
        <Image src={image} fill alt={title} objectFit="cover" />
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-xl font-poppins max-md:text-lg mb-1">
          {title}
        </p>
        <p className="flex flex-wrap gap-2 items-center text-gray-500 max-md:max-w-24 max-w-20 h-auto relative">
          <Mail />
          <Link
            href={`mailto:${email}`}
            className="hover:underline font-poppins h-auto break-words whitespace-normal max-w-36 xl 2xl:max-w-56"
          >
            {email}
          </Link>
        </p>
        <p className="text-lg font-poppins font-semibold max-w-60 max-md:text-sm mt-2 max-lg:max-w-40">
          {description}
        </p>
        <Link className="mt-4" href={`/national-sections/${countryId}`}>
          <Image
            src={urlFlag}
            width={40}
            height={40}
            alt={title}
            objectFit="cover"
          />
        </Link>
      </div>
    </div>
  );
}

export default CouncilItem;
