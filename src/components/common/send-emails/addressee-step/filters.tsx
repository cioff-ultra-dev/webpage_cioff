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
import { TreeNode } from "@/types/tree-select";
import { CategoriesType } from "@/db/queries/categories";

import { TreeSelect } from "../../tree-select/select";

const FESTIVAL_CATEGORY_MAP = {
  music: "typeOfFestival",
  dance: "typeOfFestival",
  "dance-music": "typeOfFestival",
  "youth-adults": "ageParticipants",
  seniors: "ageParticipants",
  "teenagers-children": "ageParticipants",
  mixed: "ageParticipants",
  authentic: "styleOfFestival",
  elaborado: "styleOfFestival",
  stylized: "styleOfFestival",
  cioff: "status",
  international: "status",
  "host-families": "typeOfAccomodation",
  "hotel-hostel-campus": "typeOfAccomodation",
  "schools-gym-halls": "typeOfAccomodation",
};

const GROUP_CATEGORY_MAP = {
  music: "groupType",
  dance: "groupType",
  "dance-music": "groupType",
  "youth-adults": "groupAge",
  seniors: "groupAge",
  "teenagers-children": "groupAge",
  authentic: "styleGroup",
  elaborado: "styleGroup",
  stylized: "styleGroup",
};

interface FiltersProps {
  regions: MultiSelectProps["options"];
  categories: CategoriesType;
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
  defaultCategories?: string[];
  defaultRegions?: string[];
  defaultCountries?: string[];
  categoryType: "festivals" | "groups";
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
    defaultCategories,
    defaultRegions,
    defaultCountries,
    categoryType,
  } = props;
  const t = useTranslations();
  const locale = useLocale();

  const categoryOptions = useMemo(() => {
    const groupedItems = Object.groupBy(categories, (item) =>
      categoryType === "groups"
        ? GROUP_CATEGORY_MAP[item.slug as keyof typeof GROUP_CATEGORY_MAP]
        : FESTIVAL_CATEGORY_MAP[item.slug as keyof typeof FESTIVAL_CATEGORY_MAP]
    );

    delete groupedItems.undefined;

    categoryType === "festivals" &&
      groupedItems["styleOfFestival"]?.push(
        categories.find((cat) => cat.slug === "mixed")!
      );

    return Object.keys(groupedItems).map((key) => {
      const categories = groupedItems[key];

      return {
        label: t(`form.festival.tag.${key}`),
        value: key,
        children: categories?.length
          ? categories.map((cat) => ({
              label:
                cat.langs.find((lang) => lang.l?.code === locale)?.name ??
                cat.slug,
              value: cat.id.toString(),
            }))
          : undefined,
      };
    }) as TreeNode[];
  }, [categories, locale, t, categoryType]);

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
            <MultiSelect
              options={countries}
              onValueChange={setCountries}
              disabled={isCountryLoading}
              placeholder={t("filters.selectCountries")}
              defaultValue={defaultCountries}
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
