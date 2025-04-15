"use clients";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/ui/button";

const BannerVariants = cva(
  "absolute text-white flex flex-col left-6 px-60 md:px-24 max-md:px-4 max-sm:px-8 w-auto",
  {
    variants: {
      justify: {
        center: "items-center",
        left: "items-start [&>p]:text-start",
        right: "items-end [&>p]:text-end",
      },
    },
  }
);

interface BannerProps extends VariantProps<typeof BannerVariants> {
  image: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  buttonLink?: string;
  containerClass?: string;
}

function Banner(props: BannerProps) {
  const {
    buttonLabel,
    buttonLink,
    description,
    title,
    image,
    justify = "left",
    containerClass
  } = props;

  const formattedText = useMemo(
    () =>
      description?.split("/n").map((text, i) => (
        <p
          className="text-base text-poppins w-2/3 mb-3 max-lg:w-4/5 max-md:text-sm"
          key={i}
          dangerouslySetInnerHTML={{
            __html:
              text?.replace("®", "<span class='align-top'>®</span>") ?? "",
          }}
        />
      )),
    [description]
  );

  return (
    <div
    id='banner'
      className={twMerge(
        "relative w-full min-h-[40rem] flex items-center h-auto max-md:min-h-[47rem]",
        containerClass
      )}
    >
      <Image
        src={image}
        alt="Hero background"
        objectPosition="50% 45%"
        className="inset-0 w-full h-full object-cover"
        fill
      />
      <div className={BannerVariants({ justify })}>
        {title && (
          <p
            className="font-bold text-5xl text-secular capitalize mb-4 max-md:text-3xl"
            dangerouslySetInnerHTML={{
              __html:
                title?.replace(
                  "®",
                  "<span class='text-3xl align-top'>®</span>"
                ) ?? "",
            }}
          />
        )}
        {description && formattedText}
        {buttonLink && (
          <Button
            asChild
            className="bg-white text-black rounded-xl text-xs px-3 h-10 hover:bg-white capitalize"
          >
            <Link href={buttonLink} prefetch>
              {buttonLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default Banner;
