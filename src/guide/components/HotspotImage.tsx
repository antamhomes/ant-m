import { useState } from "react";
import { Camera } from "lucide-react";
import type { GuidePhoto } from "../types";

/**
 * Fotka kroku s interaktivními hotspoty (pulzující zlatý bod, po ťuknutí
 * krátký popisek). Bez fotky (src null) šedý placeholder „FOTO – doplníme“,
 * hotspoty se zobrazují i na něm, aby šly doladit před dodáním fotek.
 */
interface Props {
  photo: GuidePhoto;
  photoMissingLabel: string;
  eager?: boolean;
}

const HotspotImage = ({ photo, photoMissingLabel, eager = false }: Props) => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-soft aspect-[4/3]">
      {photo.src ? (
        <img
          src={photo.src}
          alt={photo.alt}
          loading={eager ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground">
          <Camera className="h-8 w-8" aria-hidden />
          <span className="text-sm font-medium tracking-wide">{photoMissingLabel}</span>
        </div>
      )}

      {photo.hotspots?.map((h, i) => (
        <div key={i} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
          <button
            type="button"
            aria-label={h.label}
            onClick={() => setActive(active === i ? null : i)}
            className="relative -ml-4 -mt-4 flex h-8 w-8 items-center justify-center"
          >
            <span className="absolute inline-flex h-6 w-6 rounded-full bg-gold opacity-60 animate-ping" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-gold ring-2 ring-white/90 shadow-gold" />
          </button>
          {active === i && (
            <div className="absolute left-1/2 top-4 z-10 w-max max-w-[180px] -translate-x-1/2 rounded-lg bg-charcoal px-3 py-2 text-center text-xs font-medium text-white shadow-elegant">
              {h.label}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HotspotImage;
