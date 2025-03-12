import { JSX, useState, useMemo, PropsWithChildren, useEffect } from "react";
import { MapPin, CheckCircle } from "lucide-react";
import useSWR from "swr";
import Image from "next/image";
import { findFlagUrlByCountryName } from "country-flags-svg";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { MultiSelectProps } from "@/components/ui/multi-select";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import fetcher, { cn } from "@/lib/utils";
import { BuildNationalSectionFilterType } from "@/app/api/filter/national-section/route";
import { Locale } from "@/i18n/config";
import { CountryCastNationalSections } from "@/db/queries/national-sections";
import { SearchFormElement, Action } from "@/types/send-email";
import { Card, CardContent } from "@/components/ui/card";
import { CategoriesType } from "@/db/queries/categories";

import SkeletonList from "./skeleton-list";
import Filters from "./filters";
import { ListItem } from "./list-item";

interface FestivalTabOptions extends PropsWithChildren {
  regions: MultiSelectProps["options"];
  categories: CategoriesType;
  isRegionLoading: boolean;
  locale: Locale;
  selectedSections: number[];
  dispatch: (action: Action) => void;
  isCard?: boolean;
  setCountries?: (countries: CountryCastNationalSections) => void;
  showTotal?: boolean;
  showInputSearch?: boolean;
  searchText?: string;
  showIconLabels?: boolean;
  contentClassName?: string;
  wrapperClassName?: string;
}

function FestivalTab(props: FestivalTabOptions): JSX.Element {
  const {
    categories,
    regions,
    isRegionLoading,
    locale,
    dispatch,
    selectedSections,
    isCard = false,
    children,
    setCountries,
    showTotal,
    showInputSearch = true,
    searchText,
    showIconLabels = false,
    contentClassName,
    wrapperClassName,
  } = props;
  const [search, setSearch] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const translations = useTranslations("filters");
  const router = useRouter();

  useEffect(() => {
    setSearch(`search=${searchText}`);
  }, [searchText]);

  async function handleSubmit(event: React.FormEvent<SearchFormElement>) {
    event.preventDefault();

    const searchValue = event.currentTarget.elements?.search.value;

    setSearch(`search=${searchValue}`);
  }

  const { data: countriesData = [], isLoading: isCountryLoading } =
    useSWR<CountryCastNationalSections>(
      () =>
        `/api/filter/country/national-section?locale=${locale}&regions=${JSON.stringify(
          selectedRegions
        )}`,
      fetcher
    );

  if (setCountries && countriesData.length > 0) setCountries(countriesData);

  const countries: MultiSelectProps["options"] = useMemo(() => {
    return countriesData.map((country) => {
      return {
        label: country.name || "",
        value: String(country.id),
      };
    });
  }, [countriesData]);

  const { data: itemList = [], isLoading: isLoadingItemList } =
    useSWR<BuildNationalSectionFilterType>(
      () =>
        `/api/filter/national-section?locale=${locale}&regions=${JSON.stringify(
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
        itemList
          ?.slice(0, 10)
          ?.map(({ countryLang, lang, id, cover, country }) => {
            const countryUrl = findFlagUrlByCountryName(country.slug);

            return isCard ? (
              <div
                key={id}
                className={cn(
                  "w-full justify-self-center space-y-3 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-default hover:cursor-pointer"
                )}
                onClick={() => router.push(`/national-sections/${id}`)}
              >
                <div>
                  <div className="relative w-full h-[220px]">
                    <Image
                      fill
                      src={cover?.url || countryUrl || "/placeholder.svg"}
                      alt="Festival Picture"
                      className="rounded-lg aspect-video"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsbmysBwAE+gH+lB3PkwAAAABJRU5ErkJggg=="
                    />
                  </div>
                </div>
                <div className="w-full flex flex-col gap-1">
                  <h3 className="text-black text-sm sm:text-base truncate sm:max-w-[170px] md:max-w-[200px] lg:max-w-[300px]">
                    {lang.name}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
                    <MapPin size={16} />
                    <span>{countryLang.name}</span>
                  </p>
                  <p className="text-gray-700 text-xs sm:text-sm line-clamp-3">
                    {lang?.about}
                  </p>
                </div>
              </div>
            ) : (
              <ListItem
                key={id}
                handleClick={() =>
                  dispatch({
                    type: "add",
                    payload: { id: id, key: "nationalSections" },
                  })
                }
                rightContent={
                  selectedSections.includes(id) && (
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
                {lang?.about ? (
                  <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center !line-clamp-1">
                    {lang?.about}
                  </p>
                ) : null}
                <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
                  <MapPin size={16} />
                  <span>{countryLang.name}</span>
                </p>
              </ListItem>
            );
          })
      ),
    [isLoadingItemList, itemList, isCard, selectedSections, router, dispatch]
  );

  return (
    <TabsContent value="national_section">
      <section className="pb-6 pt-2">
        <div className="container mx-auto">
          <Filters
            categories={categories}
            countries={countries}
            handleSubmit={handleSubmit}
            regions={regions}
            setCountries={setSelectedCountries}
            setRegions={setSelectedRegions}
            isRegionLoading={isRegionLoading}
            isCountryLoading={isCountryLoading}
            showInputSearch={showInputSearch}
            showIconLabels={showIconLabels}
          />
        </div>
      </section>
      <Card className={cn(children && "border-none sm:pt-2")}>
        <CardContent className={cn("pt-4", contentClassName)}>
          <div
            className={cn(
              !wrapperClassName && "container mx-auto bg-gray-50",
              wrapperClassName
            )}
          >
            {children}
            {showTotal && (
              <label className="font-medium px-4">
                {translations("results", {
                  total: Array.isArray(items) ? items.length : 0,
                })}
              </label>
            )}
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div
                className={cn(
                  "flex-1 p-4",
                  !!children ? "rounded-b-lg" : "rounded-lg"
                )}
              >
                <ScrollArea
                  className={cn(
                    isCard ? "h-full w -full" : "h-[400px] w -full p-4"
                  )}
                >
                  <div
                    className={cn(
                      isCard
                        ? "grid grid-cols-5 gap-2 h-full w-full max-sm:grid-cols-1 max-md:grid-cols-2"
                        : "flex flex-col gap-2"
                    )}
                  >
                    {items}
                  </div>
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
