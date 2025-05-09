import { useEffect, useState } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { DateRange, Matcher } from "react-day-picker";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCallbackRef } from "@/hooks/use-callback-ref";

export type DateRangeProps = DateRange;

export function DatePickerWithRange({
  className,
  onValueChange,
  defaultDates,
  buttonClassName,
  fromDate,
  disabled,
  showIcon = true,
}: React.HTMLAttributes<HTMLDivElement> & {
  onValueChange: (value: DateRange | undefined) => void;
  defaultDates?: DateRange;
  buttonClassName?: string;
  fromDate?: Date | undefined;
  disabled?: Matcher;
  showIcon?: boolean;
}) {
  const translations = useTranslations("common");
  const [date, setDate] = useState<DateRange | undefined>({
    from: defaultDates?.from ?? undefined,
    to: defaultDates?.to ?? undefined,
  });

  const handleValueChange = useCallbackRef(onValueChange);

  useEffect(() => {
    handleValueChange(date);
  }, [date, handleValueChange]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <div className="flex items-center border rounded-lg">
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="ghost"
              className={cn(
                "w-[300px] justify-start text-left font-normal text-muted-foreground rounded-r-none",
                !date && "text-muted-foreground",
                buttonClassName
              )}
            >
              {showIcon && <CalendarIcon className="mr-2 h-4 w-4" />}
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>{translations("pickDate")}</span>
              )}
            </Button>
          </PopoverTrigger>
          {date?.from && (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-l-none"
              onClick={() => setDate({ from: undefined, to: undefined })}
            >
              <X className="text-muted-foreground" />
            </Button>
          )}
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            fromDate={fromDate}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
