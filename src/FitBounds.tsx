import React, { useContext, useEffect } from "react";
import { MapContext } from "./MapContainer";
import mapboxgl from "mapbox-gl";

interface FitBoundsProps {
  bounds: mapboxgl.LngLatBoundsLike;
}

const FitBounds: React.FC<FitBoundsProps> = ({ bounds }) => {
  const map = useContext(MapContext);

  useEffect(() => {
    if ((bounds as number[]).includes(Infinity)) return;
    map?.fitBounds(bounds);
  }, [bounds, map]);

  return null;
};

export default FitBounds;
