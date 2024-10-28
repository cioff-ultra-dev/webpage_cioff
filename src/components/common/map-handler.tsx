import { useMap } from "@vis.gl/react-google-maps";
import React, { useEffect } from "react";

interface Props {
  id?: string | null;
  place: google.maps.places.PlaceResult | null;
  defaultZoom?: number;
  defaultSelectedZoom?: number;
}

const MapHandler = ({
  id,
  place,
  defaultZoom = 2,
  defaultSelectedZoom = 9,
}: Props) => {
  const map = useMap(id);

  useEffect(() => {
    if (!map) return;

    if (!place) {
      map.setZoom(defaultZoom);
      return;
    }

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport);
      map.setZoom(defaultSelectedZoom);
    }
  }, [map, place, defaultZoom, defaultSelectedZoom]);

  return null;
};

export default React.memo(MapHandler);
