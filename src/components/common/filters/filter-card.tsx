import {
  JSX,
  MouseEventHandler,
  useMemo,
  cloneElement,
  useCallback,
} from "react";
import { MapPin, CalendarRange } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import {
  CarouselImage,
  ICarouselImage,
} from "@/components/common/carousel-image";
import { Button } from "@/components/ui/button";
import { FilledStar } from "@/components/common/icons/filled-star";

export interface FilterCardProps {
  handleClick?: MouseEventHandler<HTMLDivElement>;
  containerClass?: string;
  images: string[];
  title: string;
  icon: JSX.Element;
  detailLink: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  hideDate?: boolean;
  description?: string;
  hideLocation?:boolean;
}

export function FilterCard(props: FilterCardProps): JSX.Element {
  const {
    handleClick,
    containerClass,
    images,
    location,
    endDate,
    startDate,
    title,
    icon,
    hideDate = false,
    description,
    detailLink,
    hideLocation = false,
  } = props;

  const formatter = useFormatter();
  const translations = useTranslations("common");

  const handleItemDetail = useCallback(
    () => window.open(detailLink),
    [detailLink]
  );

  const CoverImages: ICarouselImage[] = useMemo(
    () =>
      images.map((image) => ({
        name: image,
        url: image,
      })),
    [images]
  );

  const formattedDate = useMemo(() => {
    if (hideDate) return null;

    const start = startDate
      ? formatter.dateTime(new Date(startDate), {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const end =
      endDate && startDate !== endDate
        ? formatter.dateTime(new Date(endDate), {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null;

    if (start && end) return translations("dateRange", { start, end });
    if (start) return translations("dateRangeFrom", { start });
    if (end) return translations("dateRangeTo", { end });

    return translations("pendingDate");
  }, [startDate, formatter, endDate, translations, hideDate]);

  return (
    <div
      className={cn(
        "bg-white rounded-md border transition-transform duration-300 hover:scale-110 hover:z-10",
        containerClass
      )}
    >
      <div
        className="w-full h-[220px] rounded-t-md overflow-hidden relative"
        onClick={handleItemDetail}
      >
        <CarouselImage images={CoverImages} imageError="/logo.png" />
      </div>
      <div className="flex flex-col gap-1 relative px-2 pb-4 cursor-default">
        <Button
          className="rounded-full h-12 w-12 absolute -top-7 right-2 group transition-transform duration-300 cursor-pointer"
          onClick={handleItemDetail}
        >
          {cloneElement(icon, {
            className: "group-hover:scale-90 transition-transform duration-300",
          })}
        </Button>
        {/* <span className="my-2 flex gap-1 items-center">
          <FilledStar className="h-4 w-4" />
          <p className="text-roboto text-xs">4.5/5</p>
        </span> */}
        <label
          className="line-clamp-1 text-base font-medium text-roboto cursor-pointer mt-4"
          onClick={handleItemDetail}
        >
          {title}
        </label>
        {!hideLocation && <p
          className="flex gap-1 items-center w-full mb-2 cursor-pointer"
          onClick={handleClick}
        >
          <div className="w-5 h-5">
            <MapPin size={20} strokeWidth={2} className="text-primary" />
          </div>
          <span className="text-gray-500 text-xs line-clamp-1 text-roboto">
            {location}
          </span>
        </p>}
        {!hideDate && (
          <p className="flex gap-1 items-center">
            <div className="w-5 h-5">
              <CalendarRange
                size={20}
                strokeWidth={2}
                className="text-primary"
              />
            </div>
            <span className="text-gray-500 text-xs text-roboto">
              {formattedDate}
            </span>
          </p>
        )}
        <p className="line-clamp-2 text-roboto text-xs text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}
