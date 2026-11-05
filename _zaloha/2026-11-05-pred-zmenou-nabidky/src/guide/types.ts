/** Sdílené typy průvodce příjezdem. */

export type ApartmentId = "b01" | "b02" | "b03" | "b04" | "b05";

export type ArrivalMode = "car" | "foot";

/** Interaktivní bod na fotce; pozice v procentech (0–100) vůči rozměrům fotky. */
export interface Hotspot {
  x: number;
  y: number;
  label: string;
}

/** Fotka kroku; src null = zatím nemáme fotku, ukáže se šedý placeholder. */
export interface GuidePhoto {
  src: string | null;
  alt: string;
  hotspots?: Hotspot[];
}

export interface GuideStep {
  id: string;
  title: string;
  /** 1–3 krátké věty; prázdný řetězec se nezobrazí. */
  body: string[];
  /** Viditelný placeholder "[TEXT – doplníme]" na místě, kde text chybí. */
  textMissing?: boolean;
  photos: GuidePhoto[];
  /** Zobrazit tlačítko „Navigovat“ na adresu domu. */
  showNavigate?: boolean;
  /** Zobrazit schematický plánek pozemku s trasou k vybranému bytu. */
  showSitePlan?: boolean;
  /** Krok se ukazuje jen při příjezdu autem. */
  carOnly?: boolean;
}
