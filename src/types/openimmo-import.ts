import type { FeatureKey } from "@/lib/i18n";
import type {
  AgentFormData,
  EnergyFormData,
  ListingAddress,
  PropertyDetails,
  RentFormData,
  SaleFormData,
  TransactionType,
} from "@/types/listing";

export type OpenImmoImportedImage = {
  filename: string;
  mimeType: string;
  base64?: string;
  url?: string;
  path?: string;
};

export type OpenImmoImportResult = {
  importIndex?: number;
  importId?: string;
  title?: string;
  transactionType?: TransactionType;
  address?: Partial<ListingAddress>;
  size?: string;
  rooms?: string;
  property?: Partial<PropertyDetails>;
  rent?: Partial<RentFormData>;
  sale?: Partial<SaleFormData>;
  energy?: Partial<EnergyFormData>;
  features?: FeatureKey[];
  agent?: Partial<AgentFormData>;
  description?: string;
  locationText?: string;
  images?: OpenImmoImportedImage[];
  imageUrls?: string[];
};

export type OpenImmoImportApiResponse = {
  ok: boolean;
  data: OpenImmoImportResult[];
  count: number;
  error?: string;
};
