import { JSX, useState, useMemo, useEffect } from "react";
import { MapPin, CheckCircle } from "lucide-react";
import useSWR from "swr";

import { MultiSelectProps } from "@/components/ui/multi-select";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import fetcher from "@/lib/utils";
import { Locale } from "@/i18n/config";
import { SearchFormElement, Action } from "@/types/send-email";
import { CountryCastGroups } from "@/db/queries/groups";
import { BuildGroupFilterType } from "@/app/api/filter/group/route";
import { Card, CardContent } from "@/components/ui/card";
import { CategoriesType } from "@/db/queries/categories";

import SkeletonList from "./skeleton-list";
import Filters from "./filters";
import { ListItem } from "./list-item";

interface GroupTabProps {
  regions: MultiSelectProps["options"];
  categories: CategoriesType;
  isRegionLoading: boolean;
  locale: Locale;
  selectedGroups: number[];
  dispatch: (action: Action) => void;
  showInputSearch?: boolean;
  searchText?: string;
  showIconLabels?: boolean;
}

function GroupTab(props: GroupTabProps): JSX.Element {
  const {
    categories,
    dispatch,
    isRegionLoading,
    locale,
    regions,
    selectedGroups,
    showInputSearch = true,
    searchText,
    showIconLabels = false,
  } = props;
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  useEffect(() => {
    setSearch(`search=${searchText}`);
  }, [searchText]);

  const { data: countriesData = [], isLoading: isCountryLoading } =
    useSWR<CountryCastGroups>(
      () =>
        `/api/filter/country/group?locale=${locale}&regions=${JSON.stringify(
          selectedRegions
        )}`,
      fetcher
    );

  const countries: MultiSelectProps["options"] = useMemo(
    () =>
      countriesData.map((country) => ({
        label: country.name || "",
        value: String(country.id),
      })),
    [countriesData]
  );

  async function handleSubmit(event: React.FormEvent<SearchFormElement>) {
    event.preventDefault();

    const searchValue = event.currentTarget.elements?.search.value;
    setSearch(`search=${searchValue}`);
  }

  const { data: itemList = [], isLoading: isLoadingItemList } =
    useSWR<BuildGroupFilterType>(
      () =>
        `/api/filter/group?categories=${JSON.stringify(
          selectedCategories
        )}&type=groups&locale=${locale}&regions=${JSON.stringify(
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
        itemList?.map(({ group, lang, countryLang, logo }) => (
          <ListItem
            key={group.id}
            image={logo?.url}
            handleClick={() =>
              dispatch({
                type: "add",
                payload: { id: group.id, key: "groups" },
              })
            }
            rightContent={
              selectedGroups.includes(group.id) && (
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
            <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
              <MapPin size={16} />
              <span>{countryLang.name}</span>
            </p>
          </ListItem>
        ))
      ),
    [dispatch, isLoadingItemList, itemList, selectedGroups]
  );

  return (
    <TabsContent value="groups">
      <section className="pb-6 pt-2">
        <div className="container mx-auto">
          <Filters
            categories={categories}
            countries={countries}
            regions={regions}
            handleSubmit={handleSubmit}
            setCategories={setSelectedCategories}
            setCountries={setSelectedCountries}
            setRegions={setSelectedRegions}
            isRegionLoading={isRegionLoading}
            isCountryLoading={isCountryLoading}
            showInputSearch={showInputSearch}
            showIconLabels={showIconLabels}
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

export default GroupTab;
