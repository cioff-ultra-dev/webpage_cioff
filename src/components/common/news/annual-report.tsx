"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { Locale } from "@/i18n/config";

const IMAGES = [
  {
    name: "report-2023",
    locale: {
      en: {
        link: "https://drive.google.com/file/d/1-OMqAozkx0PPUBUrJpmBfpnItsClG8P-/view?usp=drive_link",
        image: "/Report2023_EN.png",
      },
      es: {
        link: "https://drive.google.com/file/d/19thN-MwUqwm4FZ3kDaI9SK9_tpnaTBJe/view?usp=drive_link",
        image: "/Report2023_ES.png",
      },
      fr: {
        link: "https://drive.google.com/file/d/1Cr-3FFmAEXlUABFw4LXSKUiD-ygiv2J5/view?usp=drive_link",
        image: "/Report2023_FR.png",
      },
    },
  },
  {
    image: "/Report2022_EN.png",
    name: "report-2022",
    link: "https://drive.google.com/file/d/1QhD2Trml4LQ6OtcQfhtn4Yn-LfvKc_ur/view?usp=drive_link",
  },
  {
    image: "/Report2021_EN.png",
    name: "report-2021",
    link: "https://drive.google.com/file/d/1kMhqE8ZgqsLi7WVZeITzRaqhhskrNri1/view?usp=drive_link",
  },
  {
    image: "/Report2020_EN.png",
    name: "report-2020",
    link: "https://drive.google.com/file/d/1BeWUlqSksDpxChsxOr7MePHOLDOteTWV/view?usp=drive_link",
  },
];

interface AnnualReportProps {
  validatePath?: boolean;
}

function AnnualReport(props: AnnualReportProps) {
  const { validatePath = true } = props;

  const path = usePathname();
  const locale = useLocale() as Locale;

  const imagesComponents = useMemo(
    () =>
      IMAGES.map((item) => {
        if (item.locale) {
          const data = item.locale[locale];
          return (
            <Link
              key={item.name}
              href={data.link}
              target="_blank"
              className="h-[500px] relative overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300"
            >
              <Image src={data.image} alt={item.name} fill />
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.link}
            target="_blank"
            className="h-[500px] relative overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300"
          >
            <Image src={item.image} alt={item.name} fill />
          </Link>
        );
      }),
    [locale]
  );

  if (validatePath && !path.includes("/annual-reports")) return null;

  return (
    <div className="grid grid-cols-4 w-full gap-6 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 px-36 max-lg:px-16 max-md:px-12 max-sm:px-12">
      {imagesComponents}
    </div>
  );
}

export default AnnualReport;
