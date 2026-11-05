/**
 * Registry jazyků průvodce. Nový jazyk = nový soubor vedle cs.ts + řádek níže.
 * Přepínač v hlavičce se sestavuje z tohoto seznamu.
 */
import cs, { type GuideStrings } from "./cs";

export type { GuideStrings };

export type GuideLang = "cs";

export const GUIDE_LANGS: Record<GuideLang, GuideStrings> = { cs };

export const DEFAULT_GUIDE_LANG: GuideLang = "cs";
