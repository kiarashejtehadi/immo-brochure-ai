import { Composition } from "remotion";
import { PropertyReel } from "./PropertyReel";
import {
  PROPERTY_REEL_COMPOSITION_ID,
  PROPERTY_REEL_DURATION_FRAMES,
  PROPERTY_REEL_FPS,
  PROPERTY_REEL_HEIGHT,
  PROPERTY_REEL_WIDTH,
} from "./constants";
import type { PropertyReelProps } from "@/types/property-reel";

const defaultProps: PropertyReelProps = {
  photos: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2cd9361?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1080&q=80",
  ],
  price: "€450,000",
  size: "85 m²",
  location: "10115 Berlin, Mitte",
  rooms: "3",
  propertyType: "Apartment",
  headline: "Bright city apartment with balcony",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={PROPERTY_REEL_COMPOSITION_ID}
        component={PropertyReel}
        durationInFrames={PROPERTY_REEL_DURATION_FRAMES}
        fps={PROPERTY_REEL_FPS}
        width={PROPERTY_REEL_WIDTH}
        height={PROPERTY_REEL_HEIGHT}
        defaultProps={defaultProps}
      />
    </>
  );
};
