export type PoiCategory =
  | "transit"
  | "parks"
  | "shopping"
  | "connectivity"
  | "water"
  | "culture";

export type LandmarkKind = "park" | "transit" | "water" | "culture" | "shopping" | "connectivity";

export type NearbyPoi = {
  name: string;
  category: PoiCategory;
  distanceMeters: number;
  subtype?: string;
};

export type NearbyLandmark = {
  name: string;
  kind: LandmarkKind;
  distanceMeters: number;
  subtype?: string;
};

export type LocationEnrichment = {
  lat: number;
  lon: number;
  displayName: string;
  /** Hyper-local iconic POIs (parks, rivers, stations, monuments) for AI location copy. */
  nearbyLandmarks: NearbyLandmark[];
  /** Postal code + city + district string for fallback landmark discovery. */
  districtContext: string;
  transit: NearbyPoi[];
  parks: NearbyPoi[];
  shopping: NearbyPoi[];
  connectivity: NearbyPoi[];
  water: NearbyPoi[];
  culture: NearbyPoi[];
};
