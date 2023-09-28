import { useCallback, useMemo, useState } from "react";
import MapContainer from "../MapContainer";
import Search from "../Search";
import Center from "../Center";
import mapboxgl from "mapbox-gl";
import Geojson from "../Geojson";
import { Layer, LayerProps } from "../Layer";
import Draw from "../Draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// @ts-ignore
import * as turf from "@turf/turf";
import useSync from "../useSync";
import { MapInstance } from "..";

function Map({
  id,
  search,
  handleDraw,
  setSearchItems,
  location,
  draws,
  setDraws,
}: any) {
  const [polygon, setPolygon] = useState(true);
  const [trash, setTrash] = useState(true);
  const [is3D, setIs3D] = useState(true);
  const mapOption = useMemo<mapboxgl.MapboxOptions>(
    () => ({
      style: "mapbox://styles/mapbox/dark-v10",
      container: "map_" + id,
      center: [106.83173906777137, -6.193283376086626],
      zoom: 12,
    }),
    []
  );

  const layers = useMemo<LayerProps["layers"]>(() => {
    return [
      {
        id: "fill-layer",
        type: "fill",
        paint: {
          "fill-color": "#3BB2D0",
          "fill-opacity": 0.3,
        },
        getMapInstance(map, layerId) {
          const popup = new mapboxgl.Popup({ closeButton: false });
          map.on("click", layerId, () => {
            popup
              .setLngLat([106.83173906777137, -6.193283376086626])
              .setHTML("<h1>test</h1>")
              .addTo(map);
          });
          map.on("mousemove", layerId, (e) => {
            const prevLonglat = popup.getLngLat();
            const properties = e.features?.[0].properties;
            let longlat = e.lngLat;
            if (properties && "longitude" in properties && "latitude") {
              longlat = {
                lat: properties["latitude"],
                lng: properties["longitude"],
              } as any;
            }
            if (
              prevLonglat?.lng === longlat.lng &&
              prevLonglat?.lat === longlat.lat
            )
              return;
            popup.remove();
            popup.setLngLat(longlat).setHTML("<h1>test</h1>").addTo(map);
          });
        },
      },
      {
        id: "line-layer",
        type: "line",
        paint: {
          "line-color": "#3BB2D0",
          "line-width": 2,
        },
      },
    ];
  }, []);

  return (
    <MapContainer
      accessToken="pk.eyJ1Ijoic2hhZmFuYXVyYSIsImEiOiJjbDBjOG0xMW0xMGpzM2pycWdmMjI0NnF2In0.R5_vlGTN1R93lBpcUkNlFg"
      height={400}
      mapOption={mapOption}
      with3DBuilding={is3D}
    >
      <Search
        keyword={search}
        onSearch={(result) => {
          setSearchItems(result);
        }}
      />
      <Center center={location} zoomLevel={12} />
      <Geojson id="data" source={draws}>
        <Layer layers={layers} />
      </Geojson>
      <Draw onDraw={handleDraw} controls={{ polygon, trash }} />
      <input
        type="checkbox"
        onChange={(e) => {
          setPolygon(e.target.checked);
        }}
      />
      <label>Polygon</label>
      <input
        type="checkbox"
        onChange={(e) => {
          setTrash(e.target.checked);
        }}
      />
      <button onClick={() => setIs3D((value) => !value)}>
        {is3D ? "3D" : "2D"}
      </button>
      <label>Trash</label>
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        <button
          onClick={() => {
            setDraws({
              type: "FeatureCollection",
              features: [],
            });
          }}
        >
          <svg
            width="18px"
            height="18px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </MapContainer>
  );
}

function Example() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [searchItems, setSearchItems] = useState<any[]>([]);
  const [location, setLocation] = useState<[number, number]>();
  const [draws, setDraws] = useState<GeoJSON.FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });

  const [isSync, setIsSync] = useSync(MapInstance.Pool().getAllInstance());

  const data = useMemo(() => new Array(2).fill(1), []);

  const handleDraw = useCallback((draw: any) => {
    const data = draw.getAll();
    const area = turf.area(data);
    const rounded_area = Math.round(area * 100) / 100;

    setDraws({
      type: "FeatureCollection",
      features: [],
    });
    if (rounded_area > 25_000_000) {
      alert("out of max area");
    } else {
      setDraws(data);
    }
  }, []);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
        {data.map((_, k) => (
          <div key={k}>
            <Map
              id={k}
              search={search}
              handleDraw={handleDraw}
              setSearchItems={setSearchItems}
              location={location}
              draws={draws}
              setDraws={setDraws}
            />
          </div>
        ))}
      </div>
      <button onClick={() => setIsDarkMode(!isDarkMode)}>change</button>
      <button onClick={() => setIsSync((s) => !s)}>
        {isSync ? "Sync" : "Async"}
      </button>
      <input value={search} onChange={(v) => setSearch(v.target.value)} />
      <div
        style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 12 }}
      >
        {searchItems.map((item: any, key) => (
          <button
            key={key}
            onClick={() => {
              setLocation(item.center);
            }}
          >
            {item.place_name}
          </button>
        ))}
      </div>
    </>
  );
}

export default Example;
