import type { UiLocale } from "@/lib/i18n";
import type {
  GenerateResult,
  ListingAddress,
  PropertyDetails,
  RentFormData,
} from "@/types/listing";

export const DEMO_PHOTO_URLS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2cd9361?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1080&q=80",
] as const;

export type DemoListingContent = {
  address: ListingAddress;
  size: string;
  rooms: string;
  property: PropertyDetails;
  rent: RentFormData;
  result: GenerateResult;
};

const en: DemoListingContent = {
  address: {
    streetAddress: "Herneweg",
    houseNumber: "12",
    unitNumber: "",
    postalCode: "10115",
    city: "Berlin",
    country: "Germany",
    hideExactHouseNumber: false,
  },
  size: "67",
  rooms: "2",
  property: {
    propertyType: "apartment",
    floorLevel: "3rd floor",
    parking: "underground",
    parkingFee: "",
    condition: "modernized",
    furnishingStatus: "fully_furnished",
    isStagedOrModel: false,
  },
  rent: {
    netColdRent: "1800",
    utilityCharges: "200",
    totalRent: "2000",
    securityDeposit: "4000",
    availableFrom: "Immediately",
    minimumLeaseTerm: "12 months",
    petPolicy: "By arrangement",
  },
  result: {
    title: "Stylish 2-Bedroom Apartment with Modern Amenities in Herneweg",
    summary: [
      "Bright open-plan living with floor-to-ceiling windows",
      "Designer fitted kitchen with integrated appliances",
      "Underground parking space included",
      "Quiet residential street near Mitte",
      "Energy-efficient building with modern heating",
    ],
    fullDescription:
      "This beautifully presented two-bedroom apartment offers contemporary city living in one of Berlin's most sought-after neighborhoods. The open living area is filled with natural light from expansive windows, highlighting the warm oak flooring and clean architectural lines throughout.\n\nThe fully equipped kitchen features stone countertops, integrated Siemens appliances, and ample storage — ideal for everyday cooking and entertaining. Both bedrooms are well proportioned, with the primary suite offering built-in wardrobes and a calm courtyard outlook.\n\nA private underground parking space is included. The building was comprehensively modernized in 2021 with efficient heating and excellent insulation. Available immediately for long-term tenants seeking quality, comfort, and connectivity.",
    locationDescription:
      "Herneweg sits in a peaceful pocket of Berlin-Mitte, within walking distance of cafés, organic markets, and the U8 metro line. Families appreciate the nearby parks and cycle paths, while professionals enjoy a 12-minute commute to Friedrichstraße. Schools, fitness studios, and weekend farmers' markets round out this highly livable neighborhood.",
    socialCaptions: {
      instagram:
        "Modern 2-bed city living in Herneweg ✨ Light-filled rooms, designer kitchen & underground parking. €2,000/month — DM for a viewing! #RealEstate #BerlinApartment #CityLiving",
      linkedin:
        "New rental listing: A stylish 2-bedroom apartment in Berlin-Mitte (Herneweg). Features include an open living concept, fitted kitchen, underground parking, and immediate availability. Ideal for professionals seeking premium urban living at €2,000/month.",
      facebook:
        "Just listed: Bright 2-bedroom apartment on Herneweg — modern kitchen, great light, and parking included. €2,000/month. Message us to schedule a viewing!",
    },
  },
};

const de: DemoListingContent = {
  ...en,
  result: {
    ...en.result,
    title: "Stilvolle 2-Zimmer-Wohnung mit modernem Komfort in Herneweg",
    summary: [
      "Helle Wohnküche mit bodentiefen Fenstern",
      "Designerküche mit Einbaugeräten",
      "Tiefgaragenstellplatz inklusive",
      "Ruhige Wohnlage nahe Mitte",
      "Energieeffizientes modernisiertes Gebäude",
    ],
    fullDescription:
      "Diese stilvoll ausgestattete Zwei-Zimmer-Wohnung bietet zeitgemäßes Wohnen in einer der gefragtesten Lagen Berlins. Der offene Wohnbereich wird durch große Fenster natürlich belichtet und betont den warmen Eichenboden sowie die klaren architektonischen Linien.\n\nDie Einbauküche verfügt über Steinplatten, integrierte Siemens-Geräte und viel Stauraum. Beide Schlafzimmer sind gut geschnitten; das Hauptschlafzimmer bietet Einbauschränke und Blick auf den Innenhof.\n\nEin Tiefgaragenstellplatz ist inklusive. Das Gebäude wurde 2021 umfassend modernisiert. Sofort bezugsfrei.",
    locationDescription:
      "Die Herneweg liegt ruhig in Berlin-Mitte, fußläufig zu Cafés, Bio-Märkten und der U8. Parks und Radwege liegen in der Nähe; Friedrichstraße ist in 12 Minuten erreichbar.",
    socialCaptions: {
      instagram:
        "Modernes 2-Zimmer-Stadtleben an der Herneweg ✨ Helle Räume, Designerküche & Tiefgarage. 2.000 €/Monat — DM für Besichtigung! #Immobilien #Berlin #Wohnung",
      linkedin:
        "Neues Mietangebot: Stilvolle 2-Zimmer-Wohnung in Berlin-Mitte (Herneweg) mit offenem Wohnkonzept, Einbauküche und Stellplatz. 2.000 €/Monat.",
      facebook:
        "Frisch eingestellt: Helle 2-Zimmer-Wohnung an der Herneweg — moderne Küche, viel Licht, Stellplatz inkl. 2.000 €/Monat.",
    },
  },
};

const fr: DemoListingContent = {
  ...en,
  result: {
    ...en.result,
    title: "Appartement 2 pièces élégant avec prestations modernes — Herneweg",
    summary: [
      "Séjour lumineux avec grandes baies vitrées",
      "Cuisine équipée haut de gamme",
      "Place de parking souterrain incluse",
      "Rue calme près de Mitte",
      "Immeuble rénové et économe en énergie",
    ],
    fullDescription:
      "Ce deux-pièces soigneusement aménagé offre un cadre de vie contemporain dans l'un des quartiers les plus recherchés de Berlin. La pièce de vie ouverte est baignée de lumière naturelle, mettant en valeur le parquet en chêne et les lignes épurées.\n\nLa cuisine équipée comprend un plan en pierre, des appareils Siemens intégrés et de nombreux rangements. Les deux chambres sont bien proportionnées ; la suite principale dispose de placards intégrés.\n\nUne place de parking souterrain est incluse. Disponible immédiatement.",
    locationDescription:
      "Herneweg se situe dans un quartier paisible de Berlin-Mitte, à proximité des cafés, marchés bio et de la ligne U8. Parcs et pistes cyclables à proximité.",
    socialCaptions: {
      instagram:
        "Vie citadine 2 pièces à Herneweg ✨ Luminosité, cuisine design & parking. 2 000 €/mois — DM pour visite ! #Immobilier #Berlin",
      linkedin:
        "Nouvelle location : appartement 2 pièces à Berlin-Mitte (Herneweg), cuisine équipée et parking. 2 000 €/mois.",
      facebook:
        "À louer : lumineux 2 pièces Herneweg — cuisine moderne, parking inclus. 2 000 €/mois.",
    },
  },
};


const byLocale: Partial<Record<UiLocale, DemoListingContent>> = { de, fr };

export function getDemoListingContent(locale: UiLocale): DemoListingContent {
  return byLocale[locale] ?? en;
}

export async function fetchDemoPhotos(): Promise<
  { id: string; file: File; url: string }[]
> {
  return Promise.all(
    DEMO_PHOTO_URLS.map(async (photoUrl, index) => {
      const res = await fetch(photoUrl);
      if (!res.ok) throw new Error("Failed to load demo photo");
      const blob = await res.blob();
      const file = new File([blob], `demo-${index + 1}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      return {
        id: `demo-${index}`,
        file,
        url: URL.createObjectURL(blob),
      };
    }),
  );
}
