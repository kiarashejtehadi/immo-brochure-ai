import type {
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
  base64: string;
};

export type OpenImmoImportResult = {
  title?: string;
  transactionType?: TransactionType;
  address?: Partial<ListingAddress>;
  size?: string;
  rooms?: string;
  property?: Partial<PropertyDetails>;
  rent?: Partial<RentFormData>;
  sale?: Partial<SaleFormData>;
  energy?: Partial<EnergyFormData>;
  description?: string;
  locationText?: string;
  images?: OpenImmoImportedImage[];
};

export type OpenImmoImportApiResponse = {
  ok: boolean;
  data: OpenImmoImportResult[];
  count: number;
  error?: string;
};
