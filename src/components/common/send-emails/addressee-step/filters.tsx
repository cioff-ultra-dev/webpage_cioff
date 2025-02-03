import { JSX, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { DateRange } from "react-day-picker";
import { MultiSelectProps } from "@/components/ui/multi-select";
import { Grid2X2Plus, Earth, Globe } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/datepicker-with-range";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { SearchIcon } from "@/components/common/icons/search";
import { SearchFormElement } from "@/types/send-email";
import { cn } from "@/lib/utils";

interface FiltersProps {
  regions: MultiSelectProps["options"];
  categories: MultiSelectProps["options"];
  countries: MultiSelectProps["options"];
  isRegionLoading: boolean;
  handleSubmit: (event: FormEvent<SearchFormElement>) => Promise<void>;
  setCountries: MultiSelectProps["onValueChange"];
  setRegions: MultiSelectProps["onValueChange"];
  isCountryLoading?: boolean;
  isCategoriesLoading?: boolean;
  setCategories?: MultiSelectProps["onValueChange"];
  setDateRange?: (value: DateRange | undefined) => void;
  showInputSearch?: boolean;
  showIconLabels?: boolean;
}

function Filters(props: FiltersProps): JSX.Element {
  const {
    categories,
    regions,
    countries,
    handleSubmit,
    isCountryLoading,
    isRegionLoading,
    setCategories,
    setCountries,
    setRegions,
    setDateRange,
    isCategoriesLoading,
    showInputSearch = true,
    showIconLabels = false,
  } = props;
  const t = useTranslations();

  return (
    <Card>
      <CardContent className="pt-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-end space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
        >
          {showInputSearch && (
            <div
              className={cn(
                showIconLabels
                  ? "flex-1 flex gap-2 items-center"
                  : "flex-1 max-sm:w-full"
              )}
            >
              {!showIconLabels && (
                <Label className="pb-1">{t("filters.search")}</Label>
              )}
              <Input
                placeholder={t("filters.inputSearch")}
                name="search"
                className="min-w-[20vw]"
              />
            </div>
          )}
          {setCategories ? (
            <div
              className={cn(
                showIconLabels
                  ? "flex-1 flex gap-2 items-center"
                  : "flex-1 max-sm:w-full"
              )}
            >
              <Label>
                {showIconLabels ? (
                  <Grid2X2Plus className="text-muted-foreground" />
                ) : (
                  t("filters.categories")
                )}
              </Label>
              <MultiSelect
                options={categories}
                onValueChange={setCategories}
                disabled={isCategoriesLoading}
                placeholder={t("filters.selectCategories")}
              />
            </div>
          ) : null}
          <div
            className={cn(
              showIconLabels
                ? "flex-1 flex gap-2 items-center"
                : "flex-1 max-sm:w-full"
            )}
          >
            <Label>
              {showIconLabels ? (
                <Earth className="text-muted-foreground" />
              ) : (
                t("filters.regions")
              )}
            </Label>
            <MultiSelect
              options={regions}
              onValueChange={setRegions}
              disabled={isRegionLoading}
              placeholder={t("filters.selectRegions")}
            />
          </div>
          <div
            className={cn(
              showIconLabels
                ? "flex-1 flex gap-2 items-center"
                : "flex-1 max-sm:w-full"
            )}
          >
            <Label>
              {showIconLabels ? (
                <Globe className="text-muted-foreground" />
              ) : (
                t("filters.countries")
              )}
            </Label>
            <MultiSelect
              options={countries}
              onValueChange={setCountries}
              disabled={isCountryLoading}
              placeholder={t("filters.selectCountries")}
            />
          </div>
          {setDateRange ? (
            <div
              className={cn(
                showIconLabels
                  ? "flex-1 flex gap-2 items-center"
                  : "flex-1 max-sm:w-full"
              )}
            >
              {!showIconLabels && <Label>{t("filters.events")}</Label>}
              <DatePickerWithRange
                buttonClassName="max-sm:w-full"
                onValueChange={setDateRange}
              />
            </div>
          ) : null}
          {showInputSearch && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="submit"
                    className="rounded-full"
                  >
                    <SearchIcon className="text-black" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="center" side="bottom">
                  <p>{t("filters.search")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default Filters;
