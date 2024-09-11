"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import useSWR, { preload } from "swr";
import fetcher, { cn } from "@/lib/utils";
import { SelectFestival } from "@/db/schema";
import { MapPin, CalendarCheck, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  APIProvider,
  useMap,
  useMapsLibrary,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";
import MapHandler from "./map-handler";
import { DatePickerWithRange } from "../ui/datepicker-with-range";
import { DateRange } from "react-day-picker";
import Link from "next/link";

interface FormElements extends HTMLFormControlsCollection {
  search: HTMLInputElement;
}
interface SearchFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

function SkeletonList() {
  return (
    <>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center space-x-4 p-2 rounded-lg">
        <div className="animate-pulse">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg" />
        </div>
        <div className="animate-pulse w-full">
          <div className="h-12 w-full sm:w-full sm:h-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </>
  );
}

export function WrapperFilter() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFestival, setSelectedFestival] =
    useState<SelectFestival | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const map = useMap();
  const places = useMapsLibrary("places");
  const { data, isLoading } = useSWR<{ festivals: SelectFestival }[]>(
    `api/filters?categories=${JSON.stringify(selectedCategories)}&${search}`,
    fetcher
  );

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSessionToken
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken>();

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);

  // https://developers.google.com/maps/documentation/javascript/reference/places-service
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  const [predictionResults, setPredictionResults] = useState<
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
      `search=${searchValue}&rangeDateFrom=${Math.floor(
        dateRange!.from!.getTime() / 1000
      )}&rangeDateTo=${Math.floor(dateRange!.to!.getTime() / 1000)}`
    );
  }

  async function handleClickSelected(festival: SelectFestival) {
    if (!festival?.address && !festival?.location) return;

    const predictions = await fetchPredictions(
      festival?.address || festival?.location || ""
    );

    handleSuggestion(predictions?.at(0)?.place_id || "");

    setSelectedFestival(festival);
  }

  return (
    <>
      <section className="bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
          >
            <Input
              placeholder="Type to explore new places..."
              className="flex-1"
              name="search"
            />
            <DatePickerWithRange onValueChange={setDateRange} />
            <Button
              variant="ghost"
              size="icon"
              type="submit"
              className="rounded-full"
            >
              <SearchIcon className="text-black" />
            </Button>
          </form>
        </div>
      </section>
      <section className="bg-gray-200 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <ToggleGroup
            type="multiple"
            className="justify-between overflow-x-auto"
            onValueChange={(value) => setSelectedCategories(value)}
          >
            <ToggleGroupItem value="international" className="flex gap-1">
              <GlobeIcon />
              <span>International</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="cioff" className="flex gap-1">
              <CogIcon />
              <span>CIOFF</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="d" className="flex gap-1">
              <BabyIcon />
              <span>Childrens</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="e" className="flex gap-1">
              <SirenIcon />
              <span>Folk Singing</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="f" className="flex gap-1">
              <DrumIcon />
              <span>Folk dance</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="g" className="flex gap-1">
              <FishIcon />
              <span>Folk music</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="h" className="flex gap-1">
              <CookingPotIcon />
              <span>Traditional food</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="i" className="flex gap-1">
              <TruckIcon />
              <span>Traditional trade</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </section>
      <section className="bg-white py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <MapHandler place={selectedPlace} />
            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
              <Map
                style={{ width: "100%", height: "100%" }}
                defaultCenter={{ lat: 0, lng: 0 }}
                defaultZoom={selectedFestival ? 10 : 2}
                gestureHandling="greedy"
                disableDefaultUI={true}
              >
                {selectedPlace ? (
                  <Marker position={selectedPlace.geometry?.location} />
                ) : null}
              </Map>
            </div>
            <div className="flex-1 bg-gray-100 p-4 rounded-lg">
              <ScrollArea className="h-[400px] w-[600px]">
                <div className="flex flex-col gap-2">
                  {isLoading ? (
                    <SkeletonList />
                  ) : (
                    data?.map(({ festivals: festival }) => (
                      <div
                        key={festival.id}
                        className={cn(
                          "flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-200 hover:cursor-pointer",
                          festival.id === selectedFestival?.id
                            ? "bg-gray-200"
                            : null
                        )}
                        onClick={() => handleClickSelected(festival)}
                      >
                        <div className="animate-pulse">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-400 rounded-lg" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-black text-sm sm:text-base truncate">
                            {festival.name}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
                            <CalendarCheck size={16} />
                            <span>{format(festival.createdAt, "PP")}</span>
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm flex gap-1 items-center">
                            <MapPin size={16} />
                            <span>
                              {festival?.address || festival?.location}
                            </span>
                          </p>
                        </div>
                        <div>
                          <Link href={`/event/${festival.id}`} target="_blank">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500"
                            >
                              <ExternalLink size={15} />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BaseWrapperFilter() {
  return (
    <APIProvider apiKey={"AIzaSyBRO_oBiyzOAQbH7Jcv3ZrgOgkfNp1wJeI"}>
      <WrapperFilter />
    </APIProvider>
  );
}

export default function GlobalFilter({
  fallbackFestivals,
}: {
  fallbackFestivals: { festivals: SelectFestival }[];
}) {
  const fallback = {
    "/api/filters": fallbackFestivals,
  };
  return <BaseWrapperFilter />;
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

function CalendarIcon(props: SVGComponentProps) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
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

function MenuIcon(props: SVGComponentProps) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
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

function UserIcon(props: SVGComponentProps) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function XIcon(props: SVGComponentProps) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
