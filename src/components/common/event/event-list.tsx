import { JSX } from "react";
import { getTranslations, getLocale } from "next-intl/server";

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getEventsByDate } from "@/db/queries/events";
import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n/config";

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
  const locale = await getLocale() as Locale;

  const events = await getEventsByDate({ fromDate: new Date(), limit, locale });

  const items = events.map(({ festival, info }) => (
    <div key={festival.id} className="flex justify-between py-8 border-b">
      <div>{info.name}</div>
      <Button className="rounded-3xl h-8 px-6">RSVP</Button>
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
