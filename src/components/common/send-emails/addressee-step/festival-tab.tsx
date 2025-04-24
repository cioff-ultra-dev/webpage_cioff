import { JSX, useState, useMemo, useEffect } from "react";
import { MapPin, CalendarCheck, CheckCircle } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { DateRange } from "react-day-picker";
import useSWR from "swr";

import { MultiSelectProps } from "@/components/ui/multi-select";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import fetcher from "@/lib/utils";
import { BuildFilterType } from "@/app/api/filter/route";
import { Locale } from "@/i18n/config";
import { CountryCastFestivals } from "@/db/queries/countries";
import { SearchFormElement, Action } from "@/types/send-email";
import { Card, CardContent } from "@/components/ui/card";
import { CategoriesType } from "@/db/queries/categories";

import SkeletonList from "./skeleton-list";
import Filters from "./filters";
import { ListItem } from "./list-item";

interface FestivalTabOptions {
  regions: MultiSelectProps["options"];
  categories: CategoriesType;
  isRegionLoading: boolean;
  locale: Locale;
  selectedFestivals: number[];
  dispatch: (action: Action) => void;
  searchText?: string;
  showInputSearch?: boolean;
}

function FestivalTab(props: FestivalTabOptions): JSX.Element {
  const {
    categories,
    regions,
    isRegionLoading,
    locale,
    dispatch,
    selectedFestivals,
    searchText = "",
    showInputSearch = true,
  } = props;
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const formatter = useFormatter();

  useEffect(() => {
    setSearch(
      `search=${searchText}&rangeDateFrom=${
        dateRange?.from ? Math.floor(dateRange!.from!.getTime() / 1000) : ""
      }&rangeDateTo=${
        dateRange?.to ? Math.floor(dateRange!.to!.getTime() / 1000) : ""
      }`
    );
  }, [dateRange, searchText]);

  async function handleSubmit(event: React.FormEvent<SearchFormElement>) {
    event.preventDefault();

    const searchValue = event.currentTarget.elements?.search.value;
    setSearch(
      `search=${searchValue}&rangeDateFrom=${
        dateRange?.from ? Math.floor(dateRange!.from!.getTime() / 1000) : ""
      }&rangeDateTo=${
        dateRange?.to ? Math.floor(dateRange!.to!.getTime() / 1000) : ""
      }`
    );
  }

  const { data: countriesData = [], isLoading: isCountryLoading } =
    useSWR<CountryCastFestivals>(
      () =>
        `/api/filter/country?locale=${locale}&regions=${JSON.stringify(
          selectedRegions
        )}`,
      fetcher
    );

  const countries: MultiSelectProps["options"] = useMemo(() => {
    return countriesData.filter((value, index, self) =>
      index === self.findIndex((t) => t.countryId === value.countryId)
    ).map((country) => {
      return {
        label: country.country || "",
        value: String(country.countryId),
      };
    });
  }, [countriesData]);

  const { data: itemList = [], isLoading: isLoadingItemList } =
    useSWR<BuildFilterType>(
      () =>
        `/api/filter?categories=${JSON.stringify(
          selectedCategories
        )}&type=festivals&locale=${locale}&regions=${JSON.stringify(
          selectedRegions
        )}&countries=${JSON.stringify(
          selectedCountries.length
            ? selectedCountries
            : countriesData.map((item) => item.id)
        )}&page=1${search ? `&${search}` : ""}`,
      fetcher
    );

  const items = useMemo(
    () =>
      isLoadingItemList ? (
        <SkeletonList />
      ) : (
        itemList?.map(
          ({ festival, lang, countryLang, event, logo, country }) => (
            <ListItem
              key={festival.id}
              image={logo?.url}
              handleClick={() =>
                dispatch({
                  type: "add",
                  payload: { id: festival.id, key: "festivals" },
                })
              }
              rightContent={
                selectedFestivals.includes(festival.id) && (
                  <CheckCircle
                    className="text-green-500 mr-4"
                    strokeWidth={2.5}
                  />
                )
              }
            >
              <h3 className="text-black text-sm sm:text-base truncate sm:max-w-[170px] md:max-w-[200px] lg:max-w-[300px]">
                {lang.name}
              </h3>
              {event?.startDate ? (
                <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
                  <CalendarCheck size={16} />
                  <span>
                    {event?.startDate
                      ? formatter.dateTime(new Date(event.startDate), {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : null}
                    {" - "}
                    {event?.endDate && event?.startDate !== event?.endDate
                      ? formatter.dateTime(new Date(event.endDate), {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : null}
                  </span>
                </p>
              ) : null}
              <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
                <MapPin size={16} />
                <span>
                  {festival?.location || countryLang?.name || country?.id}
                </span>
              </p>
            </ListItem>
          )
        )
      ),
    [formatter, isLoadingItemList, itemList, selectedFestivals, dispatch]
  );

  return (
    <TabsContent value="festivals">
      <section className="pb-6 pt-2">
        <div className="container mx-auto">
          <Filters
            categories={categories}
            countries={countries}
            handleSubmit={handleSubmit}
            regions={regions}
            setCategories={setSelectedCategories}
            setCountries={setSelectedCountries}
            setRegions={setSelectedRegions}
            setDateRange={setDateRange}
            isRegionLoading={isRegionLoading}
            selectedRegions={selectedRegions}
            showInputSearch={showInputSearch}
            showIconLabels
            categoryType="festivals"
          />
        </div>
      </section>
      <Card>
        <CardContent className="pt-4">
          <div className="container mx-auto">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                <ScrollArea className="h-[400px] w -full p-4">
                  <div className="flex flex-col gap-2">{items}</div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default FestivalTab;
