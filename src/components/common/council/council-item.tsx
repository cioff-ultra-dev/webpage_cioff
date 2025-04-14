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
}

export function CouncilItem(props: CouncilItemProps) {
  const { title, description, flag, image, email } = props;

  const urlFlag = findFlagUrlByCountryName(flag);

  return (
    <div className="flex h-auto gap-4 mt-14">
      <div className="rounded-xl overflow-hidden relative h-60 w-40">
        <Image src={image} fill alt={title} objectFit="cover" />
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-xl font-poppins max-md:text-lg mb-1">{title}</p>
        <p className="flex flex-wrap gap-2 items-center text-gray-500">
          <Mail />
          <Link
            href={`mailto:${email}`}
            className="hover:underline font-poppins"
          >
            {email}
          </Link>
        </p>
        <p className="text-lg font-poppins font-semibold max-w-48 max-md:text-sm mt-2">
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
