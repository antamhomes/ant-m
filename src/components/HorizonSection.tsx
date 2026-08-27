import { useMemo, useState, useRef } from "react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import {
  DISTRICTS, ENERGY, LTR, ROOMS, LAUNCH_FEE, KIT_PER_ROOM, EMPTY_PER_ROOM,
  RENEW_PER_ROOM_YEAR, YEAR_ONE_RAMP, PROJECT_FEE, PROJECT_FEE_THRESHOLD, ownerMonthly,
  type LocationKey, type SizeKey,
} from "@/lib/yield";

/**
 * Dlouhodobý nájem vs krátkodobý pronájem: kumulativní příjem majitele za 5 let.
 * Krátkodobá křivka začíná v mínusu (uvedení do provozu + vybavení), vrátí se,
 * a od bodu překřížení se rozdíl zvětšuje. Čísla čte z lib/yield, takže se
 * s kalkulačkou nikdy nerozejdou.
 */
const MONTHS = 60;
const LOCS: LocationKey[] = ["praha1", "praha2", "praha3", "praha4", "praha5", "praha7", "praha8", "praha9"];
const SIZES: SizeKey[] = ["1kk", "2kk", "3kk"];
type Furn = "airbnb" | "najem" | "prazdny";

const W = 860, H = 360, PAD = { t: 20, r: 92, b: 32, l: 64 };

const HorizonSection = () => {
  const { lang } = useLanguage();
  const [loc, setLoc] = useState<LocationKey>("praha1");
  const [size, setSize] = useState<SizeKey>("2kk");
  const [furn, setFurn] = useState<Furn>("najem");
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const czk = (n: number) => `${Math.round(n).toLocaleString("cs-CZ").replace(/ /g, " ")} Kč`;
  const short = (n: number) =>
    Math.abs(n) >= 1e6
      ? `${(n / 1e6).toFixed(1).replace(".", lang === "cs" ? "," : ",")} mil.`
      : `${Math.round(n / 1000)} tis.`;

  const d = useMemo(() => {
    const gross = ownerMonthly(loc, size).net;
    const energy = ENERGY[size];
    const renew = (RENEW_PER_ROOM_YEAR * ROOMS[size]) / 12;
    const y1 = gross * YEAR_ONE_RAMP - energy - renew;
    const y2 = gross - energy - renew;
    const rent = LTR[loc][size];
    const kit =
      furn === "prazdny" ? EMPTY_PER_ROOM * ROOMS[size]
      : furn === "najem" ? KIT_PER_ROOM * ROOMS[size]
      : 0;
    // Vybavení nad prahem je projekt, a ten nese odměnu za řízení podle ceníku.
    // Bez ní by graf ukazoval nižší vstupní náklad, než jaký majiteli skutečně vyfakturujeme.
    const projectFee = kit > PROJECT_FEE_THRESHOLD ? Math.round(kit * PROJECT_FEE) : 0;
    const setup = LAUNCH_FEE + kit + projectFee;
    const lt = [0], str = [-setup];
    for (let i = 1; i <= MONTHS; i++) {
      lt.push(lt[i - 1] + rent);
      str.push(str[i - 1] + (i <= 12 ? y1 : y2));
    }
    let payback: number | null = null, cross: number | null = null;
    for (let i = 1; i <= MONTHS; i++) {
      if (payback === null && str[i] >= 0) payback = i;
      if (cross === null && str[i] >= lt[i]) cross = i;
    }
    return { lt, str, rent, y2, setup, kit, projectFee, energy, renew, payback, cross };
  }, [loc, size, furn]);

  const maxY = Math.max(d.lt[MONTHS], d.str[MONTHS]);
  const minY = Math.min(0, d.str[0]);
  const px = (i: number) => PAD.l + (W - PAD.l - PAD.r) * (i / MONTHS);
  const py = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - minY) / (maxY - minY));
  const path = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");

  const gridStep = maxY > 2.4e6 ? 1e6 : maxY > 1.2e6 ? 5e5 : 2.5e5;
  const grid: number[] = [];
  for (let v = Math.ceil(minY / gridStep) * gridStep; v <= maxY; v += gridStep) grid.push(v);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const sx = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round((sx - PAD.l) / ((W - PAD.l - PAD.r) / MONTHS));
    setHover(Math.max(0, Math.min(MONTHS, i)));
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-sm border font-body text-[13px] transition-colors ${
      active ? "bg-primary text-primary-foreground border-primary"
             : "bg-card text-muted-foreground border-border hover:border-gold/60"
    }`;

  const gap = d.str[MONTHS] - d.lt[MONTHS];
  const stats: [string, string][] = [
    [t(lang, "hz_stat_invest"), czk(-d.setup)],
    [t(lang, "hz_stat_payback"),
      d.payback
        ? `${d.payback} ${t(lang, d.payback === 1 ? "hz_months_one" : d.payback < 5 ? "hz_months_few" : "hz_months")}`
        : "—"],
    [t(lang, "hz_stat_cross"), d.cross ? `${d.cross}. ${t(lang, "hz_month")}` : "—"],
    [t(lang, "hz_stat_gap"), `${gap >= 0 ? "+" : ""}${czk(gap)}`],
  ];

  return (
    <section id="horizont" className="section bg-secondary scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "hz_label")}</p>
          <h2 className="h-section-sm text-foreground">{t(lang, "hz_title")}</h2>
          <p className="lead">{t(lang, "hz_desc")}</p>
        </Reveal>

        <Reveal delay={0.05} className="flex flex-wrap gap-2 justify-center mb-5">
          {LOCS.map((l) => (
            <button key={l} type="button" onClick={() => setLoc(l)} aria-pressed={loc === l} className={chip(loc === l)}>
              {`Praha ${l.replace("praha", "")}`}
            </button>
          ))}
        </Reveal>
        <Reveal delay={0.05} className="flex flex-wrap gap-2 justify-center mb-6">
          {SIZES.map((s) => (
            <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={size === s} className={chip(size === s)}>
              {s.replace("kk", "+kk")}
            </button>
          ))}
          <span aria-hidden="true" className="w-px self-stretch bg-border mx-1" />
          {(["airbnb", "najem", "prazdny"] as Furn[]).map((f) => (
            <button key={f} type="button" onClick={() => setFurn(f)} aria-pressed={furn === f} className={chip(furn === f)}>
              {t(lang, `hz_furn_${f}` as const)}
            </button>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="bg-card border border-border rounded-md p-4 sm:p-6 relative">
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-2 font-body text-[13px] text-muted-foreground">
            <span className="flex items-center gap-2">
              <i aria-hidden="true" className="inline-block w-5 h-[3px] rounded-full bg-gold-deep" />
              {t(lang, "hz_legend_str")}
            </span>
            <span className="flex items-center gap-2">
              <i aria-hidden="true" className="inline-block w-5 h-[3px] rounded-full bg-primary" />
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
        </Reveal>

        <Reveal delay={0.15} as="ul" className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-md overflow-hidden mt-6">
          {stats.map(([k, v]) => (
            <li key={k} className="bg-card px-4 py-3">
              <p className="font-body text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{k}</p>
              <p className="font-display text-[19px] md:text-[23px] mt-0.5 tnum">{v}</p>
            </li>
          ))}
        </Reveal>

        <Reveal delay={0.15} className="mt-4 max-w-[78ch] mx-auto">
          <details className="group">
            <summary className="cursor-pointer font-body text-[13px] text-gold-deep underline underline-offset-4 decoration-gold/40 text-center list-none">
              {t(lang, "hz_assume_toggle")}
            </summary>
          <p className="font-body text-[12.5px] text-muted-foreground leading-relaxed mt-3 text-pretty">
            {t(lang, "hz_assume_1")}{" "}
            <strong className="text-foreground/80 font-medium">{czk(d.rent)}</strong>{" "}
            {t(lang, "hz_assume_2")}{" "}
            <strong className="text-foreground/80 font-medium">{czk(d.y2)}</strong>{" "}
            {t(lang, "hz_assume_3")} ({czk(d.energy)}){t(lang, "hz_assume_4")}{" "}
            {czk(LAUNCH_FEE)}{d.kit ? `, ${t(lang, "hz_assume_kit")} ${czk(d.kit)}` : ""}
            {d.projectFee ? `, ${t(lang, "hz_assume_project")} ${czk(d.projectFee)}` : ""}.{" "}
            {t(lang, "hz_assume_5")}
          </p>
          </details>
        </Reveal>
      </div>
    </section>
  );
};

export default HorizonSection;
