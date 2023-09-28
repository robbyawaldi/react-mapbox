import React, { useContext, useEffect, useMemo } from "react";
import { MapContext } from "./MapContainer";
import { MapInstance } from "./MapInstance";

interface CenterProps {
  center: [number, number] | undefined;
  zoomLevel: number;
}

const Center: React.FC<CenterProps> = ({ center, zoomLevel }) => {
  const context = useContext(MapContext);
  const mapContainer = useMemo(() => context?.option.container ?? "", []);

  useEffect(() => {
    const map = MapInstance.Pool().getInstanceByMapContainer(mapContainer);
    if (center && map) {
      map.setCenter(center);
      map.setZoom(zoomLevel);
    }
  }, [center, zoomLevel, context]);
  return null;
};

export default Center;
