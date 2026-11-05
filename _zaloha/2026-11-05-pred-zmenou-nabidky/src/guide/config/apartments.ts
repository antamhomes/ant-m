import type { ApartmentId } from "../types";

export interface Apartment {
  id: ApartmentId;
  /** Označení na schránce i na dveřích. */
  label: string;
  /** Vodorovná pozice schránky tohoto bytu na fotce kroku „Klíče“ (v % zleva). */
  lockboxX: number;
  /** B01–B03 vcházejí hlavním vchodem domu, B04–B05 mají vlastní vchod zvenku. */
  entrance: "main" | "own";
}

/**
 * Pozice lockboxX ladíme podle reálné fotky sloupku se schránkami
 * (zleva B01, B02, B03, B04, B05).
 */
export const APARTMENTS: Apartment[] = [
  { id: "b01", label: "B01", lockboxX: 17, entrance: "main" },
  { id: "b02", label: "B02", lockboxX: 34, entrance: "main" },
  { id: "b03", label: "B03", lockboxX: 51, entrance: "main" },
  { id: "b04", label: "B04", lockboxX: 68, entrance: "own" },
  { id: "b05", label: "B05", lockboxX: 84, entrance: "own" },
];

export const getApartment = (id: string | undefined): Apartment | undefined =>
  APARTMENTS.find((a) => a.id === id?.toLowerCase());

/** Adresa domu pro krok „Najděte dům“ a tlačítko Navigovat. */
export const ADDRESS = "Dobronická 282/18, Praha 4 – Libuš";
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Dobronická 282/18, Praha 4");
