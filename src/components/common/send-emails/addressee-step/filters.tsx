import { JSX, FormEvent, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { DateRange } from "react-day-picker";
import { MultiSelectProps } from "@/components/ui/multi-select";
import { Grid2X2Plus, Earth, Globe, CalendarIcon } from "lucide-react";

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
import { groupCategories } from "@/lib/utils";
import { CategoriesType } from "@/db/queries/categories";
import { Locale } from "@/i18n/config";

import { TreeSelect } from "../../tree-select/select";
import RelatedCountrySelect from "./related-country-select"

interface FiltersProps {
  regions: MultiSelectProps["options"];
  categories: CategoriesType;
  countries?: MultiSelectProps["options"];
  isRegionLoading: boolean;
  handleSubmit: (event: FormEvent<SearchFormElement>) => Promise<void>;
  setCountries: MultiSelectProps["onValueChange"];
  setRegions: MultiSelectProps["onValueChange"];
  selectedRegions?: string[];
  isCategoriesLoading?: boolean;
  setCategories?: MultiSelectProps["onValueChange"];
  setDateRange?: (value: DateRange | undefined) => void;
  showInputSearch?: boolean;
  showIconLabels?: boolean;
  defaultCategories?: string[];
  defaultRegions?: string[];
  defaultCountries?: string[];
  categoryType: "festivals" | "groups"| "national-sections";
}

function Filters(props: FiltersProps): JSX.Element {
  const {
    categories,
    regions,
    countries,
    handleSubmit,
    selectedRegions=[],
    isRegionLoading,
    setCategories,
    setCountries,
    setRegions,
    setDateRange,
    isCategoriesLoading,
    showInputSearch = true,
    showIconLabels = false,
    defaultCategories,
    defaultRegions,
    defaultCountries,
    categoryType,
  } = props;
  const t = useTranslations();
  const locale = useLocale();

  const categoryOptions = useMemo(() => groupCategories(categories, categoryType, locale as Locale, t), [categories, locale, t, categoryType]);

  return (
    <Card>
      <CardContent className="pt-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-end space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 max-lg:overflow-x-auto scrollbar"
        >
          {showInputSearch && (
            <div
              className={cn(
                showIconLabels
                  ? "flex-1 flex gap-2 items-center max-sm:w-full"
                  : "flex-1 max-sm:w-full"
              )}
            >
              {!showIconLabels && (
                <Label className="pb-1">{t("filters.search")}</Label>
              )}
              <Input
                placeholder={t("filters.inputSearch")}
                name="search"
                className="min-w-[20vw] max-sm:w-full"
              />
            </div>
          )}
          {setCategories ? (
            <div
              className={cn(
                showIconLabels
                  ? "flex-1 flex gap-2 items-center max-sm:w-full"
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
              <TreeSelect
                placeholder={t("filters.selectCategories")}
                variant="default"
                disabled={isCategoriesLoading}
                onValueChange={setCategories!}
                options={categoryOptions}
                allowSelectAll={false}
                defaultValue={defaultCategories}
                showInputSearch={false}
              />
            </div>
          ) : null}
          <div
            className={cn(
              showIconLabels
                ? "flex-1 flex gap-2 items-center max-sm:w-full"
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
              defaultValue={defaultRegions}
              showInputSearch={false}
            />
          </div>
          <div
            className={cn(
              showIconLabels
                ? "flex-1 flex gap-2 items-center max-sm:w-full"
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
            <RelatedCountrySelect
              setCountries={setCountries}
              defaultCountries={defaultCountries}
              categoryType={categoryType}
              selectedRegions={selectedRegions}
            />
          </div>
          {setDateRange ? (
            <div
              className={cn(
                showIconLabels
                  ? "flex-1 flex gap-2 items-center w-full"
                  : "flex-1 max-sm:w-full"
              )}
            >
              {showIconLabels ? (
                <CalendarIcon className="text-muted-foreground" />
              ) : (
                <Label>{t("filters.events")}</Label>
              )}
              <DatePickerWithRange
                buttonClassName="w-full"
                className="w-full"
                onValueChange={setDateRange}
                showIcon={false}
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
