import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { MapContext } from "./MapContainer";
import mapboxgl, { AnyLayout } from "mapbox-gl";
import { GeoJSONContext } from "./Geojson";
// @ts-ignore
import * as turf from "@turf/turf";
import { MapInstance } from "./MapInstance";

type ExcludeValue<T, V> = T extends V ? never : T;

type Image =
  | HTMLImageElement
  | ArrayBufferView
  | { width: number; height: number; data: Uint8Array | Uint8ClampedArray }
  | ImageData
  | ImageBitmap;

export interface LayerProps {
  layers: {
    id: string;
    type: ExcludeValue<mapboxgl.AnyLayer["type"], "custom">;
    paint?: Record<string, string | unknown>;
    layout?: AnyLayout | undefined;
    filter?: any[] | undefined;
    images?: {
      name: string;
      image: ((map: mapboxgl.Map | null) => Image) | Image;
      options?: {
        pixelRatio?: number | undefined;
        sdf?: boolean | undefined;
        stretchX?: [number, number][] | undefined;
        stretchY?: [number, number][] | undefined;
        content?: [number, number, number, number] | undefined;
      };
    }[];
    getMapInstance?(map: mapboxgl.Map, layerId: string): void;
  }[];
  cluster?: {
    clusterMaxZoom?: number;
    clusterRadius?: number;
    clusterMinPoints?: number;
    clusterProperties?: object;
  };
}

export const Layer: React.FC<LayerProps> = ({ layers, cluster }) => {
  const context = useContext(MapContext);
  const geojson = useContext(GeoJSONContext);
  const mapContainer = useMemo(() => context?.option.container ?? "", []);

  const getMap = useCallback(() => {
    const map = MapInstance.Pool().getInstanceByMapContainer(
      mapContainer as string
    );
    return map;
  }, []);

  const getSource = useCallback(() => {
    const mapSource = getMap()?.getSource(geojson.id);
    return mapSource;
  }, []);

  useEffect(() => {
    const map = getMap();
    if (!map) return;
    const onLoad = () => {
      map.addSource(geojson.id, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        } as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
        ...(cluster
          ? {
              cluster: true,
              clusterMaxZoom: cluster.clusterMaxZoom,
              clusterMinPoints: cluster.clusterMinPoints,
              clusterProperties: cluster.clusterProperties,
              clusterRadius: cluster.clusterRadius,
            }
          : {}),
      });

      for (const layer of layers) {
        if (layer.images) {
          for (const image of layer.images) {
            map.addImage(
              image?.name,
              typeof image.image === "function"
                ? image.image(map)
                : image.image,
              image.options
            );
          }
        }
        map.addLayer({
          ...layer,
          source: geojson.id,
        });
        if (layer.getMapInstance) {
          layer.getMapInstance(map, layer.id);
        }
      }
    };
    map.on("load", onLoad);
    return () => {
      map.off("load", onLoad);
    };
  }, []);

  useEffect(() => {
    const map = getMap();
    if (!map) return;
    const onLoad = () => {
      if (!geojson.source) return;
      const mapSource = getSource();
      if (mapSource) {
        (mapSource as mapboxgl.GeoJSONSource).setData(geojson.source);
      }
    };
    const source = getSource();
    if (source !== undefined) {
      onLoad();
    } else {
      map.on("load", onLoad);
    }
    return () => {
      map.off("load", onLoad);
    };
  }, [geojson.id, geojson.source]);
  return null;
};
