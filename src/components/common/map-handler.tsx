import { useMap } from "@vis.gl/react-google-maps";
import React, { useEffect } from "react";

interface Props {
  place: google.maps.places.PlaceResult | null;
}

const MapHandler = ({ place }: Props) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (!place) {
      map.setZoom(2);
      return;
    }

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport);
    }
  }, [map, place]);

  return null;
};

export default React.memo(MapHandler);
