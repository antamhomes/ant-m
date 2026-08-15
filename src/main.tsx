import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { initAnalytics } from "./lib/analytics";
import "./index.css";

initAnalytics();

// Brand splash (see index.html): stays at least SPLASH_MIN_MS, hides as soon as
// the hero image has rendered, and never later than SPLASH_MAX_MS.
const SPLASH_MIN_MS = 750;
const SPLASH_MAX_MS = 2500;
const HERO_READY_EVENT = "antam:hero-ready";

const splashShownAt = performance.now();
let splashDismissed = false;

const dismissSplash = () => {
  if (splashDismissed) return;
  splashDismissed = true;
  const splash = document.getElementById("brand-splash");
  if (!splash) return;
  const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - splashShownAt));
  window.setTimeout(() => {
    splash.classList.add("is-leaving");
    window.setTimeout(() => splash.remove(), 500);
  }, wait);
};

window.addEventListener(HERO_READY_EVENT, dismissSplash, { once: true });
window.setTimeout(dismissSplash, SPLASH_MAX_MS);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
