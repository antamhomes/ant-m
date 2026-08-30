import { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCalc, type Furn } from "@/contexts/CalcContext";
import { fiveYear, HORIZON_MONTHS as MONTHS } from "@/lib/horizon";
import { t } from "@/i18n/translations";

/**
 * Horizont: pětiletý graf (krátkodobě s Antam Homes vs dlouhodobý nájem).
 * Srovnávací žebřík (kontrola/výnos/flexibilita/platby) byl v patchi 126
 * vyřazen: všechny čtyři body už na stránce jsou (portfolio, FAQ, kontakt).
 * Graf čte STEJNÝ stav jako kalkulačka (CalcContext: lokalita, hosté, plocha,
 * dispozice) a stejné funkce (lib/horizon → lib/yield), takže se čísla nikdy
 * nerozejdou; v kalkulačce zůstal jen teaser řádek, který sem vede.
 * Patch 124: graf se vrátil z kalkulačkové záložky sem, nad srovnání.
 */

/** The chart draws in real screen pixels: the wrapper's CSS aspect ratio fixes the box
 *  (no layout shift), a ResizeObserver reports its size and the viewBox follows it.
 *  So 11 px labels are 11 px on a phone as well, and a phone gets the taller 4:3 box
 *  where the two curves have room to open up. Before the first measurement (SSG
 *  markup, first paint) the desktop proportions apply. */
const DEFAULT_BOX = { w: 860, h: 360 };

const FiveYearChart = () => {
  const { lang } = useLanguage();
  const { location, size, guests, m2, furn, setFurn } = useCalc();
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState(DEFAULT_BOX);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setBox({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w: W, h: H } = box;
  const narrow = W < 480;
  const PAD = { t: 16, r: narrow ? 56 : 92, b: 30, l: narrow ? 50 : 64 };
  const d = useMemo(() => fiveYear(location, guests, size, m2, furn), [location, guests, size, m2, furn]);
  if (!d) return null;

  const czk = (n: number) => `${Math.round(n).toLocaleString("cs-CZ").replace(/ /g, "\u00a0")}\u00a0Kč`;
  // "mil." / "tis." are Czech; the Vietnamese page counts in "triệu" (million) and "nghìn".
  const short = (n: number) =>
    Math.abs(n) >= 1e6
      ? `${(n / 1e6).toFixed(1).replace(".", ",")}\u00a0${lang === "cs" ? "mil." : "triệu"}`
      : `${Math.round(n / 1000)}\u00a0${lang === "cs" ? "tis." : "nghìn"}`;
  const px = (i: number) => PAD.l + (W - PAD.l - PAD.r) * (i / MONTHS);
  const maxY = Math.max(d.lt[MONTHS], d.str[MONTHS]);
  const minY = Math.min(0, d.str[0]);
  const py = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - minY) / (maxY - minY));
  const path = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  const gridStep = maxY > 2.4e6 ? 1e6 : maxY > 1.2e6 ? 5e5 : 2.5e5;
  const grid: number[] = [];
  for (let v = Math.ceil(minY / gridStep) * gridStep; v <= maxY; v += gridStep) grid.push(v);
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const sx = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(MONTHS, Math.round((sx - PAD.l) / ((W - PAD.l - PAD.r) / MONTHS)))));
  };
  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-sm border font-body text-[13px] transition-colors ${
      active ? "bg-gold/15 text-gold-deep font-semibold border-gold/50"
             : "bg-card text-muted-foreground border-border hover:border-gold/50"
    }`;
  const sizeLabel = size.replace("kk", "+kk");
  const locLabel = `Praha ${location.replace("praha", "")}`;

  return (
    <Reveal delay={0.05} className="max-w-3xl mx-auto rounded-md border border-border bg-card p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="font-body text-[13px] text-muted-foreground tnum">
          {locLabel} · {sizeLabel} · {guests}{lang === "vi" ? " khách" : " hostů"} · {m2} m²
          {" "}
          <a href="#kalkulacka-zadani" className="underline underline-offset-4 decoration-border hover:text-foreground">{t(lang, "calc_edit")}</a>
        </p>
        <div className="flex flex-wrap gap-2">
          {(["airbnb", "najem", "prazdny"] as Furn[]).map((f) => (
            <button key={f} type="button" onClick={() => setFurn(f)} aria-pressed={furn === f} className={chip(furn === f)}>
              {t(lang, `hz_furn_${f}` as const)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-1 font-body text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <i aria-hidden="true" className="inline-block w-4 h-[3px] rounded-full bg-gold-deep" />
            {t(lang, "hz_legend_str")}
          </span>
          <span className="flex items-center gap-1.5">
            <i aria-hidden="true" className="inline-block w-4 h-[3px] rounded-full bg-primary" />
            {t(lang, "hz_legend_ltr")}
          </span>
        </div>
        <div ref={boxRef} className="aspect-[4/3] sm:aspect-[860/360]">
        <svg
          ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="block w-full h-full overflow-visible touch-pan-y"
          onPointerMove={onMove} onPointerLeave={() => setHover(null)}
          role="img" aria-label={t(lang, "hz_aria") as string}
        >
          {grid.map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)} stroke="hsl(var(--border))" strokeWidth={1} opacity={0.6} />
              <text x={PAD.l - 8} y={py(v) + 4} textAnchor="end" className="fill-muted-foreground" style={{ fontSize: 11 }}>
                {v === 0 ? "0" : short(v)}
              </text>
            </g>
          ))}
          <line x1={PAD.l} x2={W - PAD.r} y1={py(0)} y2={py(0)} stroke="hsl(var(--border))" strokeWidth={1.5} />
          {/* Phones: a 200 px axis cannot carry six words, so the years become plain
              numbers and only the last one keeps its unit; the origin is self-evident. */}
          {[0, 1, 2, 3, 4, 5].map((yr) => (
            (narrow && yr === 0) ? null : (
            <text key={yr} x={px(yr * 12)} y={H - PAD.b + 17} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
              {yr === 0 ? t(lang, "hz_start") : narrow && yr < 5 ? `${yr}.` : `${yr}. ${t(lang, "hz_year")}`}
            </text>
            )
          ))}
          <path d={path(d.lt)} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinecap="round" />
          <path d={path(d.str)} fill="none" stroke="hsl(var(--gold-deep))" strokeWidth={2} strokeLinecap="round" />
          {d.payback && <circle cx={px(d.payback)} cy={py(0)} r={4.5} fill="hsl(var(--gold-deep))" stroke="hsl(var(--card))" strokeWidth={2} />}
          {d.cross && <circle cx={px(d.cross)} cy={py(d.lt[d.cross])} r={4.5} fill="hsl(var(--gold-deep))" stroke="hsl(var(--card))" strokeWidth={2} />}
          <text x={W - PAD.r + 8} y={py(d.str[MONTHS]) + 4} className="fill-gold-deep" style={{ fontSize: 12, fontWeight: 600 }}>{short(d.str[MONTHS])}</text>
          <text x={W - PAD.r + 8} y={py(d.lt[MONTHS]) + 4} className="fill-primary" style={{ fontSize: 12, fontWeight: 600 }}>{short(d.lt[MONTHS])}</text>
          {hover !== null && (
            <g>
              <line x1={px(hover)} x2={px(hover)} y1={PAD.t} y2={H - PAD.b} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.4} />
              <circle cx={px(hover)} cy={py(d.str[hover])} r={4} fill="hsl(var(--gold-deep))" stroke="hsl(var(--card))" strokeWidth={2} />
              <circle cx={px(hover)} cy={py(d.lt[hover])} r={4} fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth={2} />
            </g>
          )}
        </svg>
        </div>
        {hover !== null && (
          <div
            className="pointer-events-none absolute bg-card border border-border rounded-sm px-3 py-2 font-body text-[12.5px] shadow-lg min-w-[190px]"
            style={{
              left: `clamp(4px, ${(px(hover) / W) * 100}% - 95px, calc(100% - 200px))`,
              top: `${(Math.min(py(d.str[hover]), py(d.lt[hover])) / H) * 100}%`,
            }}
          >
            <strong className="font-semibold">
              {hover === 0 ? t(lang, "hz_start") : `${hover}. ${t(lang, "hz_month")}`}
            </strong>
            <div className="flex justify-between gap-4 mt-1"><span className="text-gold-deep">{t(lang, "hz_legend_str")}</span><span>{czk(d.str[hover])}</span></div>
            <div className="flex justify-between gap-4"><span className="text-primary">{t(lang, "hz_legend_ltr")}</span><span>{czk(d.lt[hover])}</span></div>
            <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-border">
              <span>{t(lang, "hz_diff")}</span>
              <strong className={d.str[hover] - d.lt[hover] >= 0 ? "text-gold-deep" : "text-destructive"}>
                {d.str[hover] - d.lt[hover] >= 0 ? "+" : ""}{czk(d.str[hover] - d.lt[hover])}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Hlavní sdělení sekce je jedno číslo: rozdíl za pět let. Zaokrouhlené na
          tisíce (model s odhadovanými vstupy nemá co slibovat na korunu; přesné
          průběžné hodnoty zůstávají v tooltipu grafu). Vstupy jsou druhotné. */}
      <div className="border border-border rounded-sm overflow-hidden">
        <div className="bg-muted/40 px-4 py-4 sm:py-5 text-center border-b border-border">
          <p className="font-body text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {t(lang, "hz_stat_gap")}
          </p>
          <p className="font-display text-3xl sm:text-4xl font-semibold mt-1 tnum text-gradient-gold">
            {d.gap >= 0 ? "+" : ""}{czk(Math.round(d.gap / 1000) * 1000)}
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border list-none m-0 p-0">
          {([
            [t(lang, "hz_stat_invest"), czk(-d.setup)],
            [t(lang, "hz_stat_payback"),
              d.payback ? `${d.payback} ${t(lang, d.payback === 1 ? "hz_months_one" : d.payback < 5 ? "hz_months_few" : "hz_months")}` : "?"],
            [t(lang, "hz_stat_cross"), d.cross ? `${d.cross}. ${t(lang, "hz_month")}` : "?"],
          ] as [string, string][]).map(([k, v]) => (
            <li key={k} className="bg-card px-3 sm:px-3 py-2 sm:py-2.5 min-w-0 flex items-baseline justify-between gap-3 sm:block">
              <p className="font-body text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground leading-snug">{k}</p>
              <p className="font-display text-[16px] sm:text-[17px] sm:mt-0.5 tnum text-foreground/85 whitespace-nowrap">{v}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Proč se pětileté číslo liší od měsíčního: odečtené položky viditelně. */}
      <div className="font-body text-muted-foreground tnum space-y-1">
        {([
          [t(lang, "calc_5y_energy"), `−${czk(d.energy)}`],
          [t(lang, "calc_5y_renew"), `−${czk(d.renew)}`],
          [t(lang, "calc_5y_rent"), czk(d.rent)],
        ] as [string, string][]).map(([k, v]) => (
          <p key={k} className="flex justify-between items-baseline gap-3 text-[12.5px] leading-relaxed">
            <span>{k}</span>
            <span className="whitespace-nowrap shrink-0">{v} / {t(lang, "hz_month")}</span>
          </p>
        ))}
      </div>
      <p className="font-body text-[12px] text-muted-foreground leading-relaxed border-t border-border pt-3">
        {t(lang, "hz_growth")} {t(lang, "hz_assume_5")}
      </p>
    </Reveal>
  );
};

const HorizonSection = () => {
  const { lang } = useLanguage();
  return (
    <section id="horizont" className="section bg-background scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "whyBetter_label")}</p>
          <h2 className="h-section-sm text-foreground">
            {t(lang, "whyBetter_title1")}
            <span className="text-gradient-gold">{t(lang, "whyBetter_title2")}</span>
            {t(lang, "whyBetter_title3")}
          </h2>
          {t(lang, "whyBetter_desc") && <p className="lead">{t(lang, "whyBetter_desc")}</p>}
        </Reveal>

        <FiveYearChart />

      </div>
    </section>
  );
};

export default HorizonSection;
