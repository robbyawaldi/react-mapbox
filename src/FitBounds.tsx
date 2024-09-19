import React, { useContext, useEffect, useMemo } from "react";
import { MapContext } from "./MapContainer";
import mapboxgl from "mapbox-gl";
import { MapInstance } from "./MapInstance";

interface FitBoundsProps {
  bounds: mapboxgl.LngLatBoundsLike;
  options?: mapboxgl.FitBoundsOptions;
}

const FitBounds: React.FC<FitBoundsProps> = ({ bounds, options }) => {
  const context = useContext(MapContext);
  const mapContainer = useMemo(() => context?.option.container ?? "", []);

  useEffect(() => {
    if ((bounds as number[]).includes(Infinity)) return;
    const option = context?.option;
    const map = MapInstance.Pool().getInstanceByMapContainer(mapContainer);
    if (!map || !option) return;
    map.fitBounds(bounds, options);
    if (option.bearing) map.setBearing(option.bearing);
    if (option.pitch) map.setPitch(option.pitch);
  }, [bounds, context]);

  return null;
};

export default FitBounds;
