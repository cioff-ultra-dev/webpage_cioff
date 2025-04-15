"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import useSWR from "swr";
import { CalendarIcon, Globe, Users } from "lucide-react";
import {
  APIProvider,
  useMap,
  useMapsLibrary,
  Map,
  Marker,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { DateRange } from "react-day-picker";

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
import { ResultList } from "./filters/result-list";
import { isThisYear, compareAsc } from "date-fns";

interface FormElements extends HTMLFormControlsCollection {
  search: HTMLInputElement;
}

interface SearchFormElement extends HTMLFormElement {
  readonly elements: FormElements;
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
            )}&type=${tabSelected}&locale=${locale}&festivalId=${selectedCountryId}&regions=${JSON.stringify(
              selectedRegions
            )}&countries=${JSON.stringify(
              selectedCountries.length
                ? selectedCountries
                : selectedCountryId || search.length > 0
                ? []
                : countryCast.map((item) => item.countryId)
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
            )}&type=${tabSelected}&locale=${locale}&groupId=${selectedCountryId}&regions=${JSON.stringify(
              selectedRegions
            )}&countries=${JSON.stringify(
              selectedCountries.length
                ? selectedCountries
                : selectedCountryId || search.length > 0
                ? []
                : countryGroupCast.map((item) => item.countryId)
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
    return countryCast
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.countryId === value.countryId)
      )
      .map((country) => {
        return {
          label: country.country || "",
          value: String(country.countryId),
        };
      });
  }, [countryCast]);

  const countriesGroupMap: MultiSelectProps["options"] = useMemo(() => {
    return countryGroupCast
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.countryId === value.countryId)
      )
      .map((country) => {
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
          <div className="container mx-auto flex gap-4 flex-col items-center">
            <TabsList className="flex w-fit justify-center">
              <TabsTrigger value="festivals" className="flex gap-4">
                <CalendarIcon />
                {tf("festivals")}
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex gap-4">
                <Users />
                {tf("groups")}
              </TabsTrigger>
              <TabsTrigger value="national_section" className="flex gap-4">
                <Globe />
                {tf("countries")}
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 w-2/3 max-md:w-full lg:w-1/3">
              <form
                onSubmit={handleSubmit}
                className="flex items-end space-y-4 space-x-4 sm:space-y-0 px-4"
              >
                <Input placeholder={tf("search")} name="search" type="search" />
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
            contentClassName="p-0 bg-white py-4 sm:py-6 w-full h-full"
            wrapperClassName="w-full h-full"
            viewMoreLink="/national-sections"
          >
            <MapHandler
              place={selectedPlace}
              defaultZoom={3}
              defaultSelectedZoom={5}
            />
            <div className="flex-1 h-full">
              <Map
                mapId={"bf51a910020fa25a"}
                style={{ width: "100%", height: "70vh" }}
                defaultCenter={{
                  lat: 40,
                  lng: map?.getCenter()?.lng() || 0,
                }}
                defaultZoom={2}
                gestureHandling="greedy"
                disableDefaultUI={true}
                minZoom={2}
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
                      />
                    ))
                  : null}
              </Map>
            </div>
          </NationalSectionsTab>
          <TabsContent value="festivals">
            <div className="container mx-auto pb-6 pt-2 px-2">
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
                categoryType="festivals"
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
                      style={{ width: "100%", height: "70vh" }}
                      defaultCenter={{
                        lat: 40,
                        lng: map?.getCenter()?.lng() || 0,
                      }}
                      defaultZoom={2}
                      gestureHandling="greedy"
                      disableDefaultUI={true}
                      minZoom={2}
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
                  <ResultList
                    isLoading={isLoadingItemList}
                    results={itemList?.map(
                      ({
                        festival,
                        country,
                        lang,
                        countryLang,
                        event,
                        cover,
                        coverPhotos,
                        events = [],
                      }) => {
                        const recentEvent =
                          events
                            ?.filter(
                              (event) =>
                                event.startDate && isThisYear(event.startDate)
                            )
                            .sort((a, b) =>
                              compareAsc(a.startDate, b.startDate)
                            )
                            .at(0);

                        return {
                          icon: <CalendarIcon />,
                          images: coverPhotos.length
                            ? coverPhotos.map((photo) => photo.url!)
                            : [cover?.url || "/placeholder.svg"],
                          title: lang.name ?? "",
                          endDate: recentEvent?.endDate ?? event?.endDate,
                          startDate: recentEvent?.startDate ?? event?.startDate,
                          location: festival?.location || countryLang?.name,
                          detailLink: `/festivals/${festival.id}`,
                          handleClick: () =>
                            handleClickSelected(
                              festival,
                              country,
                              lang,
                              countryLang
                            ),
                        };
                      }
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
            <div className="container mx-auto pb-6 pt-2 px-2">
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
                categoryType="groups"
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
                      style={{ width: "100%", height: "70vh" }}
                      defaultCenter={{
                        lat: 40,
                        lng: map?.getCenter()?.lng() || 0,
                      }}
                      defaultZoom={2}
                      gestureHandling="greedy"
                      disableDefaultUI={true}
                      minZoom={2}
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
                  <ResultList
                    isLoading={isLoadingItemGroupList}
                    results={itemGroupList?.map(
                      ({ group, cover, lang, countryLang, coverPhotos }) => ({
                        icon: <Users />,
                        images: coverPhotos.length
                          ? coverPhotos.map((photo) => photo.url!)
                          : [cover?.url || "/placeholder.svg"],
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
                    )}&type=${tabSelected}&locale=${locale}&groupId=${selectedCountryId}&page=1&regions=${JSON.stringify(
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
