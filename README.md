# @robbyawaldi/react-mapbox

A lightweight and composable React wrapper for [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) using declarative components.

---

## 📦 Installation

Install via npm:

```bash
npm install @robbyawaldi/react-mapbox
```

You also need to install its peer dependencies:
```bash
npm install mapbox-gl @mapbox/mapbox-gl-draw @turf/turf
```

Then import the required Mapbox CSS styles in your entry file:

```tsx
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
```

## 🚀 Basic Usage

Here’s a minimal example of how to use it in a React component:

``` tsx
import React, { useState } from 'react';
import {
  MapContainer,
  Geojson,
  Layer,
  FitBounds,
  Center,
  Search,
  Draw,
} from '@robbyawaldi/react-mapbox';
import * as turf from "@turf/turf";

const App = () => {
  const [search, setSearch] = useState("");
  const [draws, setDraws] = useState<GeoJSON.FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });

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

  const geojsonData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Location A" },
        geometry: {
          type: "Point",
          coordinates: [106.8272, -6.1751],
        },
      },
    ],
  };

  const layers =  useMemo<LayerProps["layers"]>(() => {
    return [
      {
        id: "point-layer",
        type: "circle",
        paint: {
          "circle-radius": 6,
          "circle-color": "#007cbf",
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
    ];
  }, []);

  return (
    <MapContainer
      accessToken="YOUR_MAPBOX_TOKEN"
      height={400}
      mapOption={{
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [106.83173906777137, -6.193283376086626],
        zoom: 12,
      }}
    >
      <Geojson id="geo-source" source={geojsonData}>
        <Layer layers={layers}/>
      </Geojson>

      <Geojson id="draw" source={draws}>
        <Layer layers={[
          {
            id: "fill-draw-layer",
            type: "fill",
            paint: {
              "fill-color": "#3BB2D0",
              "fill-opacity": 0.3,
            },
          }
        ]} />
      </Geojson>

      <Center center={[106.8272, -6.1751]} zoomLevel={12} />

      <FitBounds
        bounds={[
          106.8272,
          -6.1933, 
          106.8317, 
          -6.1751, 
        ]}
      />

      <Search
        keyword={search}
        onSearch={(features: any[]) => {
            console.log(features)
        }}
      />

      <Draw onDraw={handleDraw} controls={{ polygon: true, trash: true }} />
    </MapContainer>
  );
};

export default App;
```

## 📚 Available Components

| Component     | Description |
|---------------|-------------|
| `MapContainer` | Root component that initializes the map and provides context. |
| `Geojson`      | Provides and shares GeoJSON data via React Context. |
| `Layer`        | Adds map layers declaratively, supports images and clustering. |
| `Center`       | Sets the map center and zoom level declaratively. |
| `FitBounds`    | Automatically fits the map view to the given bounds. |
| `Search`       | Performs geocoding via Mapbox Places API using a keyword. |
| `Draw`         | Adds interactive drawing tools (polygon, trash). |
| `useSync`      | React hook to synchronize multiple maps’ position and zoom. |

---

## 🛠 Utility Functions

| Function       | Description |
|----------------|-------------|
| `dataParser`   | Merges external data into a GeoJSON FeatureCollection using a mapping key and optional custom property builder. |