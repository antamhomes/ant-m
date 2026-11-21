import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

export const NEW_WEBSITE_URL = "https://antamhomes.cz/";
export const ANNOUNCEMENT_SESSION_KEY = "antam:new-website-dismissed";

function wasDismissed() {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(ANNOUNCEMENT_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Global, session-only announcement; native dialog supplies focus trapping and Escape. */
export default function NewWebsiteAnnouncement() {
  const [dismissed, setDismissed] = useState(wasDismissed);
  const dialog = useRef<HTMLDialogElement>(null);
  const banner = useRef<HTMLElement>(null);
  const bannerLink = useRef<HTMLAnchorElement>(null);

  function dismiss() {
    try {
      sessionStorage.setItem(ANNOUNCEMENT_SESSION_KEY, "1");
    } catch {
      // Keep the in-memory choice when browser storage is unavailable.
    }
    dialog.current?.close();
    setDismissed(true);
  }

  useLayoutEffect(() => {
    if (dismissed) return;
    const node = dialog.current;
    if (!node) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [dismissed]);

  useLayoutEffect(() => {
    if (!dismissed || !banner.current) return;
    const root = document.documentElement;
    const node = banner.current;
    const update = () => root.style.setProperty("--website-announcement-height", `${node.getBoundingClientRect().height + 16}px`);
    root.classList.add("website-announcement-active");
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    bannerLink.current?.focus({ preventScroll: true });
    return () => {
      observer.disconnect();
      root.classList.remove("website-announcement-active");
      root.style.removeProperty("--website-announcement-height");
    };
  }, [dismissed]);

  if (dismissed) {
    return (
      <aside ref={banner} lang="en" aria-label="New Antam Homes website" className="website-announcement-banner border border-primary-foreground/20 bg-primary text-primary-foreground">
        <div className="min-w-0">
          <p className="website-announcement-banner-title font-medium">New Website — Antam Homes</p>
          <p className="website-announcement-banner-description text-primary-foreground/80">Our new website is now live. Discover it here.</p>
        </div>
        <a ref={bannerLink} href={NEW_WEBSITE_URL} className="website-announcement-link shrink-0 bg-background text-primary hover:bg-secondary">
          Visit Our New Website <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      </aside>
    );
  }

  return (
    <dialog ref={dialog} lang="en" aria-labelledby="new-website-title" aria-describedby="new-website-description" className="website-announcement-dialog border border-border bg-background text-foreground" onCancel={(event) => { event.preventDefault(); dismiss(); }}>
      <button type="button" aria-label="Close announcement" title="Close announcement" className="website-announcement-close text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={dismiss}>
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      <p className="mb-6 text-sm font-medium uppercase text-gold-deep">Antam Homes · A new chapter</p>
      <h2 id="new-website-title" className="website-announcement-title font-display text-primary">We've Moved to Our New Website</h2>
      <p id="new-website-description" className="mt-6 text-base text-muted-foreground">Discover the new Antam Homes website for an improved experience. Visit us at our new online home.</p>
      <p className="mt-3 text-sm font-medium text-primary">antamhomes.cz</p>
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-center">
        <a autoFocus href={NEW_WEBSITE_URL} className="website-announcement-link bg-primary text-primary-foreground hover:bg-charcoal-light">
          Explore Our New Website <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </a>
        <button type="button" onClick={dismiss} className="min-h-12 rounded-sm px-4 py-3 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary">Stay on the Current Website</button>
      </div>
    </dialog>
  );
}