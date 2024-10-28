"use client";

import constants from "@/constants";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export function MapMarkerEvent({
  location,
  lat: newLat,
  lng: newLng,
}: {
  location: string;
  lat: string | null;
  lng: string | null;
}) {
  const lat = Number(newLat) || 0;
  const lng = Number(newLng) || 0;

  return (
    <APIProvider apiKey={constants.google.apiKey!}>
      <div className="rounded-xl py-4">
        <Map
          className="w-full h-[400px]"
          defaultZoom={10}
          defaultCenter={{ lat, lng }}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        >
          <Marker
            position={{
              lat,
              lng,
            }}
          />
        </Map>
      </div>
    </APIProvider>
  );
}
