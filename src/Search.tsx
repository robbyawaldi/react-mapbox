import React, { useEffect, useMemo } from "react";
import { debounce } from "./debounce";
import mapboxgl from "mapbox-gl";

interface SearchProps {
  keyword: string;
  onSearch: (result: any[]) => void;
}

const Search: React.FC<SearchProps> = ({ keyword, onSearch }) => {
  const search = useMemo(
    () =>
      debounce(async (keyword: string) => {
        if (keyword === "") return;
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            keyword
          )}.json?access_token=${mapboxgl.accessToken}`
        );
        const body = await response.json();
        onSearch(body?.features);
      }, 200),
    []
  );
  useEffect(() => {
    search(keyword);
  }, [keyword]);
  return null;
};

export default Search;
