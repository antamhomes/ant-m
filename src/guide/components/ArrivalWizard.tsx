import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Car, Footprints, Navigation, PartyPopper } from "lucide-react";
import type { Apartment } from "../config/apartments";
import { MAPS_URL } from "../config/apartments";
import { buildSteps } from "../config/steps";
import type { GuideStrings } from "../i18n";
import type { ArrivalMode } from "../types";
import HotspotImage from "./HotspotImage";
import SitePlan from "./SitePlan";

/** Řetězec "[TEXT]" v datech vykreslíme jako viditelný placeholder k doplnění. */
const Body = ({ lines, missing }: { lines: string[]; missing: string }) => (
  <div className="space-y-2">
    {lines.map((line, i) =>
      line === "[TEXT]" ? (
        <p key={i} className="rounded-lg border border-dashed border-gold bg-gold/10 px-3 py-2 text-sm font-medium text-gold-deep">
          {missing}
        </p>
      ) : (
        <p key={i} className="text-base text-foreground">{line}</p>
      ),
    )}
  </div>
);

interface Props {
  apartment: Apartment;
  t: GuideStrings;
  /** Po posledním kroku přepnout na záložku „V bytě“. */
  onOpenInApartment: () => void;
}

const ArrivalWizard = ({ apartment, t, onOpenInApartment }: Props) => {
  const [mode, setMode] = useState<ArrivalMode | null>(null);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const steps = useMemo(
    () => (mode ? buildSteps(t, apartment, mode) : []),
    [t, apartment, mode],
  );
  const step = steps[index];
  const isLast = index === steps.length - 1;

  const next = () => {
    if (isLast) onOpenInApartment();
    else setIndex((i) => Math.min(i + 1, steps.length - 1));
  };
  const back = () => setIndex((i) => Math.max(i - 1, 0));

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 48) (dx < 0 ? next : back)();
    touchX.current = null;
  };

  // Volba způsobu příjezdu — před prvním krokem.
  if (!mode) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl text-primary">{t.mode.title}</h2>
        <div className="grid gap-3">
          {(
            [
              { id: "car", label: t.mode.car, Icon: Car },
              { id: "foot", label: t.mode.foot, Icon: Footprints },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-5 text-left text-lg font-semibold text-primary shadow-soft transition-colors active:bg-secondary"
            >
              <Icon className="h-7 w-7 text-gold" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Progress */}
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {t.nav.stepOf(index + 1, steps.length)}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gold transition-all duration-300"
            style={{ width: `${((index + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="font-display text-2xl text-primary">{step.title}</h2>
        <Body lines={step.body} missing={t.nav.textMissing} />

        {step.showNavigate && (
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            <Navigation className="h-4 w-4" aria-hidden />
            {t.steps.find.navigate}
          </a>
        )}

        {step.photos.map((photo, i) => (
          <HotspotImage key={i} photo={photo} photoMissingLabel={t.nav.photoMissing} eager={i === 0 && index === 0} />
        ))}

        {step.showSitePlan && <SitePlan apartment={apartment} t={t} />}

        {step.id === "done" && (
          <div className="flex items-center gap-3 rounded-2xl bg-secondary px-5 py-4">
            <PartyPopper className="h-7 w-7 text-gold" aria-hidden />
            <p className="text-base font-medium text-secondary-foreground">{step.body[0]}</p>
          </div>
        )}
      </div>

      {/* Navigace */}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-4 text-base font-semibold text-primary disabled:opacity-40"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
          {t.nav.back}
        </button>
        <button
          type="button"
          onClick={next}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-5 py-4 text-base font-semibold text-accent-foreground shadow-gold"
        >
          {isLast ? t.steps.done.cta : t.nav.next}
          {!isLast && <ArrowRight className="h-5 w-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
};

export default ArrivalWizard;
