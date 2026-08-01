import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DEFAULT_BRAND_COLOR } from "@/types/branding";
import type { PropertyReelProps, ReelBrokerContact } from "@/types/property-reel";
import {
  PROPERTY_REEL_DURATION_FRAMES,
  PROPERTY_REEL_END_SCREEN_FRAMES,
  SLIDE_TRANSITION_FRAMES,
} from "./constants";

const SPRING_ENTER = { damping: 200, stiffness: 120, mass: 0.85 };
const SPRING_EXIT = { damping: 220, stiffness: 140, mass: 0.75 };
const SPRING_TEXT = { damping: 200, stiffness: 100, mass: 0.9 };

const PLACEHOLDER_GRADIENT =
  "linear-gradient(160deg, #1e293b 0%, #0f172a 45%, #312e81 100%)";

function PhotoSlide({
  src,
  durationInFrames,
}: {
  src: string;
  durationInFrames: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterProgress = spring({
    frame,
    fps,
    config: SPRING_ENTER,
  });

  const exitStart = Math.max(0, durationInFrames - SLIDE_TRANSITION_FRAMES);
  const exitProgress = spring({
    frame: frame - exitStart,
    fps,
    config: SPRING_EXIT,
  });

  const enterX = interpolate(enterProgress, [0, 1], [108, 0]);
  const exitX =
    frame >= exitStart ? interpolate(exitProgress, [0, 1], [0, -108]) : 0;
  const translateX = enterX + exitX;

  const kenBurns = interpolate(
    frame,
    [0, durationInFrames],
    [1.12, 1.04],
    { extrapolateRight: "clamp" },
  );

  const opacity =
    frame >= exitStart
      ? interpolate(exitProgress, [0, 1], [1, 0.35], { extrapolateRight: "clamp" })
      : 1;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#0a0a0a" }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity,
          transform: `translateX(${translateX}%) scale(${kenBurns})`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      />
    </AbsoluteFill>
  );
}

function PlaceholderSlide() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({ frame, fps, config: SPRING_ENTER });

  return (
    <AbsoluteFill
      style={{
        background: PLACEHOLDER_GRADIENT,
        opacity: interpolate(fadeIn, [0, 1], [0.6, 1]),
      }}
    />
  );
}

function AgencyLogoWatermark({ src }: { src: string }) {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "flex-end",
        padding: "40px 40px 0 0",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 14px",
          borderRadius: 12,
          backgroundColor: "rgba(0, 0, 0, 0.38)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        <Img
          src={src}
          style={{
            maxHeight: 64,
            maxWidth: 160,
            width: "auto",
            height: "auto",
            objectFit: "contain",
            opacity: 0.92,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

function ReelProgressBar({ brandColor }: { brandColor: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 8,
          backgroundColor: "rgba(255, 255, 255, 0.22)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: brandColor,
            boxShadow: `0 0 12px ${brandColor}88`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

function ReelTextOverlay({
  price,
  size,
  location,
  rooms,
  propertyType,
  headline,
  brandColor,
}: Pick<
  PropertyReelProps,
  "price" | "size" | "location" | "rooms" | "propertyType" | "headline" | "brandColor"
>) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelEnter = spring({
    frame,
    fps,
    delay: 6,
    config: SPRING_TEXT,
  });

  const headlineEnter = spring({
    frame,
    fps,
    delay: 4,
    config: SPRING_TEXT,
  });

  const specsParts = [propertyType, size, rooms ? `${rooms} rooms` : null].filter(
    Boolean,
  ) as string[];

  const panelY = interpolate(panelEnter, [0, 1], [48, 0]);
  const headlineY = interpolate(headlineEnter, [0, 1], [-24, 0]);
  const accent = brandColor ?? DEFAULT_BRAND_COLOR;

  return (
    <>
      {headline ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            padding: "72px 48px 0",
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              margin: 0,
              maxWidth: 900,
              color: "#ffffff",
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              textShadow: "0 8px 32px rgba(0,0,0,0.45)",
              opacity: headlineEnter,
              transform: `translateY(${headlineY}px)`,
            }}
          >
            {headline}
          </p>
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          pointerEvents: "none",
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "0 0 88px",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.88) 100%)",
            opacity: panelEnter,
            transform: `translateY(${panelY}px)`,
          }}
        >
          <div style={{ padding: "0 48px" }}>
            <div
              style={{
                display: "inline-block",
                padding: "10px 22px",
                borderRadius: 12,
                backgroundColor: accent,
                boxShadow: `0 8px 32px ${accent}66`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#ffffff",
                  fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                  fontSize: 72,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                {price}
              </p>
            </div>

            {specsParts.length > 0 ? (
              <p
                style={{
                  margin: "20px 0 0",
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.14)",
                  borderLeft: `4px solid ${accent}`,
                  color: "rgba(255,255,255,0.95)",
                  fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                  fontSize: 34,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {specsParts.join(" · ")}
              </p>
            ) : null}

            <p
              style={{
                margin: "16px 0 0",
                color: "rgba(255,255,255,0.78)",
                fontFamily:
                  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                fontSize: 28,
                fontWeight: 500,
                lineHeight: 1.35,
              }}
            >
              {location}
            </p>
          </div>
        </div>
      </AbsoluteFill>
    </>
  );
}

function EndScreen({
  agencyLogoUrl,
  brandColor,
  brokerContact,
}: {
  agencyLogoUrl?: string;
  brandColor: string;
  brokerContact?: ReelBrokerContact;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({ frame, fps, config: SPRING_ENTER });
  const contentY = interpolate(fadeIn, [0, 1], [32, 0]);

  const hasContact = Boolean(
    brokerContact?.name || brokerContact?.phone || brokerContact?.email,
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, ${brandColor}ee 0%, #0a0a0a 55%, #000000 100%)`,
        opacity: fadeIn,
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 64px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transform: `translateY(${contentY}px)`,
          opacity: fadeIn,
        }}
      >
        {agencyLogoUrl ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 48,
              padding: "24px 32px",
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
            }}
          >
            <Img
              src={agencyLogoUrl}
              style={{
                maxHeight: 120,
                maxWidth: 320,
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        ) : null}

        {hasContact ? (
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              padding: "36px 40px",
              borderRadius: 20,
              backgroundColor: "rgba(0, 0, 0, 0.42)",
              border: `2px solid ${brandColor}`,
              backdropFilter: "blur(8px)",
            }}
          >
            {brokerContact?.name ? (
              <p
                style={{
                  margin: 0,
                  color: "#ffffff",
                  fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                  fontSize: 44,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                {brokerContact.name}
              </p>
            ) : null}

            {brokerContact?.phone ? (
              <p
                style={{
                  margin: brokerContact?.name ? "20px 0 0" : 0,
                  color: "rgba(255,255,255,0.92)",
                  fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                  fontSize: 32,
                  fontWeight: 600,
                  lineHeight: 1.35,
                }}
              >
                {brokerContact.phone}
              </p>
            ) : null}

            {brokerContact?.email ? (
              <p
                style={{
                  margin: "12px 0 0",
                  color: "rgba(255,255,255,0.78)",
                  fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
                  fontSize: 28,
                  fontWeight: 500,
                  lineHeight: 1.35,
                }}
              >
                {brokerContact.email}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}

export const PropertyReel: React.FC<PropertyReelProps> = ({
  photos,
  price,
  size,
  location,
  rooms,
  propertyType,
  headline,
  agencyLogoUrl,
  brandColor,
  brokerContact,
}) => {
  const accent = brandColor?.trim() || DEFAULT_BRAND_COLOR;

  const slides =
    photos.length > 0
      ? photos.slice(0, 5)
      : [""];

  const slideDuration = Math.max(
    1,
    Math.floor(PROPERTY_REEL_DURATION_FRAMES / slides.length),
  );

  const mainContentEnd = PROPERTY_REEL_DURATION_FRAMES - PROPERTY_REEL_END_SCREEN_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {slides.map((src, index) => (
        <Sequence
          key={`${src || "placeholder"}-${index}`}
          from={index * slideDuration}
          durationInFrames={
            index === slides.length - 1
              ? PROPERTY_REEL_DURATION_FRAMES - index * slideDuration
              : slideDuration
          }
        >
          {src ? (
            <PhotoSlide
              src={src}
              durationInFrames={
                index === slides.length - 1
                  ? PROPERTY_REEL_DURATION_FRAMES - index * slideDuration
                  : slideDuration
              }
            />
          ) : (
            <PlaceholderSlide />
          )}
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={mainContentEnd}>
        <ReelTextOverlay
          price={price}
          size={size}
          location={location}
          rooms={rooms}
          propertyType={propertyType}
          headline={headline}
          brandColor={accent}
        />
        {agencyLogoUrl ? <AgencyLogoWatermark src={agencyLogoUrl} /> : null}
      </Sequence>

      <ReelProgressBar brandColor={accent} />

      <Sequence
        from={mainContentEnd}
        durationInFrames={PROPERTY_REEL_END_SCREEN_FRAMES}
      >
        <EndScreen
          agencyLogoUrl={agencyLogoUrl}
          brandColor={accent}
          brokerContact={brokerContact}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
