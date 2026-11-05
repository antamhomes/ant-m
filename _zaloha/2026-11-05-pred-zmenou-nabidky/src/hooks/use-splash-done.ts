import { useEffect, useState } from "react";

export const SPLASH_DONE_EVENT = "antam:splash-done";

/**
 * True once the brand splash (index.html) has started fading out — or
 * immediately if there is no splash (e.g. client-side navigation).
 * Use it to hold entrance animations so they play *after* the splash, not underneath it.
 */
export const useSplashDone = () => {
  const [done, setDone] = useState(() =>
    typeof document === "undefined" ? true : !document.getElementById("brand-splash")
  );

  useEffect(() => {
    if (done) return;
    if (!document.getElementById("brand-splash")) {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener(SPLASH_DONE_EVENT, onDone, { once: true });
    return () => window.removeEventListener(SPLASH_DONE_EVENT, onDone);
  }, [done]);

  return done;
};
