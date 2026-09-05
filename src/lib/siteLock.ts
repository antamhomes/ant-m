/**
 * Dočasná závora před spuštěním webu.
 *
 * Zapnuto: celý web (/, /vn i 404) se schová za heslo, prerender nevkládá obsah
 * ani JSON-LD a do <head> jde noindex. Odemknutí platí do zavření prohlížeče
 * (sessionStorage).
 *
 * Vypnutí při launchi: SITE_LOCK_ENABLED = false, commit, Lovable přebuildí.
 *
 * Je to závora, ne trezor: hosting je statický, takže překlady zůstávají
 * v JS bundlu a hash hesla je v kódu. Zastaví návštěvníky a roboty, ne vývojáře.
 */
export const SITE_LOCK_ENABLED = true;

/** SHA-256 hex hesla. */
export const SITE_LOCK_HASH = "3288e7ad839118c425a4f74d77f2f03b243c09b0631e5cb5f6fa0db50f57df97";

const STORAGE_KEY = "antam:site-unlocked";

export const isUnlocked = (): boolean => {
  if (!SITE_LOCK_ENABLED) return true;
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const markUnlocked = (): void => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode apod.: odemknutí vydrží jen do reloadu */
  }
};

export const sha256Hex = async (input: string): Promise<string> => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
};
