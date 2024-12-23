import { useEffect, useState } from "react";
// @ts-ignore
import * as turf from "@turf/turf";

function useSync(maps: mapboxgl.Map[], isSync: boolean = false) {
  const [_isSync, setIsSync] = useState(isSync);

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

      if (!_isSync) return;
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
    if (_isSync && maps.length > 1) {
      moveToMapPosition(maps[0], maps.slice(1));
    }
    on();
    return () => {
      off();
    };
  }, [maps, _isSync]);

  return [_isSync, setIsSync] as [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>
  ];
}

export default useSync;
