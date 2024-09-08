"use client";

import { SelectFestival } from "@/db/schema";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export function MapMarkerEvent({ event }: { event: SelectFestival }) {
  const lat = Number(event?.location?.split(",").at(0)) || 0;
  const lng = Number(event?.location?.split(",").at(1)) || 0;

  return (
    <APIProvider apiKey={"AIzaSyBRO_oBiyzOAQbH7Jcv3ZrgOgkfNp1wJeI"}>
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
