import { JSX, useState, useMemo } from "react";
import { MapPin, CheckCircle, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";

import { MultiSelectProps } from "@/components/ui/multi-select";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import fetcher from "@/lib/utils";
import { BuildUserFilterType } from "@/app/api/filter/user/route";
import { Locale } from "@/i18n/config";
import { CountryCastFestivals } from "@/db/queries/countries";
import { SearchFormElement, Action } from "@/types/send-email";
import { Card, CardContent } from "@/components/ui/card";

import SkeletonList from "./skeleton-list";
import Filters from "./filters";
import { ListItem } from "./list-item";

interface FestivalTabOptions {
  regions: MultiSelectProps["options"];
  categories: MultiSelectProps["options"];
  isRegionLoading: boolean;
  locale: Locale;
  selectedUsers: string[];
  dispatch: (action: Action) => void;
}

function FestivalTab(props: FestivalTabOptions): JSX.Element {
  const {
    categories,
    regions,
    isRegionLoading,
    locale,
    dispatch,
    selectedUsers,
  } = props;
  const [search, setSearch] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const t = useTranslations();

  async function handleSubmit(event: React.FormEvent<SearchFormElement>) {
    event.preventDefault();

    const searchValue = event.currentTarget.elements?.search.value;

    setSearch(`search=${searchValue}`);
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
    return countriesData.map((country) => {
      return {
        label: country.name || "",
        value: String(country.id),
      };
    });
  }, [countriesData]);

  const { data: itemList = [], isLoading: isLoadingItemList } =
    useSWR<BuildUserFilterType>(
      () =>
        `/api/filter/user?locale=${locale}&role=council&regions=${JSON.stringify(
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
        itemList?.map(({ countryLang, firstName, lastName, email, id }) => (
          <ListItem
            key={id!}
            handleClick={() =>
              dispatch({
                type: "add",
                payload: { id: email, key: "users" },
              })
            }
            rightContent={
              selectedUsers.includes(email) && (
                <CheckCircle
                  className="text-green-500 mr-4"
                  strokeWidth={2.5}
                />
              )
            }
          >
            <h3 className="text-black text-sm sm:text-base truncate sm:max-w-[170px] md:max-w-[200px] lg:max-w-[300px]">
              {firstName ?? "Pendiente"} {lastName ?? ""}
            </h3>
            <div className="flex gap-4">
              <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
                <Mail size={16} />
                <span>{email}</span>
              </p>
              <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
                <MapPin size={16} />
                <span>{countryLang.name}</span>
              </p>
            </div>
          </ListItem>
        ))
      ),
    [isLoadingItemList, itemList, selectedUsers, dispatch]
  );

  return (
    <TabsContent value="council">
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
