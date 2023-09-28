import React, { createContext } from "react";

interface GeoJSONProps {
  id: string;
  source:
    | GeoJSON.Feature<GeoJSON.Geometry>
    | GeoJSON.FeatureCollection<GeoJSON.Geometry>
    | string;
  children?: React.ReactNode;
}

export const GeoJSONContext = createContext<{
  id: string;
  source:
    | GeoJSON.Feature<GeoJSON.Geometry>
    | GeoJSON.FeatureCollection<GeoJSON.Geometry>
    | string;
}>({ id: "", source: "" });

const Geojson: React.FC<GeoJSONProps> = ({ id, source, children }) => {
  return (
    <GeoJSONContext.Provider value={{ id, source }}>
      {children}
    </GeoJSONContext.Provider>
  );
};

export default Geojson;
