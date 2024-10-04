import { useMap } from "@vis.gl/react-google-maps";
import React, { useEffect } from "react";

interface Props {
  id?: string | null;
  place: google.maps.places.PlaceResult | null;
  defaultZoom?: number;
}

const MapHandler = ({ id, place, defaultZoom }: Props) => {
  const map = useMap(id);

  useEffect(() => {
    if (!map) return;

    if (!place) {
      map.setZoom(defaultZoom || 2);
      return;
    }

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport);
    }
  }, [map, place, defaultZoom]);

  return null;
};

export default React.memo(MapHandler);
