import { rentFor, type LocationKey, type SizeKey } from "@/lib/yield";
import { annuity } from "@/lib/lease";

/**
 * NABÍDKA STÁVAJÍCÍMU MAJITELI (5. 11. 2026). Prodejní vrstva NAD
 * underwritingem: bere hotový strop nájmu (lib/underwrite → maxRent) a
 * porovná ho s tím, co majitel dnes má: běžný nájem a jeho skutečná splátka.
 * Hypotéka do stropu NIKDY nevstupuje; sem se jen opisuje. Když majitel zná
 * svou skutečnou splátku, platí ta; dopočet z jistiny je jen náhrada.
 */
export type OwnerInput = {
  antamRent: number;                 // strop z underwritingu, nebo dohodnutý nájem pod ním
  loc: LocationKey; size: SizeKey; m2: number; ctvrt: string | null;
  balance?: number | null;           // zůstatek hypotéky
  ratePct?: number | null;           // sazba % p. a.
  remainingYears?: number | null;    // zbývající splatnost
  actualPayment?: number | null;     // skutečná měsíční splátka; když je, přebíjí dopočet
  purchasePrice?: number | null; purchaseYear?: number | null; // jen informace
};

export type OwnerOffer = {
  antamRent: number;
  ltr: number;                       // běžný nájem, zařízený, Sreality model
  diff: number; diffPct: number;     // Antam − LTR
  payment: number | null;            // skutečná, nebo dopočtená
  paymentSource: "actual" | "computed" | null;
  coveragePct: number | null;        // Antam / splátka
  annualDiff: number;                // (Antam − LTR) × 12
  monthlyAfterMortgage: number | null; // Antam − splátka
};

export const ownerOffer = (i: OwnerInput): OwnerOffer => {
  const ltr = rentFor(i.loc, i.size, i.m2, "furnished", i.ctvrt);
  const diff = i.antamRent - ltr;
  let payment: number | null = null; let paymentSource: OwnerOffer["paymentSource"] = null;
  if (i.actualPayment && i.actualPayment > 0) { payment = Math.round(i.actualPayment); paymentSource = "actual"; }
  else if (i.balance && i.balance > 0 && i.ratePct && i.ratePct > 0 && i.remainingYears && i.remainingYears > 0) {
    payment = Math.round(annuity(i.balance, i.ratePct / 100, i.remainingYears)); paymentSource = "computed";
  }
  return {
    antamRent: i.antamRent, ltr, diff, diffPct: Math.round((diff / ltr) * 1000) / 10,
    payment, paymentSource,
    coveragePct: payment ? Math.round((i.antamRent / payment) * 100) : null,
    annualDiff: diff * 12,
    monthlyAfterMortgage: payment ? i.antamRent - payment : null,
  };
};
