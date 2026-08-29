import { useMemo, useRef, useState } from "react";
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

const W = 860, H = 360, PAD = { t: 20, r: 92, b: 32, l: 64 };

const FiveYearChart = () => {
  const { lang } = useLanguage();
  const { location, size, guests, m2, furn, setFurn } = useCalc();
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const d = useMemo(() => fiveYear(location, guests, size, m2, furn), [location, guests, size, m2, furn]);
  if (!d) return null;

  const czk = (n: number) => `${Math.round(n).toLocaleString("cs-CZ").replace(/ /g, "\u00a0")}\u00a0Kč`;
  const short = (n: number) =>
    Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".", ",")} mil.` : `${Math.round(n / 1000)} tis.`;
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
        <svg
          ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible touch-pan-y"
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
          {[0, 1, 2, 3, 4, 5].map((yr) => (
            <text key={yr} x={px(yr * 12)} y={H - PAD.b + 17} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
              {yr === 0 ? t(lang, "hz_start") : `${yr}. ${t(lang, "hz_year")}`}
            </text>
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

      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-sm overflow-hidden list-none m-0 p-0">
        {([
          [t(lang, "hz_stat_invest"), czk(-d.setup)],
          [t(lang, "hz_stat_payback"),
            d.payback ? `${d.payback} ${t(lang, d.payback === 1 ? "hz_months_one" : d.payback < 5 ? "hz_months_few" : "hz_months")}` : "?"],
          [t(lang, "hz_stat_cross"), d.cross ? `${d.cross}. ${t(lang, "hz_month")}` : "?"],
          [t(lang, "hz_stat_gap"), `${d.gap >= 0 ? "+" : ""}${czk(d.gap)}`],
        ] as [string, string][]).map(([k, v]) => (
          <li key={k} className="bg-muted/40 px-3 py-2.5">
            <p className="font-body text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">{k}</p>
            <p className="font-display text-[17px] mt-0.5 tnum text-foreground">{v}</p>
          </li>
        ))}
      </ul>

      {/* Proč se pětileté číslo liší od měsíčního: odečtené položky viditelně. */}
      <div className="font-body text-[12.5px] text-muted-foreground leading-relaxed tnum space-y-1">
        <p className="flex justify-between gap-3"><span>{t(lang, "calc_5y_energy")}</span><span className="whitespace-nowrap shrink-0">−{czk(d.energy)} / {t(lang, "hz_month")}</span></p>
        <p className="flex justify-between gap-3"><span>{t(lang, "calc_5y_renew")}</span><span className="whitespace-nowrap shrink-0">−{czk(d.renew)} / {t(lang, "hz_month")}</span></p>
        <p className="flex justify-between gap-3"><span>{t(lang, "calc_5y_rent")}</span><span className="whitespace-nowrap shrink-0">{czk(d.rent)} / {t(lang, "hz_month")}</span></p>
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
