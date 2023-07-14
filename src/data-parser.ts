export function dataParser(
  collection: GeoJSON.FeatureCollection,
  collectionKey: string,
  properties: Record<string, unknown>[],
  propertyKey: string,
  propertyBuilder?: (properties: any) => any
): GeoJSON.FeatureCollection {
  return {
    ...collection,
    features: collection.features.map((feature) => {
      const collectionPropertyValue = feature.properties?.[collectionKey];
      const property = properties.find(
        (property) => property[propertyKey] === collectionPropertyValue
      );

      const updatedProperties = {
        ...feature.properties,
        ...property,
      };

      return {
        ...feature,
        properties: propertyBuilder
          ? propertyBuilder(updatedProperties)
          : updatedProperties,
      };
    }),
  };
}
