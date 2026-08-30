/**
 * Google Analytics 4 with Consent Mode v2.
 *
 * - Nothing is loaded and no cookie is set until the visitor accepts in the
 *   cookie banner (see components/CookieConsent.tsx).
 * - Set GA_MEASUREMENT_ID to your "G-XXXXXXXXXX" ID from GA4 → Admin → Data
 *   streams. While it is empty, analytics (and the banner) are disabled.
 */
export const GA_MEASUREMENT_ID = "";

const CONSENT_KEY = "antam-cookie-consent"; // "granted" | "denied"

type ConsentState = "granted" | "denied";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const analyticsEnabled = () => GA_MEASUREMENT_ID.length > 0;

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
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
};

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
    window.gtag("consent", "update", { analytics_storage: "granted" });
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
  window.gtag("consent", "update", { analytics_storage: state });
  if (state === "granted") loadGaScript();
};

/** Fire a GA4 event. Safe to call anytime — no-op if GA isn't running. */
export const trackEvent = (name: string, params: Record<string, string | number | boolean> = {}) => {
  if (!analyticsEnabled() || !scriptLoaded || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
};
