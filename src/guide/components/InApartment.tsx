import { useMemo, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import type { Apartment } from "../config/apartments";
import { buildTiles, type InApartmentTile } from "../config/inApartment";
import type { GuideStrings } from "../i18n";
import HotspotImage from "./HotspotImage";

interface Props {
  apartment: Apartment;
  t: GuideStrings;
}

const WifiRow = ({
  label,
  value,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) => {
  const [copied, setCopied] = useState(false);
  const isPlaceholder = value === "[TEXT]";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard nemusí být dostupný; hodnota je vidět */
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`truncate font-semibold ${isPlaceholder ? "text-gold-deep" : "text-secondary-foreground"}`}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        disabled={isPlaceholder}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
};

/** Sekce „V bytě“ — mřížka dlaždic, detail s fotkou a textem. */
const InApartment = ({ apartment, t }: Props) => {
  const tiles = useMemo(() => buildTiles(t, apartment.id), [t, apartment.id]);
  const [open, setOpen] = useState<InApartmentTile | null>(null);

  return (
    <div>
      <h2 className="mb-4 font-display text-2xl text-primary">{t.inApartment.title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => setOpen(tile)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-6 text-center shadow-soft transition-colors active:bg-secondary"
          >
            <tile.icon className="h-7 w-7 text-gold" aria-hidden />
            <span className="text-sm font-semibold text-primary">{tile.title}</span>
          </button>
        ))}
      </div>

      {/* Detail dlaždice — mobilní sheet přes celou obrazovku */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/50"
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-6 pb-10 shadow-elegant"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-primary">{open.title}</h3>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Zavřít"
                className="rounded-full bg-secondary p-2 text-secondary-foreground"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {open.wifi && (
              <div className="mb-4 space-y-2">
                <WifiRow label={t.inApartment.wifiName} value={open.wifi.name} copyLabel={t.inApartment.copy} copiedLabel={t.inApartment.copied} />
                <WifiRow label={t.inApartment.wifiPassword} value={open.wifi.password} copyLabel={t.inApartment.copy} copiedLabel={t.inApartment.copied} />
              </div>
            )}

            <div className="space-y-2">
              {open.body.map((line, i) =>
                line === "[TEXT]" ? (
                  <p key={i} className="rounded-lg border border-dashed border-gold bg-gold/10 px-3 py-2 text-sm font-medium text-gold-deep">
                    {t.nav.textMissing}
                  </p>
                ) : (
                  <p key={i} className="text-base text-foreground">{line}</p>
                ),
              )}
            </div>

            <div className="mt-4 space-y-3">
              {open.photos.map((photo, i) => (
                <HotspotImage key={i} photo={photo} photoMissingLabel={t.nav.photoMissing} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InApartment;
