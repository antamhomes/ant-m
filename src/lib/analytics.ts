/**
 * Google Analytics 4 with Consent Mode v2.
 *
 * - Nothing is loaded and no cookie is set until the visitor accepts in the
 *   cookie banner (see components/CookieConsent.tsx).
 * - Set the "G-XXXXXXXXXX" ID from GA4 → Admin → Data streams either here or
 *   as VITE_GA_MEASUREMENT_ID in the build environment (Lovable env). While
 *   it is empty, analytics (and the banner) are disabled and every
 *   trackEvent call is a no-op: the funnel events below exist in the code
 *   but nothing is measured until the ID is set.
 *
 * Funnel events (docs/funnel-spec-2026-09-07.md §8), all fired from the
 * components, names kept in one place so GA4 reports and the code agree:
 *   calc_start     first change of any calculator input
 *   calc_location  district / čtvrť chosen            {district, ctvrt}
 *   calc_result    result changed (debounced 500 ms)  {district, ctvrt, size, bucket, season, band, derived, ratio_rounded, model_version}
 *   cta_click      existing, now with {band}
 *   form_start     first focus inside the contact form {from_calc, band}
 *   lead_submit    successful send                     {form, status, band, ratio_rounded, district, ctvrt, size, units, from_calc}
 *   lead_error     send failed                         {band}
 *   calc_share     existing, now with {band}
 * `band` is the internal qualification (lib/leadBand.ts), never shown to the visitor.
 */
export const GA_MEASUREMENT_ID: string =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim() || "";

/**
 * Google Ads (18. 11. 2026). Dokud je VITE_GOOGLE_ADS_ID prázdné, nic se nemění:
 * souhlas povoluje jen analytiku a banner dál říká „žádná reklama“.
 *   VITE_GOOGLE_ADS_ID          „AW-XXXXXXXXXX“ z Google Ads → Cíle → Konverze → značka Google
 *   VITE_GOOGLE_ADS_LEAD_LABEL  štítek konverze „Odeslaný formulář“ (část za lomítkem)
 * S ID se po souhlasu povolí i reklamní úložiště (Consent Mode v2) a odeslaný
 * formulář se pošle jako konverze. Bez souhlasu se nenačte nic.
 */
export const ADS_ID: string = (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim() || "";
const ADS_LEAD_LABEL: string = (import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL as string | undefined)?.trim() || "";
export const adsEnabled = () => ADS_ID.length > 0;

const CONSENT_KEY = "antam-cookie-consent"; // "granted" | "denied"

type ConsentState = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const analyticsEnabled = () => GA_MEASUREMENT_ID.length > 0 || adsEnabled();

export const getStoredConsent = (): ConsentState | null => {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

const ensureGtag = () => {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  }
};

let scriptLoaded = false;

const loadGaScript = () => {
  if (scriptLoaded || !analyticsEnabled()) return;
  scriptLoaded = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID || ADS_ID}`;
  document.head.appendChild(s);
  window.gtag("js", new Date());
  if (GA_MEASUREMENT_ID) window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  if (ADS_ID) window.gtag("config", ADS_ID);
};

/** Co souhlas povoluje: analytiku vždy, reklamní úložiště jen když Ads běží. */
const consentUpdate = (state: ConsentState) => ({
  analytics_storage: state,
  ...(adsEnabled() ? { ad_storage: state, ad_user_data: state, ad_personalization: state } : {}),
});

/** Call once on app start. Sets Consent Mode defaults and honours a stored choice. */
export const initAnalytics = () => {
  if (!analyticsEnabled()) return;
  ensureGtag();
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
  if (getStoredConsent() === "granted") {
    window.gtag("consent", "update", consentUpdate("granted"));
    loadGaScript();
  }
};

/** Persist the visitor's choice and (if granted) start GA. */
export const setConsent = (state: ConsentState) => {
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
  } catch {
    /* private mode etc. — ignore */
  }
  if (!analyticsEnabled()) return;
  ensureGtag();
  window.gtag("consent", "update", consentUpdate(state));
  if (state === "granted") loadGaScript();
};

/** Fire a GA4 event. Safe to call anytime — no-op if GA isn't running. */
export const trackEvent = (name: string, params: Record<string, string | number | boolean> = {}) => {
  if (!analyticsEnabled() || !scriptLoaded || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
};

/**
 * Konverze pro Google Ads: úspěšně odeslaný formulář. Volá se vedle
 * trackEvent("lead_submit"). Bez ID, štítku nebo souhlasu nedělá nic.
 */
export const trackLeadConversion = () => {
  if (!adsEnabled() || !ADS_LEAD_LABEL || !scriptLoaded || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: `${ADS_ID}/${ADS_LEAD_LABEL}` });
};
