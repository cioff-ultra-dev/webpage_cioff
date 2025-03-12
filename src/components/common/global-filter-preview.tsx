"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import useSWR from "swr";
import { MapPin, CalendarCheck, Users } from "lucide-react";
import {
  APIProvider,
  useMap,
  useMapsLibrary,
  Map,
  Marker,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import Link from "next/link";
import { DateRange } from "react-day-picker";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import fetcher, { cn } from "@/lib/utils";
import { SelectFestival } from "@/db/schema";
import MapHandler from "@/components/common/map-handler";
import { CountryCastFestivals } from "@/db/queries/countries";
import { SWRProvider } from "@/components/provider/swr";
import { BuildFilterType } from "@/app/api/filter/route";
import constants from "@/constants";
import { CategoriesType } from "@/db/queries/categories";
import { BuildGroupFilterType } from "@/app/api/filter/group/route";
import { RegionsType } from "@/db/queries/regions";
import { CountryCastGroups } from "@/db/queries/groups";
import { Locale } from "@/i18n/config";
import { CountryCastNationalSections } from "@/db/queries/national-sections";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MultiSelectProps } from "../ui/multi-select";
import { Skeleton } from "../ui/skeleton";
import NationalSectionsTab from "./send-emails/addressee-step/national-sections-tab";
import Filters from "./send-emails/addressee-step/filters";
import { FilterCard } from "./filters/filter-card";
import { ResultList } from "./filters/result-list";

interface FormElements extends HTMLFormControlsCollection {
  search: HTMLInputElement;
}

interface SearchFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`skeleton-list-search-${index}`}
          className="bg-gray-50 p-4 rounded-lg flex flex-col space-y-4 w-full"
        >
          <Skeleton className="h-64 sm:h-48 bg-gray-300 rounded-lg" />
          <Skeleton className="h-4 w-[250px] bg-gray-300" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px] bg-gray-300" />
            <Skeleton className="h-6 w-[250px] bg-gray-300" />
          </div>
        </div>
      ))}
    </>
  );
}

export function WrapperFilter({ categories }: { categories: CategoriesType }) {
  const locale = useLocale();
  const t = useTranslations("maps");
  const tc = useTranslations("categories");
  const tf = useTranslations("filters");
  const translations = useTranslations("common");

  const [tabSelected, setTabSelected] = useState<string>("festivals");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedFestival, setSelectedFestival] =
    useState<SelectFestival | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<number>(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [nationalSectionsCast, setNationalSectionsCast] =
    useState<CountryCastNationalSections>([]);
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

  const { data: itemList = [], isLoading: isLoadingItemList } =
    useSWR<BuildFilterType>(
      () =>
        tabSelected === "festivals"
          ? `api/filter?categories=${JSON.stringify(
              selectedCategories
            )}&type=${tabSelected}&locale=${locale}&countryId=${selectedCountryId}&regions=${JSON.stringify(
              selectedRegions
            )}&countries=${JSON.stringify(
              selectedCountries.length
                ? selectedCountries
                : countryCast.map((item) => item.id)
            )}&page=1${search ? `&${search}` : ""}`
          : null,
      fetcher
    );

  const { data: itemGroupList = [], isLoading: isLoadingItemGroupList } =
    useSWR<BuildGroupFilterType>(
      () =>
        tabSelected === "groups"
          ? `api/filter/group?categories=${JSON.stringify(
              selectedCategories
            )}&type=${tabSelected}&locale=${locale}&countryId=${selectedCountryId}&regions=${JSON.stringify(
              selectedRegions
            )}&countries=${JSON.stringify(
              selectedCountries.length
                ? selectedCountries
                : countryGroupCast.map((item) => item.id)
            )}&page=1${search ? `&${search}` : ""}`
          : null,
      fetcher
    );

  const nationalSectionMapClusters = useMemo(() => {
    return (
      nationalSectionsCast
        ?.filter((item) => item.lat && item.lng)
        .map((item) => ({
          id: item.id,
          count: item.nationalSectionsCount,
          name: item.name,
          position: {
            lat: parseFloat(item.lat!),
            lng: parseFloat(item.lng!),
          },
        })) || []
    );
  }, [nationalSectionsCast]);

  const countryMapClusters = useMemo(() => {
    return (
      countryCast
        ?.filter((item) => item.lat && item.lng)
        .map((item) => ({
          id: item.id,
          count: item.festivalsCount,
          name: item.name,
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
          count: item.groupsCount,
          name: item.name,
          position: {
            lat: parseFloat(item.lat!),
            lng: parseFloat(item.lng!),
          },
        })) || []
    );
  }, [countryGroupCast]);

  const categoriesMap: MultiSelectProps["options"] = useMemo(() => {
    return categories.map((category) => {
      return {
        label: category.langs.at(0)?.name || category.slug,
        value: String(category.id),
      };
    });
  }, [categories]);

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
    return countryCast.map((country) => {
      return {
        label: country.name || "",
        value: String(country.id),
      };
    });
  }, [countryCast]);

  const countriesGroupMap: MultiSelectProps["options"] = useMemo(() => {
    return countryGroupCast.map((country) => {
      return {
        label: country.name || "",
        value: String(country.id),
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

  useEffect(() => {
    setSelectedPlace(null);
    setSelectedCountryId(0);
  }, [tabSelected]);

  const fetchPredictions = useCallback(
    async (inputValue: string, locationValue: { lat: number; lng: number }) => {
      if (!autocompleteService || !inputValue) {
        setPredictionResults([]);
        return;
      }

      if (!autocompleteService || !inputValue) {
        setPredictionResults([]);
        return;
      }

      const request: google.maps.places.AutocompletionRequest = {
        input: inputValue,
        sessionToken,
        ...(locationValue.lat && locationValue.lng
          ? { locationBias: { lat: locationValue.lat, lng: locationValue.lng } }
          : {}),
      };

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

  async function handleClickSelected(
    festival: BuildFilterType[number]["festival"],
    _country: BuildFilterType[number]["country"],
    lang: BuildFilterType[number]["lang"],
    countryLang: BuildFilterType[number]["countryLang"]
  ) {
    if (festival.id === selectedFestival?.id) {
      if (!places) return;
      setSelectedFestival(null);
      setSelectedPlace(null);
      return;
    }

    if (!lang && !festival?.location) return;

    const possiblePredicctionAddress = `${festival?.location || ""} ${
      countryLang?.name
    }`;

    const locationPredictionAddress = {
      lat: Number(festival.lat ?? 0),
      lng: Number(festival.lng ?? 0),
    };

    const predictions = await fetchPredictions(
      possiblePredicctionAddress,
      locationPredictionAddress
    );

    handleSuggestion(predictions?.at(0)?.place_id || "");

    setSelectedFestival(festival);
  }

  return (
    <>
      <section className="py-4 sm:py-8">
        <Tabs
          defaultValue="festivals"
          value={tabSelected}
          className="w-full"
          onValueChange={(value) => setTabSelected(value)}
        >
          <div className="container mx-auto flex gap-4 max-sm:flex-col max-sm:items-center">
            <TabsList className="max-sm:flex max-sm:w-fit">
              <TabsTrigger value="festivals">{tf("festivals")}</TabsTrigger>
              <TabsTrigger value="groups">{tf("groups")}</TabsTrigger>
              <TabsTrigger value="national_section">
                {tf("countries")}
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 max-sm:w-full">
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
                        size="icon"
                        type="submit"
                        className="rounded-full"
                      >
                        <SearchIcon className="text-black" />
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
          <NationalSectionsTab
            categories={categories}
            regions={regionsMap}
            isRegionLoading={isLoadingRegionCast}
            locale={locale as Locale}
            dispatch={() => {}}
            selectedSections={[]}
            setCountries={setNationalSectionsCast}
            isCard
            showTotal
            showInputSearch={false}
            searchText={new URLSearchParams(search).get("search") ?? ""}
            showIconLabels
            contentClassName="p-0 bg-white py-4 sm:py-6 w-full"
            wrapperClassName="w-full"
          >
            <MapHandler
              place={selectedPlace}
              defaultZoom={3}
              defaultSelectedZoom={5}
            />
            <div className="flex-1 h-full">
              <Map
                mapId={"bf51a910020fa25a"}
                style={{ width: "100%", height: "80vh" }}
                defaultCenter={{
                  lat: map?.getCenter()?.lat() || 0,
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
                  ? nationalSectionMapClusters.map((item) => (
                      <AdvancedMarker
                        key={item.id}
                        position={item.position}
                        onClick={() =>
                          setSelectedCountryId((prevState) => {
                            return prevState === item.id ? 0 : item.id;
                          })
                        }
                        title={t("marker_located_at", {
                          name: item.name,
                        })}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 bg-red-300 flex justify-center items-center rounded-full p-3",
                            item.id === selectedCountryId && "bg-red-400"
                          )}
                        >
                          <span>{item.count}</span>
                        </div>
                      </AdvancedMarker>
                    ))
                  : null}
              </Map>
            </div>
          </NationalSectionsTab>
          <TabsContent value="festivals">
            <div className="container mx-auto pb-6 pt-2">
              <Filters
                categories={categories}
                countries={countriesMap}
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
              />
            </div>
            <section className="bg-white py-4 sm:py-8 w-full">
              <div className="w-full">
                <div className="flex flex-col space-y-4 sm:space-y-0">
                  <MapHandler
                    place={selectedPlace}
                    defaultZoom={3}
                    defaultSelectedZoom={5}
                  />
                  <div className="flex-1 h-full mb-4">
                    <Map
                      mapId={"bf51a910020fa25a"}
                      style={{ width: "100%", height: "80vh" }}
                      defaultCenter={{
                        lat: map?.getCenter()?.lat() || 0,
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
                              title={t("marker_located_at", {
                                name: item.name,
                              })}
                            >
                              <div
                                className={cn(
                                  "w-5 h-5 bg-red-300 flex justify-center items-center rounded-full p-3",
                                  item.id === selectedCountryId && "bg-red-400"
                                )}
                              >
                                <span>{item.count}</span>
                              </div>
                            </AdvancedMarker>
                          ))
                        : null}
                    </Map>
                  </div>
                  <ResultList
                    isLoading={isLoadingItemGroupList}
                    results={itemList?.map(
                      ({
                        festival,
                        country,
                        lang,
                        countryLang,
                        event,
                        cover,
                      }) => ({
                        icon: <CalendarCheck />,
                        images: [cover?.url || "/placeholder.svg"],
                        title: lang.name ?? "",
                        endDate: event?.endDate,
                        startDate: event?.startDate,
                        location: festival?.location || countryLang?.name,
                        detailLink: `/festivals/${festival.id}`,
                        handleClick: () =>
                          handleClickSelected(
                            festival,
                            country,
                            lang,
                            countryLang
                          ),
                      })
                    )}
                    viewMoreLink={`/search?categories=${JSON.stringify(
                      selectedCategories
                    )}&type=${tabSelected}&locale=${locale}&countryId=${selectedCountryId}&page=1&regions=${JSON.stringify(
                      selectedRegions
                    )}&countries=${JSON.stringify(selectedCountries)}${
                      search ? `&${search}` : ""
                    }`}
                  />
                </div>
              </div>
            </section>
          </TabsContent>
          <TabsContent value="groups">
            <div className="container mx-auto pb-6 pt-2">
              <Filters
                categories={categories}
                countries={countriesGroupMap}
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
              />
            </div>
            <section className="bg-white py-4 sm:py-8 w-full">
              <div className="w-full">
                <div className="flex flex-col space-y-4 sm:space-y-0">
                  <MapHandler
                    place={selectedPlace}
                    defaultZoom={3}
                    defaultSelectedZoom={5}
                  />
                  <div className="flex-1 h-full">
                    <Map
                      mapId={"bf51a910020fa25a"}
                      style={{ width: "100%", height: "80vh" }}
                      defaultCenter={{
                        lat: map?.getCenter()?.lat() || 0,
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
                        ? countryGroupMapClusters.map((item) =>
                            item.count ? (
                              <AdvancedMarker
                                key={item.id}
                                position={item.position}
                                onClick={() =>
                                  setSelectedCountryId((prevState) => {
                                    return prevState === item.id ? 0 : item.id;
                                  })
                                }
                                title={t("marker_located_at", {
                                  name: item.name,
                                })}
                              >
                                <div
                                  className={cn(
                                    "w-5 h-5 bg-red-300 flex justify-center items-center rounded-full p-3",
                                    item.id === selectedCountryId &&
                                      "bg-red-400"
                                  )}
                                >
                                  <span>{item.count}</span>
                                </div>
                              </AdvancedMarker>
                            ) : null
                          )
                        : null}
                    </Map>
                  </div>
                  <ResultList
                    isLoading={isLoadingItemGroupList}
                    results={itemGroupList?.map(
                      ({ group, cover, lang, countryLang }) => ({
                        icon: <Users />,
                        images: [cover?.url || "/placeholder.svg"],
                        title: lang.name,
                        location: group?.location || countryLang?.name,
                        hideDate: true,
                        description:
                          lang.description || translations("noDescription"),
                        detailLink: `/groups/${group.id}`,
                      })
                    )}
                    viewMoreLink={`/search?categories=${JSON.stringify(
                      selectedCategories
                    )}&type=${tabSelected}&locale=${locale}&countryId=${selectedCountryId}&page=1&regions=${JSON.stringify(
                      selectedRegions
                    )}&countries=${JSON.stringify(selectedCountries)}${
                      search ? `&${search}` : ""
                    }`}
                  />
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}

function BaseWrapperFilter({ categories }: { categories: CategoriesType }) {
  return (
    <APIProvider apiKey={constants.google.apiKey!} libraries={["marker"]}>
      <WrapperFilter categories={categories} />
    </APIProvider>
  );
}

export default function GlobalFilterPreview({
  fallbackFestivals,
  fallbackCountryCast,
  categories,
}: {
  fallbackFestivals: { festivals: SelectFestival }[];
  fallbackCountryCast: CountryCastFestivals;
  categories: CategoriesType;
}) {
  return (
    <SWRProvider
      fallbackCountryCast={fallbackCountryCast}
      fallbackFestivals={fallbackFestivals}
    >
      <BaseWrapperFilter categories={categories} />
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
