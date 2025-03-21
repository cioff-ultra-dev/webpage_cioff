import { JSX } from "react";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
//import { getEventsByDate } from "@/db/queries/events";
//import { Locale } from "@/i18n/config";

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

  const items = [
    {
      title: translations("title1"),
      country: "Slovenia",
      start: "03/22/2025",
      end: "03/28/2025",
    },
    {
      title: translations("title2"),
      country: "Costa Rica",
      start: "05/21/2025",
      end: "05/25/2025",
    },
    {
      title: translations("title3"),
      country: "Chile",
      start: "10/19/2025",
      end: "10/26/2025",
    },
  ].map(({ country, end, start, title }) => (
    <div key={country} className="flex justify-start py-8 border-b items-end">
      <div className="flex flex-col">
        <span className="text-secular text-sm">
          {format(new Date(start), "LLL, dd")} -{" "}
          {format(new Date(end), "LLL, dd")}
        </span>
        <p>
          <span className="font-medium text-xl text-secular">{title} / </span>
          <span className="text-roboto">{country}</span>
        </p>
      </div>
    </div>
  ));

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
