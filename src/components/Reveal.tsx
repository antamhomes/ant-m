import { createElement, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

/**
 * One calm reveal for the whole page, in ~1 kB instead of a motion library:
 * the element starts slightly lower and transparent (see `[data-reveal]` in
 * index.css) and transitions in the first time it enters the viewport.
 *
 * - IntersectionObserver missing (very old WebView)? Everything is simply visible.
 * - prefers-reduced-motion? CSS shows the element without movement.
 * - `delay` is seconds, `stagger(i)` for grids (capped so a long list never
 *   keeps the reader waiting).
 */
type Props = HTMLAttributes<HTMLElement> & {
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  children?: ReactNode;
};

let observer: IntersectionObserver | null = null;
const getObserver = () => {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          observer?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
  );
  return observer;
};

const Reveal = ({ as = "div", delay = 0, style, children, ...rest }: Props) => {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return;
    }
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return createElement(
    as,
    {
      ref,
      "data-reveal": "",
      style: delay ? { ...style, transitionDelay: `${delay}s` } : style,
      ...rest,
    },
    children
  );
};

export const stagger = (index: number, step = 0.06, max = 0.3) => Math.min(index * step, max);

export default Reveal;
