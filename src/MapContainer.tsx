import { createContext, useEffect, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapInstance } from "./MapInstance";

export const MapContext = createContext<{
  option: mapboxgl.MapboxOptions;
} | null>(null);

interface MapContainerProps {
  accessToken: string;
  height: string | number;
  mapOption: mapboxgl.MapboxOptions;
  children?: React.ReactNode;
  control?: mapboxgl.Control | mapboxgl.IControl;
  positionControl?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  with3DBuilding?: boolean;
}

const MapContainer = ({
  accessToken,
  mapOption,
  control,
  positionControl,
  height,
  children,
  with3DBuilding = false,
}: MapContainerProps) => {
  const [styleLoaded, setStyleLoaded] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = accessToken;
    const map = MapInstance.Pool().addInstance(mapOption);
    if (control) {
      map.addControl(control, positionControl);
    }
    const onStyleLoad = () => {
      setStyleLoaded(true);
    };
    map.on("style.load", onStyleLoad);
    return () => {
      map.off("style.load", onStyleLoad);
      MapInstance.Pool().removeInstance(mapOption.container);
    };
  }, []);

  useEffect(() => {
    const map = MapInstance.Pool().getInstanceByMapContainer(
      mapOption.container
    );
    const id = "3d-buildings";
    const onLoad = () => {
      const layer = map?.getLayer(id);
      if (with3DBuilding && !layer) {
        map?.addLayer(
          {
            id,
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "min_height"],
              ],
              "fill-extrusion-opacity": 0.6,
            },
          }
          // labelLayerId
        );
      } else if (layer) {
        map?.removeLayer(id);
      }
    };
    if (map?.isStyleLoaded()) {
      onLoad();
    } else {
      map?.on("style.load", onLoad);
    }
    return () => {
      map?.off("style.load", onLoad);
    };
  }, [with3DBuilding]);

  const context = useMemo(
    () => ({
      option: mapOption,
    }),
    [mapOption]
  );

  return (
    <MapContext.Provider value={context}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div
          id={mapOption.container as string}
          style={{ height, width: "100%" }}
        />
        {styleLoaded && children}
      </div>
    </MapContext.Provider>
  );
};

export default MapContainer;
