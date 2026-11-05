import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import Reveal from "@/components/Reveal";
import OfferSheet from "@/components/lease/OfferSheet";
import { annuity, czk, indicativeRange, leaseCap, LTV, RATE_DEFAULT, RATE_SOURCE, TERM_YEARS } from "@/lib/lease";
import { ctvrtiOf, rentFor, typicalArea, type LocationKey, type SizeKey } from "@/lib/yield";

/**
 * VÁŠ BYT (5. 11. 2026 večer). Kalkulačka pro majitele, který byt už má,
 * s přepínačem „Byt kupuji". Výstup: orientační nájem od Antam jako ROZPĚTÍ
 * (lib/lease.indicativeRange, nikdy samotný strop), běžný nájem pro srovnání
 * a, když majitel zadá splátku, jestli ji pokryjeme. Strop počítá jediná
 * funkce leaseCap; splátka do něj nevstupuje.
 */
const LOCS: { key: LocationKey; label: string }[] = [
  { key: "praha1", label: "Praha 1" }, { key: "praha2", label: "Praha 2" }, { key: "praha3", label: "Praha 3" },
  { key: "praha5", label: "Praha 5" }, { key: "praha6", label: "Praha 6" }, { key: "praha7", label: "Praha 7" }, { key: "praha8", label: "Praha 8" },
];
const SIZES: { key: SizeKey; label: string }[] = [
  { key: "1kk", label: "1+kk" }, { key: "2kk", label: "2+kk" }, { key: "3kk", label: "3+kk" }, { key: "4kk", label: "4+kk" },
];
const num = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;

const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} aria-pressed={on}
    className={`px-3.5 py-2.5 rounded-sm text-sm font-body font-medium transition-colors border ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-gold/60"}`}>
    {children}
  </button>
);
const inputCls = "w-full px-3 py-2.5 bg-card border border-border rounded-sm font-body text-sm text-foreground tnum focus:outline-none focus:border-gold";

const LeaseCalc = () => {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<"own" | "buy">("own");
  const [loc, setLoc] = useState<LocationKey>("praha1");
  const [ctvrt, setCtvrt] = useState<string | null>("stare_mesto");
  const [size, setSize] = useState<SizeKey>("2kk");
  const [m2, setM2] = useState(String(60));
  const [payment, setPayment] = useState("");
  const [price, setPrice] = useState("");
  const [ratePct, setRatePct] = useState((RATE_DEFAULT * 100).toFixed(2).replace(".", ","));

  const area = num(m2) || typicalArea(loc, size);
  const rate = useMemo(() => {
    const v = parseFloat(ratePct.replace(",", "."));
    return Number.isFinite(v) && v > 0 && v < 20 ? v / 100 : RATE_DEFAULT;
  }, [ratePct]);
  const cap = useMemo(() => leaseCap(loc, size, { ctvrt, m2: area, rate }), [loc, size, ctvrt, area, rate]);
  const ltr = useMemo(() => Math.round(rentFor(loc, size, area, "furnished", ctvrt) / 500) * 500, [loc, size, area, ctvrt]);
  const range = cap ? indicativeRange(cap.maxRent) : null;
  const pay = mode === "own" ? num(payment) : num(price) ? Math.round(annuity(num(price) * LTV, rate, TERM_YEARS)) : 0;

  const ctvrti = ctvrtiOf(loc);
  const locLabel = LOCS.find((l) => l.key === loc)?.label ?? loc;
  const ctvrtLabel = ctvrti.find((c) => c.id === ctvrt)?.label ?? null;
  const sizeLabel = SIZES.find((s) => s.key === size)?.label ?? size;
  const flat = `${sizeLabel} · ${area} m² · ${ctvrtLabel ?? locLabel}`;

  const verdict = !range ? t(lang, "lz_calc_review")
    : !pay ? null
      : pay <= range.low ? t(lang, "lz_calc_full")
        : pay <= range.high ? t(lang, "lz_calc_maybe")
          : t(lang, "lz_calc_partial");
  const vsLtrLine = range ? (range.low > ltr ? t(lang, "lz_calc_above_ltr") : t(lang, "lz_calc_like_ltr")) : null;
  const buyLimit = mode === "buy" && cap && pay > (range?.low ?? 0) ? t(lang, "lz_calc_buy_limit").replace("{maxPrice}", czk(cap.maxPrice)) : null;

  const mid = range ? Math.round((range.low + range.high) / 2) : 0;
  const diffMid = mid - ltr;
  const coverLow = range && pay ? Math.round((range.low / pay) * 100) : null;
  const coverHigh = range && pay ? Math.round((range.high / pay) * 100) : null;

  const leaseLine = `Nájem 36: ${locLabel}${ctvrtLabel ? ` · ${ctvrtLabel}` : ""} · ${sizeLabel} · ${area} m² · ${mode === "own" ? "má byt" : `kupuje za ${czk(num(price))}`} · splátka ${pay ? czk(pay) : "neuvedena"} · orientačně ${range ? `${czk(range.low)}–${czk(range.high)}` : "posoudit"} · běžný nájem ${czk(ltr)}`;
  const sendToForm = () => {
    trackEvent("cta_click", { location: "lease_calc", target: "contact", mode });
    window.dispatchEvent(new CustomEvent("antam:prefill-contact", { detail: { location: locLabel, size: sizeLabel, leaseLine } }));
  };
  const pickLoc = (l: LocationKey) => { setLoc(l); setCtvrt(null); trackEvent("lease_calc_loc", { loc: l }); };

  return (
    <section id="splatka" className="bg-secondary border-t border-border py-20 sm:py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <Reveal>
          <p className="font-body text-[11px] tracking-[0.2em] uppercase text-gold">{t(lang, "lz_calc_label")}</p>
          <h2 className="mt-5 font-display font-medium text-[1.9rem] sm:text-[2.1rem] leading-[1.1] tracking-[-0.01em] text-foreground">{t(lang, "lz_calc_title")}</h2>
          <p className="mt-3 font-body text-[15.5px] text-muted-foreground max-w-[44ch]">{t(lang, "lz_calc_desc")}</p>

          <div className="mt-8 flex gap-2">
            <Pill on={mode === "own"} onClick={() => setMode("own")}>{t(lang, "lz_calc_mode_own")}</Pill>
            <Pill on={mode === "buy"} onClick={() => setMode("buy")}>{t(lang, "lz_calc_mode_buy")}</Pill>
          </div>

          <div className="mt-8 space-y-7">
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
            <div>
              <p className="font-body text-sm font-semibold text-foreground mb-3">{t(lang, "lz_calc_size")}</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => <Pill key={s.key} on={size === s.key} onClick={() => { setSize(s.key); setM2(String(typicalArea(loc, s.key))); }}>{s.label}</Pill>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-[26rem]">
              <label className="block">
                <span className="block font-body text-sm font-semibold text-foreground mb-2">{t(lang, "lz_calc_m2")}</span>
                <div className="flex items-center gap-2"><input inputMode="numeric" value={m2} onChange={(e) => setM2(e.target.value.replace(/[^\d]/g, ""))} className={inputCls} /><span className="font-body text-sm text-muted-foreground">m²</span></div>
              </label>
              {mode === "own" ? (
                <label className="block">
                  <span className="block font-body text-sm font-semibold text-foreground mb-2">{t(lang, "lz_calc_payment")}</span>
                  <div className="flex items-center gap-2"><input inputMode="numeric" value={payment} onChange={(e) => setPayment(e.target.value.replace(/[^\d]/g, ""))} placeholder="např. 32000" className={inputCls} /><span className="font-body text-sm text-muted-foreground">Kč</span></div>
                </label>
              ) : (
                <label className="block">
                  <span className="block font-body text-sm font-semibold text-foreground mb-2">{t(lang, "lz_calc_price")}</span>
                  <div className="flex items-center gap-2"><input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} placeholder="např. 10500000" className={inputCls} /><span className="font-body text-sm text-muted-foreground">Kč</span></div>
                </label>
              )}
            </div>
            {mode === "own" ? (
              <p className="-mt-4 font-body text-[12px] text-muted-foreground">{t(lang, "lz_calc_payment_help")}</p>
            ) : (
              <div className="max-w-[18rem]">
                <label htmlFor="lz-rate" className="font-body text-sm font-semibold text-foreground">{t(lang, "lz_calc_rate")}</label>
                <div className="mt-2 flex items-center gap-2">
                  <input id="lz-rate" inputMode="decimal" value={ratePct} onChange={(e) => setRatePct(e.target.value)} className={`${inputCls} w-24`} />
                  <span className="font-body text-sm text-muted-foreground">% p. a.</span>
                </div>
                <p className="mt-1.5 font-body text-[12px] text-muted-foreground">{t(lang, "lz_calc_buy_help")} {t(lang, "lz_calc_rate_help").replace("{source}", RATE_SOURCE)}</p>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-28">
          <OfferSheet
            label={t(lang, "lz_calc_sheet_label")}
            flat={flat}
            ltr={`kolem ${czk(ltr)}`}
            payment={pay ? czk(pay) : null}
            rent={range ? `${czk(range.low)} až ${czk(range.high)}` : "—"}
            rentSub={range ? t(lang, "lz_calc_range") : undefined}
            vsLtr={range ? `${diffMid >= 0 ? "+" : "−"}${czk(Math.abs(diffMid))}` : null}
            cover={coverLow !== null && coverHigh !== null ? (coverLow >= 100 ? "100 %" : `${coverLow} až ${Math.min(coverHigh, 100)} %`) : null}
          />
          <div className="mt-5 flex flex-col gap-3">
            {verdict && <p className={`font-display text-[1.2rem] leading-snug ${pay && range && pay <= range.low ? "text-foreground" : "text-muted-foreground"}`}>{verdict}</p>}
            {buyLimit && <p className="font-body text-[14px] text-foreground">{buyLimit}</p>}
            {vsLtrLine && <p className="font-body text-[13.5px] text-muted-foreground text-pretty">{vsLtrLine}</p>}
            <a href="#kontakt" onClick={sendToForm} className="btn btn-primary px-7 py-3.5 self-start">{t(lang, "lz_calc_cta")}</a>
            <p className="font-body text-[12px] leading-relaxed text-muted-foreground max-w-[56ch]">{t(lang, "lz_calc_note")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default LeaseCalc;
