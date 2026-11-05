import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import Reveal from "@/components/Reveal";
import TermSheet from "@/components/lease/TermSheet";
import { czk, quoteLease, RATE_DEFAULT, RATE_SOURCE } from "@/lib/lease";
import { ctvrtiOf, type LocationKey, type SizeKey } from "@/lib/yield";

/**
 * 05 · VAŠE SPLÁTKA (5. 11. 2026). Nahrazuje kalkulačku výnosu: investor
 * nevydělává na výnosu, ale na tom, že mu chodí splátka. Vstup je cena bytu,
 * dispozice, část Prahy a čtvrť, výstup nabídkový list s jeho číslem a
 * verdikt (celá splátka / část / posoudíme). Počítá lib/lease.ts.
 */
const LOCS: { key: LocationKey; label: string }[] = [
  { key: "praha1", label: "Praha 1" }, { key: "praha2", label: "Praha 2" }, { key: "praha3", label: "Praha 3" },
  { key: "praha5", label: "Praha 5" }, { key: "praha7", label: "Praha 7" }, { key: "praha8", label: "Praha 8" },
];
const SIZES: { key: SizeKey; label: string }[] = [
  { key: "1kk", label: "1+kk" }, { key: "2kk", label: "2+kk" }, { key: "3kk", label: "3+kk" },
];
const PRICE_MIN = 3_000_000, PRICE_MAX = 25_000_000, PRICE_STEP = 100_000;

const fmtMil = (n: number) => `${(n / 1_000_000).toFixed(1).replace(".", ",")} mil. Kč`;

const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} aria-pressed={on}
    className={`px-3.5 py-2.5 rounded-sm text-sm font-body font-medium transition-colors border ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-gold/60"}`}>
    {children}
  </button>
);

const LeaseCalc = () => {
  const { lang } = useLanguage();
  const [price, setPrice] = useState(9_400_000);
  const [size, setSize] = useState<SizeKey>("2kk");
  const [loc, setLoc] = useState<LocationKey>("praha1");
  const [ctvrt, setCtvrt] = useState<string | null>("nove_mesto");
  const [ratePct, setRatePct] = useState((RATE_DEFAULT * 100).toFixed(2).replace(".", ","));

  const rate = useMemo(() => {
    const v = parseFloat(ratePct.replace(",", "."));
    return Number.isFinite(v) && v > 0 && v < 20 ? v / 100 : RATE_DEFAULT;
  }, [ratePct]);

  const ctvrti = ctvrtiOf(loc);
  const quote = useMemo(() => quoteLease(price, loc, size, { ctvrt, rate }), [price, loc, size, ctvrt, rate]);
  const locLabel = LOCS.find((l) => l.key === loc)?.label ?? loc;
  const ctvrtLabel = ctvrti.find((c) => c.id === ctvrt)?.label ?? null;
  const sizeLabel = SIZES.find((s) => s.key === size)?.label ?? size;
  const flat = [sizeLabel, ctvrtLabel ?? locLabel].join(" · ");

  const pickLoc = (l: LocationKey) => { setLoc(l); setCtvrt(null); trackEvent("lease_calc_loc", { loc: l }); };

  const verdict =
    quote.covered === "full" ? t(lang, "lz_calc_full")
      : quote.covered === "partial" ? t(lang, "lz_calc_partial").replace("{cap}", czk(quote.cap ?? 0))
        : t(lang, "lz_calc_review");

  const leaseLine = `Nájem 36: ${locLabel}${ctvrtLabel ? ` · ${ctvrtLabel}` : ""} · ${sizeLabel} · cena ${czk(price)} · splátka ${czk(quote.payment)} (70 %, 30 let, ${ratePct} %) · ${
    quote.covered === "full" ? "pokryjeme celou" : quote.covered === "partial" ? `pokryjeme až ${czk(quote.cap ?? 0)}` : "posoudit"
  }`;

  const sendToForm = () => {
    trackEvent("cta_click", { location: "lease_calc", target: "contact", covered: quote.covered });
    window.dispatchEvent(new CustomEvent("antam:prefill-contact", { detail: { location: locLabel, size: sizeLabel, leaseLine } }));
  };

  return (
    <section id="splatka" className="bg-secondary border-t border-border py-20 sm:py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <Reveal>
          <p className="font-body text-[11px] tracking-[0.2em] uppercase text-gold">{t(lang, "lz_calc_label")}</p>
          <h2 className="mt-5 font-display font-medium text-[1.9rem] sm:text-[2.1rem] leading-[1.1] tracking-[-0.01em] text-foreground">{t(lang, "lz_calc_title")}</h2>
          <p className="mt-3 font-body text-[15.5px] text-muted-foreground">{t(lang, "lz_calc_desc")}</p>

          <div className="mt-9 space-y-7">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="lz-price" className="font-body text-sm font-semibold text-foreground">{t(lang, "lz_calc_price")}</label>
                <span className="font-display text-[1.5rem] leading-none text-foreground tnum">{czk(price)}</span>
              </div>
              <input id="lz-price" type="range" min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                onPointerUp={() => trackEvent("lease_calc_price", { price })}
                className="mt-3 w-full accent-[hsl(var(--primary))]" />
              <div className="mt-1 flex justify-between font-body text-[11.5px] text-muted-foreground tnum">
                <span>{fmtMil(PRICE_MIN)}</span><span>{fmtMil(PRICE_MAX)}</span>
              </div>
            </div>

            <div>
              <p className="font-body text-sm font-semibold text-foreground mb-3">{t(lang, "lz_calc_size")}</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => <Pill key={s.key} on={size === s.key} onClick={() => setSize(s.key)}>{s.label}</Pill>)}
              </div>
            </div>

            <div>
              <p className="font-body text-sm font-semibold text-foreground mb-3">{t(lang, "lz_calc_loc")}</p>
              <div className="flex flex-wrap gap-2">
                {LOCS.map((l) => <Pill key={l.key} on={loc === l.key} onClick={() => pickLoc(l.key)}>{l.label}</Pill>)}
              </div>
            </div>

            {ctvrti.length > 0 && (
              <div>
                <p className="font-body text-sm font-semibold text-foreground mb-3">{t(lang, "lz_calc_ctvrt")}</p>
                <div className="flex flex-wrap gap-2">
                  {ctvrti.map((c) => <Pill key={c.id} on={ctvrt === c.id} onClick={() => setCtvrt(c.id)}>{c.label}</Pill>)}
                  <Pill on={ctvrt === null} onClick={() => setCtvrt(null)}>{`Ostatní ${locLabel}`}</Pill>
                </div>
              </div>
            )}

            <div className="max-w-[18rem]">
              <label htmlFor="lz-rate" className="font-body text-sm font-semibold text-foreground">{t(lang, "lz_calc_rate")}</label>
              <div className="mt-2 flex items-center gap-2">
                <input id="lz-rate" inputMode="decimal" value={ratePct} onChange={(e) => setRatePct(e.target.value)}
                  className="w-24 px-3 py-2 bg-card border border-border rounded-sm font-body text-sm text-foreground tnum focus:outline-none focus:border-gold" />
                <span className="font-body text-sm text-muted-foreground">% p. a.</span>
              </div>
              <p className="mt-1.5 font-body text-[12px] text-muted-foreground">{t(lang, "lz_calc_rate_help").replace("{source}", RATE_SOURCE)}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-28">
          <TermSheet quote={quote} label={t(lang, "lz_calc_sheet_label")} flat={flat} />
          <div className="mt-5 flex flex-col gap-3">
            <p className={`font-display text-[1.25rem] leading-snug ${quote.covered === "full" ? "text-foreground" : "text-muted-foreground"}`}>
              {verdict}
            </p>
            {quote.covered === "partial" && (
              <p className="font-body text-[13.5px] text-muted-foreground text-pretty">{t(lang, "lz_calc_partial_help")}</p>
            )}
            <a href="#kontakt" onClick={sendToForm} className="btn btn-primary px-7 py-3.5 self-start">{t(lang, "lz_calc_cta")}</a>
            <p className="font-body text-[12px] leading-relaxed text-muted-foreground max-w-[56ch]">{t(lang, "lz_calc_note")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default LeaseCalc;
