import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initAnalytics } from "./lib/analytics";
import "./index.css";

initAnalytics();

// Brand splash (see index.html): stays at least SPLASH_MIN_MS, hides as soon as
// the hero image has rendered, and never later than SPLASH_MAX_MS.
const SPLASH_MIN_MS = 650;
const SPLASH_MAX_MS = 1800;
const SPLASH_FADE_MS = 600;
const HERO_READY_EVENT = "antam:hero-ready";
const SPLASH_DONE_EVENT = "antam:splash-done";

const splashShownAt = performance.now();
let splashDismissed = false;

const dismissSplash = () => {
  if (splashDismissed) return;
  splashDismissed = true;
  const splash = document.getElementById("brand-splash");
  if (!splash) {
    window.dispatchEvent(new Event(SPLASH_DONE_EVENT));
    return;
  }
  const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - splashShownAt));
  window.setTimeout(() => {
    splash.classList.add("is-leaving");
    // Let the page's own entrance animations start as the curtain lifts.
    window.dispatchEvent(new Event(SPLASH_DONE_EVENT));
    window.setTimeout(() => splash.remove(), SPLASH_FADE_MS);
  }, wait);
};

window.addEventListener(HERO_READY_EVENT, dismissSplash, { once: true });
window.setTimeout(dismissSplash, SPLASH_MAX_MS);

createRoot(document.getElementById("root")!).render(<App />);
