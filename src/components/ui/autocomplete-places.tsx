import React, { useEffect, useState, useCallback, FormEvent } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  id?: string | null;
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  defaultPlace?: string;
}
const AutocompletePlaces = React.forwardRef<React.ElementRef<"button">, Props>(
  ({ id, onPlaceSelect, defaultPlace }, ref) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const map = useMap(id);
    const places = useMapsLibrary("places");

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

    const [inputValue, setInputValue] = useState<string>(defaultPlace ?? "");

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

        setLoading(true);
        const request = { input: inputValue, sessionToken };
        const response = await autocompleteService.getPlacePredictions(request);
        setLoading(false);

        setPredictionResults(response.predictions);
      },
      [autocompleteService, sessionToken]
    );

    const onInputChange = useCallback(
      (value: string) => {
        setInputValue(value);
        fetchPredictions(value);
      },
      [fetchPredictions]
    );

    const handleSuggestionClick = useCallback(
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
          onPlaceSelect(placeDetails);
          setPredictionResults([]);
          setInputValue(placeDetails?.formatted_address ?? "");
          setSessionToken(new places.AutocompleteSessionToken());
        };

        placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
      },
      [onPlaceSelect, places, placesService, sessionToken]
    );

    return (
      <div className="w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              ref={ref}
              aria-expanded={open}
              className="w-full justify-between overflow-hidden"
            >
              {inputValue || "Search a place..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Command className="w-full" shouldFilter={false}>
              <CommandInput
                placeholder="Search a place..."
                onValueChange={onInputChange}
              />
              <CommandList>
                {loading && <CommandLoading>Fetching words…</CommandLoading>}
                {predictionResults.map((prediction) => (
                  <CommandItem
                    key={prediction.place_id}
                    value={prediction.place_id}
                    onSelect={(currentValue) => {
                      handleSuggestionClick(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        inputValue === prediction.description
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {prediction.description}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

AutocompletePlaces.displayName = "AutoCompletePlaces";

export { AutocompletePlaces };
