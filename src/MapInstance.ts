import mapboxgl, { MapboxOptions } from "mapbox-gl";

export class MapInstance {
  private readonly mapboxPool: {
    mapContainer: string;
    instance: mapboxgl.Map;
  }[] = [];
  static mapbox: MapInstance;

  static Pool() {
    if (this.mapbox) return this.mapbox;
    else {
      this.mapbox = new MapInstance();
      return this.mapbox;
    }
  }

  addInstance(option: mapboxgl.MapboxOptions) {
    const index = this.mapboxPool.findIndex(
      (m) => m.mapContainer === option.container
    );
    if (index >= 0) return this.mapboxPool[index].instance;
    const newInstance = new mapboxgl.Map(option);
    this.mapboxPool.push({
      mapContainer: option.container as string,
      instance: newInstance,
    });
    return newInstance;
  }

  removeInstance(mapContainer: MapboxOptions["container"]) {
    const index = this.mapboxPool.findIndex(
      (m) => m.mapContainer === mapContainer
    );
    this.mapboxPool[index].instance.remove();
    if (index >= 0 && index < this.mapboxPool.length) {
      this.mapboxPool.splice(index, 1);
    }
  }

  getAllInstance() {
    return this.mapboxPool.map((p) => p.instance);
  }

  getInstanceByMapContainer(mapContainer: MapboxOptions["container"]) {
    return (
      this.mapboxPool.find((m) => m.mapContainer == mapContainer)?.instance ??
      null
    );
  }
}
