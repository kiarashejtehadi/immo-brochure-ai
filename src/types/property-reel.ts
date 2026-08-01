/** Props for the vertical property reel Remotion composition (1080×1920). */
export type PropertyReelProps = {
  /** Public URLs or data URLs for listing photos (max 5 recommended). */
  photos: string[];
  /** Formatted price label, e.g. "€450,000" or "€1,850 / month". */
  price: string;
  /** Size with unit, e.g. "85 m²". */
  size: string;
  /** Address or neighborhood, e.g. "10115 Berlin". */
  location: string;
  /** Optional room count, e.g. "3". */
  rooms?: string;
  /** Optional property type label, e.g. "Apartment". */
  propertyType?: string;
  /** Optional marketing headline shown at the top. */
  headline?: string;
};
