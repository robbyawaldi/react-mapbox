import React, { useContext, useEffect, useMemo, useState } from "react";
import { MapContext } from "./MapContainer";
import mapboxgl from "mapbox-gl";
import { GeoJSONContext } from "./Geojson";
import { GeoJsonProperties } from "geojson";
// @ts-ignore
import * as turf from "@turf/turf";

type ExcludeValue<T, V> = T extends V ? never : T;

function generateId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const idLength = 6;
  let id = "";
  for (let i = 0; i < idLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters.charAt(randomIndex);
  }
  return id;
}

export interface LayerProps {
  layers: {
    id: string;
    type: ExcludeValue<mapboxgl.AnyLayer["type"], "custom">;
    paint: Record<string, string | unknown>;
    popupTemplate?(properties?: GeoJsonProperties): string;
    onClick?(properties?: GeoJsonProperties): void;
  }[];
}

export const Layer: React.FC<LayerProps> = ({ layers }) => {
  const map = useContext(MapContext);
  const source = useContext(GeoJSONContext);
  const id = useMemo(generateId, []);
  const [mapSource, setMapSource] = useState<
    mapboxgl.GeoJSONSource | undefined
  >();

  useEffect(() => {
    function init() {
      map?.once("load", () => {
        map.addSource(id, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          } as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
        });
        setMapSource(map.getSource(id) as mapboxgl.GeoJSONSource);
        for (const layer of layers) {
          map.addLayer({
            id: layer.id,
            type: layer.type,
            paint: layer.paint,
            source: id,
          });
          const popupTemplate = layer.popupTemplate;
          if (popupTemplate) {
            const popup = new mapboxgl.Popup();
            map.on("mousemove", layer.id, (e) => {
              const properties = e.features?.[0].properties;
              let longlat = e.lngLat;
              try {
                longlat = (
                  turf.center(
                    turf.multiPolygon(
                      (e.features?.[0].geometry as GeoJSON.Polygon).coordinates
                    )
                  ) as GeoJSON.Feature<GeoJSON.Point>
                ).geometry.coordinates as any;
              } catch (err) {}
              popup
                .setLngLat(longlat)
                .setHTML(popupTemplate(properties))
                .addTo(map);
            });
          }
          const onClick = layer.onClick;
          if (onClick) {
            map?.on("click", layer.id, (e) => {
              const properties = e.features?.[0].properties;
              onClick(properties);
            });
          }
        }
      });
    }
    init();
  }, [map]);

  useEffect(() => {
    if (mapSource && source) {
      mapSource.setData(source);
    }
  }, [mapSource, source]);

  return null;
};
