import React, { createContext } from "react";

interface GeoJSONProps {
  source:
    | GeoJSON.Feature<GeoJSON.Geometry>
    | GeoJSON.FeatureCollection<GeoJSON.Geometry>
    | string;
  children?: React.ReactNode;
}

export const GeoJSONContext = createContext<
  | GeoJSON.Feature<GeoJSON.Geometry>
  | GeoJSON.FeatureCollection<GeoJSON.Geometry>
  | string
  | null
>(null);

const Geojson: React.FC<GeoJSONProps> = ({ source, children }) => {
  return (
    <GeoJSONContext.Provider value={source}>{children}</GeoJSONContext.Provider>
  );
};

export default Geojson;
