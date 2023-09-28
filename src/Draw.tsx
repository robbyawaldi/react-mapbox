import React, { useContext, useEffect, useMemo, useRef } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MapContext } from "./MapContainer";
import { MapInstance } from "./MapInstance";

interface DrawProps {
  onDraw: (data: any) => void;
  controls: {
    polygon: boolean;
    trash: boolean;
  };
}

const Draw: React.FC<DrawProps> = ({ onDraw, controls }) => {
  const context = useContext(MapContext);
  const drawRef = useRef<MapboxDraw>();
  const mapContainer = useMemo(() => context?.option.container ?? "", []);

  useEffect(() => {
    const map = MapInstance.Pool().getInstanceByMapContainer(mapContainer);
    if (!map) return;
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls,
    });
    const onDrawer = () => onDraw(draw);
    const onLoad = () => {
      map.addControl(draw);
      map.on("draw.create", onDrawer);
      map.on("draw.delete", onDrawer);
      map.on("draw.update", onDrawer);
      drawRef.current = draw;
    };
    map.on("load", onLoad);
    return () => {
      map.off("load", onLoad);
    };
  }, []);

  useEffect(() => {
    const map = MapInstance.Pool().getInstanceByMapContainer(mapContainer);
    if (!map) return;
    if (drawRef.current !== undefined) {
      (drawRef.current as any).options.controls.polygon = controls.polygon;
      (drawRef.current as any).options.controls.trash = controls.trash;
      map.removeControl(drawRef.current);
      map.addControl(drawRef.current);
    }
  }, [controls.polygon, controls.trash]);
  return null;
};

export default Draw;
