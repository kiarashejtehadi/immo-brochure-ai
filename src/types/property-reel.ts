/** Props for the vertical property reel Remotion composition (1080×1920). */
export type ReelBrokerContact = {
  name?: string;
  phone?: string;
  email?: string;
};

export type PropertyReelProps = {
  /** Public URLs or data URLs for listing photos (max 5 recommended). */
  photos: string[];
  /** Formatted price label, e.g. "€450,000" or "€1,850 / month". */
  price: string;
  /** Size with unit, e.g. "85 m²". */
  size: string;
  /** Address or neighborhood, e.g. "10115 Berlin". */
  location: string;
  /** Optional room count label, e.g. "3 rooms" or "3 Zimmer". */
  rooms?: string;
  /** Optional property type label, e.g. "Apartment". */
  propertyType?: string;
  /** Optional marketing headline shown at the top. */
  headline?: string;
  /** Agency logo URL or data URL for watermark and end screen. */
  agencyLogoUrl?: string;
  /** Hex brand color for accents, e.g. "#1E293B". */
  brandColor?: string;
  /** Broker contact details for the end-screen frame. */
  brokerContact?: ReelBrokerContact;
  /** When true, show diagonal demo watermark and hide Pro branding/end card. */
  showDemoWatermark?: boolean;
};
