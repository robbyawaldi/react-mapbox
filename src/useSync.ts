import mapboxgl from "mapbox-gl";
import { useEffect, useState } from "react";
// @ts-ignore
import * as turf from "@turf/turf";

function useSync(maps: mapboxgl.Map[]) {
  const [isSync, setIsSync] = useState(false);

  useEffect(() => {
    function on() {
      maps.forEach(function (map, index) {
        map.on("move", fns[index]);
      });
    }

    function off() {
      maps.forEach(function (map, index) {
        map.off("move", fns[index]);
      });
    }

    function moveToMapPosition(master: mapboxgl.Map, clones: mapboxgl.Map[]) {
      const center = master.getCenter();
      const zoom = master.getZoom();
      const bearing = master.getBearing();
      const pitch = master.getPitch();

      if (!isSync) return;
      clones.forEach(function (clone) {
        clone.jumpTo({
          center: center,
          zoom: zoom,
          bearing: bearing,
          pitch: pitch,
        });
      });
    }
    function sync(master: mapboxgl.Map, clones: mapboxgl.Map[]) {
      off();
      moveToMapPosition(master, clones);
      on();
    }

    const fns: any = [];
    maps.forEach(function (map, index) {
      fns[index] = sync.bind(
        null,
        map,
        maps.filter(function (_, i) {
          return i !== index;
        })
      );
    });
    if (isSync && maps.length > 1) {
      moveToMapPosition(maps[0], maps.slice(1));
    }
    on();
    return () => {
      off();
    };
  }, [maps, isSync]);

  return [isSync, setIsSync] as [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ];
}

export default useSync;
