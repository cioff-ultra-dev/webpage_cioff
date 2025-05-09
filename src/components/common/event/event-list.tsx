import { JSX } from "react";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { GalleryImageEvent } from "@/components/common/event/gallery-images";

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
//import { getEventsByDate } from "@/db/queries/events";
//import { Locale } from "@/i18n/config";

const EVENTS = [
  {
    title: "title4",
    country: "country4",
    continent: "continent4",
    start: "04/26/2025",
    image: "/America.jpg",
  },
  {
    title: "title5",
    country: "country5",
    continent: "continent5",
    start: "05/09/2025",
    end: "05/11/2025",
    image: "/Europe.jpg",
  },
  {
    title: "title6",
    country: "country6",
    continent: "continent6",
    start: "05/21/2025",
    end: "05/25/2025",
    image: "/Latin.jpg",
  },
  {
    title: "title7",
    country: "country7",
    continent: "continent7",
    start: "05/22/2025",
    end: "05/26/2025",
    image: "/North.jpg",
  },
  {
    title: "title9",
    country: "country9",
    continent: "continent9",
    start: "05/10/2025",
    end: "05/15/2025",
    image: "/Asia.jpg",
  },
  {
    title: "title8",
    country: "country8",
    continent: "continent8",
    start: "06/24/2025",
    end: "06/28/2025",
    image: "/Africa.jpg",
  },
  {
    title: "title10",
    country: "country10",
    continent: "continent10",
    start: "10/19/2025",
    end: "10/26/2025",
    image: "/WorldCongress.jpg",
  },
];

interface LatestNewsProps {
  limit?: number;
  classes?: string;
  resultClasses?: string;
}

export default async function EventList(
  props: LatestNewsProps
): Promise<JSX.Element> {
  const { classes, resultClasses, limit = 1000 } = props;
  const translations = await getTranslations("events");

  //const events = await getEventsByDate({ fromDate: new Date(), limit, locale });

  const items = EVENTS.map(
    ({ country, end, start, title, image, continent }) => (
      <div
        key={country}
        className="flex justify-start py-2 border-b items-center"
      >
        <div className="h-32 w-auto relative mr-14">
          <GalleryImageEvent
          containerClass="h-[100px] w-[120px]"
            gallery={[{ src: image, width: 1000, height: 1200 }]}
            thumbnailStyle={{
              height: 100,
              width: 150,
              borderRadius: "5px",
              cursor: "pointer",
            }}
            tileViewportStyle={{
              height: 100,
              width: 150,
              borderRadius: "5px",
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-secular text-sm">
            {format(new Date(start), "LLL, dd")}
            {end ? format(new Date(end), " - LLL, dd") : null}
            {format(new Date(end ?? start), " yyyy")}
          </span>
          <p>
            <span className="font-medium text-xl text-secular">
              {translations.rich(title, {
                mark: (chunks) => (
                  <span className="text-base align-top">{chunks}</span>
                ),
              })}{" "}
              /{" "}
            </span>
            <span className="text-roboto">{translations(continent)}</span>
          </p>
          <p className="text-roboto">{translations(country)}</p>
        </div>
      </div>
    )
  );

  return (
    <div className={cn("bg-white", classes)}>
      <section className="py-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-9 text-center text-roboto uppercase">
            {translations("title")}
          </h2>
          {true ? (
            <div className={cn("flex flex-col gap-4", resultClasses)}>
              <TooltipProvider>{items}</TooltipProvider>
            </div>
          ) : (
            <div className="h-[300px] w-full flex justify-center items-center col-span-full text-gray-500">
              {translations("emptyContent")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
