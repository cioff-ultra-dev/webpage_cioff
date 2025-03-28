"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TabsContent } from "@radix-ui/react-tabs";
import useSWR, { preload } from "swr";
import useSWRInfinite from "swr/infinite";
import {  CalendarIcon, Users } from "lucide-react";
import {
  APIProvider,
  useMap,
  useMapsLibrary,
  Map,
  Marker,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { DateRange } from "react-day-picker";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import InfiniteScroll from "@/components/extension/swr-infinite-scroll";
import fetcher, { cn } from "@/lib/utils";
import { SelectFestival } from "@/db/schema";
import MapHandler from "@/components/common/map-handler";
import { Badge } from "@/components/ui/badge";
import { CountryCastFestivals } from "@/db/queries/countries";
import { SWRProvider } from "@/components/provider/swr";
import { BuildFilterType } from "@/app/api/filter/route";
import constants from "@/constants";
import { RegionsType } from "@/db/queries/regions";
import { CountryCastGroups } from "@/db/queries/groups";
import { CategoriesType } from "@/db/queries/categories";
import { BuildGroupFilterType } from "@/app/api/filter/group/route";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";
import { Skeleton } from "../ui/skeleton";
import { MultiSelectProps } from "../ui/multi-select";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import Filters from "./send-emails/addressee-step/filters";
import { FilterCard } from "./filters/filter-card";
import { SkeletonList } from "./filters/result-list";

interface FormElements extends HTMLFormControlsCollection {
  search: HTMLInputElement;
}

interface SearchFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

preload("/api/filter?categories=[]&countryId=0&page=1", fetcher);
preload("/api/filter/country", fetcher);

export function WrapperFilter({
  searchParams,
  categories,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  categories: CategoriesType;
}) {
  const locale = useLocale();
  const t = useTranslations("maps");
  const tc = useTranslations("categories");
  const tf = useTranslations("filters");
  const tCommon = useTranslations("common");
  const formatter = useFormatter();

  const [tabSelected, setTabSelected] = useState<string>(
    (searchParams.type as string) || "festivals"
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(() =>
    searchParams?.regions ? JSON.parse(searchParams?.regions as string) : []
  );
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() =>
    searchParams?.countries ? JSON.parse(searchParams?.countries as string) : []
  );
  const [search, setSearch] = useState(
    `search=${searchParams?.search ?? ""}&rangeDateFrom=${
      searchParams?.rangeDateFrom ?? ""
    }&rangeDateTo=${searchParams?.rangeDateTo ?? ""}`
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    searchParams?.categories
      ? JSON.parse(searchParams?.categories as string)
      : []
  );
  const [selectedFestival, setSelectedFestival] =
    useState<SelectFestival | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<number>(
    Number(searchParams?.countryId ?? 0)
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const map = useMap();
  const places = useMapsLibrary("places");

  const { data: regionCast = [], isLoading: isLoadingRegionCast } =
    useSWR<RegionsType>(`/api/filter/region?locale=${locale}`, fetcher);

  const { data: countryCast = [], isLoading: isLoadingCountryCast } =
    useSWR<CountryCastFestivals>(
      () =>
        tabSelected === "festivals"
          ? `/api/filter/country?locale=${locale}&regions=${JSON.stringify(
              selectedRegions
            )}`
          : null,
      fetcher
    );

  const { data: countryGroupCast = [], isLoading: isLoadingCountryGroupCast } =
    useSWR<CountryCastGroups>(
      () =>
        tabSelected === "groups"
          ? `/api/filter/country/group?locale=${locale}&regions=${JSON.stringify(
              selectedRegions
            )}`
          : null,
      fetcher
    );

  const swr = useSWRInfinite<BuildFilterType>(
    (index, _) =>
      `api/filter?categories=${JSON.stringify(
        selectedCategories
      )}&type=${tabSelected}&locale=${locale}&festivalId=${selectedCountryId}&regions=${JSON.stringify(
        selectedRegions
      )}&countries=${JSON.stringify(
        selectedCountries.length
          ? selectedCountries
          : selectedCountryId || search.length > 0
          ? []
          : countryCast.map((item) => item.id)
      )}&page=${index + 1}${search ? `&${search}` : ""}`,
    fetcher
  );

  const swrGroup = useSWRInfinite<BuildGroupFilterType>(
    (index, _) =>
      `api/filter/group?categories=${JSON.stringify(
        selectedCategories
      )}&type=${tabSelected}&locale=${locale}&groupId=${selectedCountryId}&regions=${JSON.stringify(
        selectedRegions
      )}&countries=${JSON.stringify(
        selectedCountries.length
          ? selectedCountries
          : selectedCountryId || search.length > 0
          ? []
          : countryGroupCast.map((item) => item.id)
      )}&page=${index + 1}${search ? `&${search}` : ""}`,
    fetcher
  );

  const countryMapClusters = useMemo(() => {
    return (
      countryCast
        ?.filter((item) => item.lat && item.lng)
        .map((item) => ({
          id: item.id,
          name: item.name,
          location: item.location,
          position: {
            lat: parseFloat(item.lat!),
            lng: parseFloat(item.lng!),
          },
        })) || []
    );
  }, [countryCast]);

  const countryGroupMapClusters = useMemo(() => {
    return (
      countryGroupCast
        ?.filter((item) => item.lat && item.lng)
        .map((item) => ({
          id: item.id,
          name: item.name,
          location: item.location,
          position: {
            lat: parseFloat(item.lat!),
            lng: parseFloat(item.lng!),
          },
        })) || []
    );
  }, [countryGroupCast]);

  const regionsMap: MultiSelectProps["options"] = useMemo(() => {
    return regionCast.map((region) => {
      return {
        label:
          region.langs.find((item) => item.l?.code === locale)?.name ||
          region.langs.at(0)?.name ||
          region.slug,
        value: String(region.id),
      };
    });
  }, [regionCast, locale]);

  const countriesMap: MultiSelectProps["options"] = useMemo(() => {
    return countryCast.filter((value, index, self) =>
      index === self.findIndex((t) => t.countryId === value.countryId)
    ).map((country) => {
      return {
        label: country.country || "",
        value: String(country.countryId),
      };
    });
  }, [countryCast]);

  const countriesGroupMap: MultiSelectProps["options"] = useMemo(() => {
    return countryGroupCast.filter((value, index, self) =>
      index === self.findIndex((t) => t.countryId === value.countryId)
    ).map((country) => {
      return {
        label: country.country || "",
        value: String(country.countryId),
      };
    });
  }, [countryGroupCast]);

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSessionToken
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken>();

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);

  // https://developers.google.com/maps/documentation/javascript/reference/places-service
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  const [_, setPredictionResults] = useState<
    Array<google.maps.places.AutocompletePrediction>
  >([]);

  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  useEffect(() => {
    if (!places || !map) return;

    setAutocompleteService(new places.AutocompleteService());
    setPlacesService(new places.PlacesService(map));
    setSessionToken(new places.AutocompleteSessionToken());

    return () => setAutocompleteService(null);
  }, [map, places]);

  const fetchPredictions = useCallback(
    async (inputValue: string) => {
      if (!autocompleteService || !inputValue) {
        setPredictionResults([]);
        return;
      }

      if (!autocompleteService || !inputValue) {
        setPredictionResults([]);
        return;
      }

      const request = { input: inputValue, sessionToken };
      const response = await autocompleteService.getPlacePredictions(request);

      setPredictionResults(response.predictions);
      return response.predictions;
    },
    [autocompleteService, sessionToken]
  );

  const handleSuggestion = useCallback(
    (placeId: string) => {
      if (!places) return;

      const detailRequestOptions = {
        placeId,
        fields: ["geometry", "name", "formatted_address"],
        sessionToken,
      };

      const detailsRequestCallback = (
        placeDetails: google.maps.places.PlaceResult | null
      ) => {
        setPredictionResults([]);
        setSelectedPlace(placeDetails);
        setSessionToken(new places.AutocompleteSessionToken());
      };

      placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
    },
    [places, placesService, sessionToken]
  );

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

  // async function handleClickSelected(
  //   festival: SelectFestival,
  //   country: SelectCountries
  // ) {
  //   if (festival.id === selectedFestival?.id) {
  //     if (!places) return;
  //     setSelectedFestival(null);
  //     setSelectedPlace(null);
  //     return;
  //   }

  //   if (!festival?.address && !festival?.location) return;

  //   const possiblePredicctionAddress = `${
  //     festival?.address || festival?.location || ""
  //   } ${country.name}`;

  //   const predictions = await fetchPredictions(possiblePredicctionAddress);

  //   handleSuggestion(predictions?.at(0)?.place_id || "");

  //   setSelectedFestival(festival);
  // }

  return (
    <>
      <Tabs
        defaultValue="festivals"
        value={tabSelected}
        className="w-full pt-6"
        onValueChange={(value) => setTabSelected(value)}
      >
        <div className="container mx-auto flex gap-4 flex-col items-center">
          <TabsList>
            <TabsTrigger value="festivals">Festivals</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          <div className="flex-1 w-2/3 max-md:w-full lg:w-1/3">
            <form
              onSubmit={handleSubmit}
              className="flex items-end space-y-4 space-x-4 sm:space-y-0 px-4"
            >
              <Input placeholder={tf("inputSearch")} name="search" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      type="submit"
                      className="rounded-full bg-black h-10 w-10 hover:bg-black/80 px-3"
                    >
                      <SearchIcon className="text-white scale-150" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="center" side="bottom">
                    <p>{tf("search")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>
          </div>
        </div>
        <section className="py-4 sm:py-8">
          <div className="container mx-auto px-2">
            <Filters
              categories={categories}
              countries={
                tabSelected === "festivals" ? countriesMap : countriesGroupMap
              }
              handleSubmit={handleSubmit}
              regions={regionsMap}
              setCountries={setSelectedCountries}
              setRegions={setSelectedRegions}
              setCategories={setSelectedCategories}
              isRegionLoading={isLoadingRegionCast}
              isCountryLoading={isLoadingCountryCast}
              setDateRange={
                tabSelected === "festivals" ? setDateRange : undefined
              }
              showInputSearch={false}
              showIconLabels
              defaultCategories={selectedCategories}
              defaultRegions={selectedRegions}
              defaultCountries={selectedCountries}
              categoryType={tabSelected as "festivals" | "groups"}
            />
          </div>
        </section>
        <TabsContent value="festivals">
          <section className="bg-white py-4 sm:py-8">
            <div className="w-full">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0">
                <MapHandler
                  place={selectedPlace}
                  defaultZoom={3}
                  defaultSelectedZoom={5}
                />
                <div className="flex-1 rounded-lg">
                  <Map
                    mapId={"bf51a910020fa25a"}
                    style={{ width: "100%", height: "60vh" }}
                    defaultCenter={{
                      lat: 40,
                      lng: map?.getCenter()?.lng() || 0,
                    }}
                    defaultZoom={2}
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                    minZoom={3}
                    zoomControl
                    scrollwheel={false}
                  >
                    {selectedPlace ? (
                      <Marker position={selectedPlace.geometry?.location} />
                    ) : null}
                    {!selectedPlace
                      ? countryMapClusters.map((item) => (
                          <AdvancedMarker
                            key={item.id}
                            position={item.position}
                            onClick={() =>
                              setSelectedCountryId((prevState) => {
                                return prevState === item.id ? 0 : item.id;
                              })
                            }
                            title={item.name
                              ?.concat(" (", item?.location ?? "Pendiente")
                              .concat(")")}
                          />
                        ))
                      : null}
                  </Map>
                </div>
              </div>
            </div>
          </section>
          <section className="bg-white py-4 sm:py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-bold text-black sm:text-2xl mb-5">
                Festival Results
              </h2>
              <div className="grid grid-cols-5 gap-4 h-full w-full max-sm:grid-cols-1 max-md:grid-cols-2 max-lg:grid-cols-4 mt-4">
                <InfiniteScroll
                  swr={swr}
                  loadingIndicator={<SkeletonList />}
                  endingIndicator={
                    <div className="w-full flex justify-center mt-5">
                      <Badge variant="secondary" className="text-gray-400">
                        Not more festivals to show! 🎉
                      </Badge>
                    </div>
                  }
                  isReachingEnd={(swr) => {
                    const lastPosition = swr.data?.at(-1);
                    return (
                      swr.data?.at(0)?.length === 0 ||
                      (typeof lastPosition !== "undefined" &&
                        lastPosition.length < 10)
                    );
                  }}
                  classNameWrapper="w-full h-full flex justify-center items-center col-span-5 max-sm:col-span-1 max-md:col-span-2 max-lg:col-span-4 mt-6"
                  offset={-600}
                >
                  {(response) =>
                    response.map(
                      ({
                        festival,
                        country,
                        lang,
                        cover,
                        countryLang,
                        event,
                      }) => (
                        <FilterCard
                          key={festival.id}
                          icon={<CalendarIcon />}
                          images={[cover?.url || "/placeholder.svg"]}
                          title={lang.name ?? ""}
                          endDate={event?.endDate}
                          startDate={event?.startDate}
                          location={festival?.location || countryLang?.name}
                          detailLink={`/festivals/${festival.id}`}
                        />
                      )
                    )
                  }
                </InfiniteScroll>
              </div>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="groups">
          <section className="bg-white py-4 sm:py-8">
            <div className="w-full">
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0">
                <MapHandler
                  place={selectedPlace}
                  defaultZoom={3}
                  defaultSelectedZoom={5}
                />
                <div className="flex-1 rounded-lg">
                  <Map
                    mapId={"bf51a910020fa25a"}
                    style={{ width: "100%", height: "60vh" }}
                    defaultCenter={{
                      lat: 40,
                      lng: map?.getCenter()?.lng() || 0,
                    }}
                    defaultZoom={2}
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                    minZoom={3}
                    zoomControl
                    scrollwheel={false}
                  >
                    {selectedPlace ? (
                      <Marker position={selectedPlace.geometry?.location} />
                    ) : null}
                    {!selectedPlace
                      ? countryGroupMapClusters.map((item) => (
                          <AdvancedMarker
                            key={item.id}
                            position={item.position}
                            onClick={() =>
                              setSelectedCountryId((prevState) => {
                                return prevState === item.id ? 0 : item.id;
                              })
                            }
                            title={item.name
                              ?.concat(" (", item?.location ?? "Pendiente")
                              .concat(")")}
                          />
                        ))
                      : null}
                  </Map>
                </div>
              </div>
            </div>
          </section>
          <section className="bg-white py-4 sm:py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-bold text-black sm:text-2xl mb-5">
                Group Results
              </h2>
              <div className="grid grid-cols-5 gap-4 h-full w-full max-sm:grid-cols-1 max-md:grid-cols-2 max-lg:grid-cols-4 mt-4">
                <InfiniteScroll
                  swr={swrGroup}
                  loadingIndicator={<SkeletonList />}
                  endingIndicator={
                    <div className="w-full flex justify-center mt-5">
                      <Badge variant="secondary" className="text-gray-400">
                        Not more groups to show! 🎉
                      </Badge>
                    </div>
                  }
                  isReachingEnd={(swr) => {
                    const lastPosition = swr.data?.at(-1);
                    return (
                      swrGroup.data?.at(0)?.length === 0 ||
                      (typeof lastPosition !== "undefined" &&
                        lastPosition.length < 10)
                    );
                  }}
                  classNameWrapper="w-full h-full flex justify-center items-center col-span-5 max-sm:col-span-1 max-md:col-span-2 max-lg:col-span-4 mt-6"
                  offset={-600}
                >
                  {(response) =>
                    response.map(
                      ({ group, lang, countryLang, cover, country }) => (
                        <FilterCard
                          key={group.id}
                          icon={<Users />}
                          images={[cover?.url || "/placeholder.svg"]}
                          title={lang.name}
                          location={group?.location || countryLang?.name}
                          hideDate={true}
                          description={
                            lang.description || tCommon("noDescription")
                          }
                          detailLink={`/groups/${group.id}`}
                        />
                      )
                    )
                  }
                </InfiniteScroll>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </>
  );
}

function BaseWrapperFilter({
  searchParams,
  categories,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  categories: CategoriesType;
}) {
  return (
    <APIProvider apiKey={constants.google.apiKey!} libraries={["marker"]}>
      <WrapperFilter searchParams={searchParams} categories={categories} />
    </APIProvider>
  );
}

export default function GlobalFilter({
  fallbackFestivals,
  fallbackCountryCast,
  searchParams,
  categories,
}: {
  fallbackFestivals: { festivals: SelectFestival }[];
  fallbackCountryCast: CountryCastFestivals;
  searchParams: { [key: string]: string | string[] | undefined };
  categories: CategoriesType;
}) {
  return (
    <SWRProvider
      fallbackCountryCast={fallbackCountryCast}
      fallbackFestivals={fallbackFestivals}
    >
      <BaseWrapperFilter searchParams={searchParams} categories={categories} />
    </SWRProvider>
  );
}

type SVGComponentProps = React.ComponentPropsWithoutRef<"svg">;

function BabyIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
      <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
    </svg>
  );
}

function CogIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M12 2v2" />
      <path d="M12 22v-2" />
      <path d="m17 20.66-1-1.73" />
      <path d="M11 10.27 7 3.34" />
      <path d="m20.66 17-1.73-1" />
      <path d="m3.34 7 1.73 1" />
      <path d="M14 12h8" />
      <path d="M2 12h2" />
      <path d="m20.66 7-1.73 1" />
      <path d="m3.34 17 1.73-1" />
      <path d="m17 3.34-1 1.73" />
      <path d="m11 13.73-4 6.93" />
    </svg>
  );
}

function CookingPotIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12h20" />
      <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
      <path d="m4 8 16-4" />
      <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
    </svg>
  );
}

function DrumIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 2 8 8" />
      <path d="m22 2-8 8" />
      <ellipse cx="12" cy="9" rx="10" ry="5" />
      <path d="M7 13.4v7.9" />
      <path d="M12 14v8" />
      <path d="M17 13.4v7.9" />
      <path d="M2 9v8a10 5 0 0 0 20 0V9" />
    </svg>
  );
}

function FishIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33" />
      <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4" />
      <path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98" />
    </svg>
  );
}

function GlobeIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function SearchIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SirenIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 18v-6a5 5 0 1 1 10 0v6" />
      <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
      <path d="M21 12h1" />
      <path d="M18.5 4.5 18 5" />
      <path d="M2 12h1" />
      <path d="M12 2v1" />
      <path d="m4.929 4.929.707.707" />
      <path d="M12 12v6" />
    </svg>
  );
}

function TruckIcon(props: SVGComponentProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}
