export type PoiCategory = "transit" | "parks" | "shopping" | "connectivity";

export type NearbyPoi = {
  name: string;
  category: PoiCategory;
  distanceMeters: number;
  subtype?: string;
};

export type LocationEnrichment = {
  lat: number;
  lon: number;
  displayName: string;
  transit: NearbyPoi[];
  parks: NearbyPoi[];
  shopping: NearbyPoi[];
  connectivity: NearbyPoi[];
};
