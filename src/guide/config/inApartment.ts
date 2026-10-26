import remote from "../assets/remote.jpg.asset.json";
import type { ApartmentId, GuidePhoto, Hotspot } from "../types";
import type { GuideStrings } from "../i18n";
import type { LucideIcon } from "lucide-react";
import {
  Wifi,
  Lightbulb,
  Zap,
  Thermometer,
  ChefHat,
  Trash2,
  ScrollText,
  LogOut,
} from "lucide-react";

/**
 * Obsah sekce „V bytě“. Data jsou per byt — zatím placeholdery, doplní se
 * reálné údaje (Wi-Fi jméno/heslo, popisy spotřebičů…). Fotky stejně jako
 * u kroků: src null = šedý placeholder „FOTO – doplníme“.
 */

export type TileId =
  | "wifi"
  | "lights"
  | "breakers"
  | "heating"
  | "kitchen"
  | "waste"
  | "rules"
  | "checkout";

export interface ApartmentTileData {
  wifiName?: string;
  wifiPassword?: string;
  /** Volitelné přepsání textu dlaždice pro konkrétní byt. */
  bodyOverride?: Partial<Record<TileId, string[]>>;
  /** Volitelné fotky pro dlaždice (jinak placeholder). */
  photos?: Partial<Record<TileId, GuidePhoto[]>>;
}

export const APARTMENT_TILE_DATA: Record<ApartmentId, ApartmentTileData> = {
  b01: { wifiName: "[TEXT]", wifiPassword: "[TEXT]" },
  b02: { wifiName: "[TEXT]", wifiPassword: "[TEXT]" },
  b03: { wifiName: "[TEXT]", wifiPassword: "[TEXT]" },
  b04: { wifiName: "[TEXT]", wifiPassword: "[TEXT]" },
  b05: { wifiName: "[TEXT]", wifiPassword: "[TEXT]" },
};

export interface InApartmentTile {
  id: TileId;
  icon: LucideIcon;
  title: string;
  body: string[];
  photos: GuidePhoto[];
  wifi?: { name: string; password: string };
}

export const buildTiles = (
  t: GuideStrings,
  apartmentId: ApartmentId,
): InApartmentTile[] => {
  const data = APARTMENT_TILE_DATA[apartmentId];
  const tt = t.inApartment.tiles;
  const defs: Array<{ id: TileId; icon: LucideIcon }> = [
    { id: "wifi", icon: Wifi },
    { id: "lights", icon: Lightbulb },
    { id: "breakers", icon: Zap },
    { id: "heating", icon: Thermometer },
    { id: "kitchen", icon: ChefHat },
    { id: "waste", icon: Trash2 },
    { id: "rules", icon: ScrollText },
    { id: "checkout", icon: LogOut },
  ];
  return defs.map(({ id, icon }) => {
    const tile = tt[id];
    const photos: GuidePhoto[] =
      data.photos?.[id] ??
      // Odpad: fotka 3 (výklenek za brankou) s hotspotem na popelnici.
      (id === "waste"
        ? [
            {
              src: remote.url,
              alt: "Výklenek s popelnicí",
              hotspots: [{ x: 50, y: 78, label: tt.waste.hotspots.bin } satisfies Hotspot],
            },
          ]
        : [{ src: null, alt: tile.title }]);
    return {
      id,
      icon,
      title: tile.title,
      body: data.bodyOverride?.[id] ?? tile.body,
      photos,
      wifi:
        id === "wifi"
          ? { name: data.wifiName ?? "[TEXT]", password: data.wifiPassword ?? "[TEXT]" }
          : undefined,
    };
  });
};
