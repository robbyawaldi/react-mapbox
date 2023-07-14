import { createContext, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

export const MapContext = createContext<mapboxgl.Map | null>(null);

interface MapContainerProps {
  accessToken: string;
  height: string | number;
  mapOption: mapboxgl.MapboxOptions;
  children?: React.ReactNode;
  control?: mapboxgl.Control | mapboxgl.IControl;
  positionControl?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const MapContainer = ({
  accessToken,
  mapOption,
  control,
  positionControl,
  height,
  children,
}: MapContainerProps) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;
    const mapInstance = new mapboxgl.Map(mapOption);
    if (control) {
      mapInstance.addControl(control, positionControl);
    }
    setMap(mapInstance);
    return () => {
      setMap(null);
    };
  }, [mapOption]);

  return (
    <MapContext.Provider value={map}>
      <div className="relative">
        <div
          id={mapOption.container as string}
          style={{ height, width: "100%" }}
        />
        {children}
      </div>
    </MapContext.Provider>
  );
};

export default MapContainer;
