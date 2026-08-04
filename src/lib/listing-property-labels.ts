import type { FormCopy } from "@/lib/i18n-form";
import type {
  EnergyCertificateType,
  HeatingSource,
  PropertyCondition,
  PropertyDetails,
  PropertyType,
  ParkingType,
} from "@/types/listing";

export function propertyTypeLabel(type: PropertyType, copy: FormCopy): string {
  const map: Record<PropertyType, string> = {
    apartment: copy.propertyTypeApartment,
    house: copy.propertyTypeHouse,
    penthouse: copy.propertyTypePenthouse,
    commercial: copy.propertyTypeCommercial,
    land: copy.propertyTypeLand,
  };
  return map[type];
}

export function parkingLabel(type: ParkingType, copy: FormCopy): string {
  const map: Record<ParkingType, string> = {
    none: copy.parkingNone,
    outdoor: copy.parkingOutdoor,
    garage: copy.parkingGarage,
    underground: copy.parkingUnderground,
  };
  return map[type];
}

export function certificateTypeLabel(
  type: EnergyCertificateType,
  copy: FormCopy,
): string {
  const map: Record<EnergyCertificateType, string> = {
    consumption: copy.certConsumption,
    demand: copy.certDemand,
    na: copy.certNa,
  };
  return map[type];
}

export function heatingSourceLabel(
  source: HeatingSource | "",
  copy: FormCopy,
): string {
  if (!source) return "";
  const map: Record<HeatingSource, string> = {
    heat_pump: copy.heatPump,
    district_heating: copy.districtHeating,
    gas: copy.gas,
    oil: copy.oil,
    electricity: copy.electricity,
    solar: copy.solar,
    wood_pellets: copy.woodPellets,
  };
  return map[source];
}

export function conditionLabel(value: PropertyCondition, copy: FormCopy): string {
  const map: Record<PropertyCondition, string> = {
    first_occupancy: copy.conditionFirstOccupancy,
    modernized: copy.conditionModernized,
    well_maintained: copy.conditionWellMaintained,
    needs_renovation: copy.conditionNeedsRenovation,
  };
  return map[value];
}

export function propertyOverviewRows(
  property: PropertyDetails,
  form: FormCopy,
  currency: string,
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (property.propertyType) {
    rows.push({
      label: form.propertyType,
      value: propertyTypeLabel(property.propertyType, form),
    });
  }
  if (property.floorLevel.trim()) {
    rows.push({ label: form.floorLevel, value: property.floorLevel.trim() });
  }
  if (property.parking) {
    rows.push({
      label: form.parking,
      value: parkingLabel(property.parking, form),
    });
  }
  if (property.parkingFee.trim()) {
    rows.push({
      label: `${form.parkingFee} (${currency})`,
      value: property.parkingFee.trim(),
    });
  }
  if (property.condition) {
    rows.push({
      label: form.condition,
      value: conditionLabel(property.condition, form),
    });
  }
  return rows;
}
