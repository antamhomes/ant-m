import { useState, useMemo, useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";
import { Calculator, MapPin, Home, Users, Ruler, Share2, Pencil, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import {
  ROOMS, ENERGY, annualDamageCover, ownerMonthly, rentFor,
  SIZE_PRESET, LAUNCH_FEE, KIT_PER_ROOM, EMPTY_PER_ROOM, RENEW_PER_ROOM_YEAR,
  YEAR_ONE_RAMP, PROJECT_FEE, PROJECT_FEE_THRESHOLD, RENT_GROWTH, STR_GROWTH,
  type LocationKey, type SizeKey, type SeasonKey,
} from "@/lib/yield";

/** Lokalita v kalkulačce: pražské čtvrti + „jinde". U čtvrtí bez vlastních dat
 *  (P2, P6 až P10) a u „jinde" se panel výsledku přepne na posouzení
 *  do 24 hodin; ŽÁDNÉ číslo se neukazuje a nic se neopisuje z jiné čtvrti. */
type CalcLoc = LocationKey | "jinde";
const LOCATIONS: CalcLoc[] = [
  "praha1", "praha2", "praha3", "praha4", "praha5",
  "praha6", "praha7", "praha8", "praha9", "praha10", "jinde",
];

// Dispozice je jen rychlá předvolba kapacity a plochy (a vstup pro energie,
// obnovu a tvar nájmu). Výnos řídí kapacita, nájem plocha.
const sizes: { value: SizeKey; label: string; guestsCs: string; guestsVi: string }[] = [
  { value: "1kk", label: "1+kk", guestsCs: "obvykle 4 hosté",  guestsVi: "thường 4 khách" },
  { value: "2kk", label: "2+kk", guestsCs: "obvykle 6 hostů",  guestsVi: "thường 6 khách" },
  { value: "3kk", label: "3+kk", guestsCs: "obvykle 8 hostů",  guestsVi: "thường 8 khách" },
  { value: "4kk", label: "4+kk", guestsCs: "obvykle 10 hostů", guestsVi: "thường 10 khách" },
];

// Sezónní násobky žijí v lib/yield (SEASONS_BY_LOC, z realizovaných řad každé
// lokality); tady jsou jen popisky. Léto + zima + prosinec skládají přesně rok.
const SEASON_KEYS: SeasonKey[] = ["year", "summer", "winter", "xmas"];

const MONTHS = 60;
const W = 860, H = 360, PAD = { t: 20, r: 92, b: 32, l: 64 };
type Furn = "airbnb" | "najem" | "prazdny";

const CalculatorSection = () => {
  const { lang } = useLanguage();
  const locLabel = (l: CalcLoc) =>
    l === "jinde" ? t(lang, "calc_loc_other") : `Praha ${l.replace("praha", "")}`;
  // Sdílený odkaz (?byt=praha2-2kk-year-6h-53m) otevře kalkulačku se stejným nastavením.
  const initial = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("byt");
    if (!raw) return null;
    const [loc, sz, se, g, a] = raw.split("-");
    const num = (v: string | undefined, suffix: string) =>
      v && v.endsWith(suffix) && Number.isFinite(+v.slice(0, -1)) ? +v.slice(0, -1) : null;
    return {
      location: LOCATIONS.some((l) => l === loc) ? (loc as CalcLoc) : null,
      size: sizes.some((x) => x.value === sz) ? (sz as SizeKey) : null,
      season: se && SEASON_KEYS.includes(se as SeasonKey) ? (se as SeasonKey) : null,
      guests: num(g, "h"),
      m2: num(a, "m"),
    };
  }, []);
  const [location, setLocation] = useState<CalcLoc>(initial?.location ?? "praha1");
  const [size, setSize] = useState<SizeKey>(initial?.size ?? "2kk");
  const [guests, setGuests] = useState<number>(initial?.guests ?? SIZE_PRESET[initial?.size ?? "2kk"].guests);
  const [m2, setM2] = useState<number>(initial?.m2 ?? SIZE_PRESET[initial?.size ?? "2kk"].m2);
  const pickSize = (v: SizeKey) => { setSize(v); setGuests(SIZE_PRESET[v].guests); setM2(SIZE_PRESET[v].m2); };
  const [season, setSeason] = useState<SeasonKey>(initial?.season ?? "year");
  const [tab, setTab] = useState<"month" | "fiveyears">("month");
  const [furn, setFurn] = useState<Furn>("najem");
  const [shared, setShared] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (initial) document.getElementById("kalkulacka")?.scrollIntoView({ block: "start" });
  }, [initial]);

  const shareResult = async () => {
    const url = `${window.location.origin}${window.location.pathname}?byt=${location}-${size}-${season}-${guests}h-${m2}m#kalkulacka`;
    trackEvent("calc_share", { district: location, size, season });
    try {
      if (navigator.share) { await navigator.share({ title: "Antam Homes", url }); return; }
    } catch { /* user cancelled — fall through to copy */ }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2500);
    } catch {
      window.prompt(t(lang, "calc_share_copy"), url);
    }
  };

  // Jediný zdroj výpočtu je lib/yield: realizovaná tržní cena za noc pro
  // lokalitu a kapacitní pásmo × sezóna × obsazenost 85 %, minus provize
  // platformy, dělení 70/30. Nájem řídí PLOCHA (rentFor), ne dispozice sama.
  const result = useMemo(() => {
    const r = ownerMonthly(location, guests, { season });
    const year = ownerMonthly(location, guests);
    const ltr = location === "jinde" ? 0 : rentFor(location as LocationKey, size, m2);
    const ratio = r.supported && ltr > 0 ? r.net / ltr : 0;
    return { r, year, ltr, ratio };
  }, [location, guests, size, m2, season]);

  // Záložka Za 5 let: STEJNÝ stav a STEJNÉ funkce jako měsíční odhad.
  // Od měsíčního čísla se odečítají energie a obnova vybavení; obojí je
  // vypsané pod grafem, aby bylo vidět, proč se pětileté číslo liší.
  const d = useMemo(() => {
    if (!result.year.supported || location === "jinde") return null;
    const net = result.year.net;
    const energy = ENERGY[size];
    const renew = (RENEW_PER_ROOM_YEAR * ROOMS[size]) / 12;
    const y1 = net * YEAR_ONE_RAMP - energy - renew;
    const y2 = net - energy - renew;
    const rent = rentFor(location as LocationKey, size, m2);
    const kit =
      furn === "prazdny" ? EMPTY_PER_ROOM * ROOMS[size]
      : furn === "najem" ? KIT_PER_ROOM * ROOMS[size]
      : 0;
    const projectFee = kit > PROJECT_FEE_THRESHOLD ? Math.round(kit * PROJECT_FEE) : 0;
    const setup = LAUNCH_FEE + kit + projectFee;
    const lt = [0], str = [-setup];
    for (let i = 1; i <= MONTHS; i++) {
      const yr = Math.floor((i - 1) / 12);
      lt.push(lt[i - 1] + rent * (1 + RENT_GROWTH) ** yr);
      str.push(str[i - 1] + (i <= 12 ? y1 : y2 * (1 + STR_GROWTH) ** yr));
    }
    let payback: number | null = null, cross: number | null = null;
    for (let i = 1; i <= MONTHS; i++) {
      if (payback === null && str[i] >= 0) payback = i;
      if (cross === null && str[i] >= lt[i]) cross = i;
    }
    return { lt, str, rent, y2, setup, kit, projectFee, energy, renew, payback, cross, gap: str[MONTHS] - lt[MONTHS] };
  }, [result.year, location, size, m2, furn]);

  const czk = (n: number) => `${Math.round(n).toLocaleString("cs-CZ").replace(/ /g, " ")} Kč`;
  const short = (n: number) =>
    Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".", ",")} mil.` : `${Math.round(n / 1000)} tis.`;
  const supported = result.r.supported;

  const px = (i: number) => PAD.l + (W - PAD.l - PAD.r) * (i / MONTHS);
  const maxY = d ? Math.max(d.lt[MONTHS], d.str[MONTHS]) : 1;
  const minY = d ? Math.min(0, d.str[0]) : 0;
  const py = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - minY) / (maxY - minY));
  const path = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  const gridStep = maxY > 2.4e6 ? 1e6 : maxY > 1.2e6 ? 5e5 : 2.5e5;
  const grid: number[] = [];
  if (d) for (let v = Math.ceil(minY / gridStep) * gridStep; v <= maxY; v += gridStep) grid.push(v);
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const sx = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(MONTHS, Math.round((sx - PAD.l) / ((W - PAD.l - PAD.r) / MONTHS)))));
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-sm border font-body text-[13px] transition-colors ${
      active ? "bg-gold/15 text-gold font-semibold border-gold/50"
             : "bg-primary-foreground/5 text-primary-foreground/70 border-primary-foreground/15 hover:border-gold/40"
    }`;

  return (
    <section id="kalkulacka" className="section bg-muted/30 scroll-mt-16">
      <div className="container-narrow">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{t(lang, "calc_label")}</p>
          <h2 className="h-section text-foreground">
            {t(lang, "calc_title1")}
            <span className="text-gradient-gold">{t(lang, "calc_title2")}</span>
          </h2>
          <p className="lead">{t(lang, "calc_desc")}</p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 md:items-start">
          <Reveal id="kalkulacka-zadani" delay={0.05} className="space-y-8 order-2 md:order-1 scroll-mt-20 min-w-0">
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                {t(lang, "calc_location")}
              </label>
              {/* Mobile: native select (úspora místa) */}
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as CalcLoc)}
                className="sm:hidden w-full min-w-0 max-w-full px-4 py-3 bg-card border border-border rounded-sm font-body text-sm font-medium text-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{locLabel(l)}</option>
                ))}
              </select>
              {/* Desktop: tlačítka */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-2">
                {LOCATIONS.map((l) => (
                  <button key={l} type="button" onClick={() => setLocation(l)}
                    className={`px-3 py-2.5 rounded-sm text-sm font-body font-medium transition-all border ${
                      location === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {locLabel(l)}
                  </button>
                ))}
              </div>
            </div>

            {/* Dispozice je viditelně jen rychlá předvolba: předvyplní kapacitu
                a plochu; podle ní se počítají energie a obnova vybavení. */}
            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-1.5">
                <Home className="w-4 h-4 text-gold" />
                {t(lang, "calc_size")}
              </label>
              <p className="font-body text-[12.5px] text-muted-foreground leading-snug mb-3">{t(lang, "calc_size_hint")}</p>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <button key={s.value} type="button" onClick={() => pickSize(s.value)}
                    className={`px-2 sm:px-3 py-3 min-w-0 rounded-sm text-sm font-body font-semibold transition-all border ${
                      size === s.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="calc-guests" className="flex items-baseline justify-between gap-3 font-body text-sm font-semibold text-foreground mb-2">
                  <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gold" />{t(lang, "calc_guests")}</span>
                  <span className="font-display text-lg text-gold-deep tnum">{guests}</span>
                </label>
                <input id="calc-guests" type="range" min={2} max={14} step={1} value={guests}
                  onChange={(e) => setGuests(+e.target.value)}
                  className="w-full accent-[hsl(var(--gold))]" />
                <p className="mt-1.5 font-body text-[12.5px] text-muted-foreground leading-snug">{t(lang, "calc_guests_hint")}</p>
              </div>
              <div>
                <label htmlFor="calc-m2" className="flex items-baseline justify-between gap-3 font-body text-sm font-semibold text-foreground mb-2">
                  <span className="flex items-center gap-2"><Ruler className="w-4 h-4 text-gold" />{t(lang, "calc_area")}</span>
                  <span className="font-display text-lg text-gold-deep tnum">{m2}&nbsp;m²</span>
                </label>
                <input id="calc-m2" type="range" min={18} max={140} step={1} value={m2}
                  onChange={(e) => setM2(+e.target.value)}
                  className="w-full accent-[hsl(var(--gold))]" />
                <p className="mt-1.5 font-body text-[12.5px] text-muted-foreground leading-snug">{t(lang, "calc_area_hint")}</p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 font-body text-sm font-semibold text-foreground mb-3">
                <Calculator className="w-4 h-4 text-gold" />
                {t(lang, "calc_season")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SEASON_KEYS.map((key) => (
                  <button key={key} type="button" onClick={() => setSeason(key)}
                    className={`flex flex-col px-3 py-3 rounded-sm font-body transition-all border text-left leading-tight ${
                      season === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground hover:border-gold/50"
                    }`}
                  >
                    <span className="text-[13px] font-semibold truncate">
                      {t(lang, `calc_season_${key}` as const)}
                    </span>
                    <span className={`text-[11px] mt-0.5 ${season === key ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {t(lang, `calc_season_${key}_sub` as const)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex items-start order-1 md:order-2 md:sticky md:top-24">
            <div className="w-full bg-gradient-dark rounded-md p-5 sm:p-7 md:p-9 space-y-4 sm:space-y-5">
              {!supported ? (
                /* Lokalita bez vlastních tržních dat: žádné číslo, poctivé
                   zavření s cestou k propočtu do 24 hodin. */
                <div className="space-y-4">
                  <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em]">
                    {t(lang, "calc_net")}
                  </p>
                  <p className="font-display text-2xl sm:text-[1.75rem] font-semibold text-primary-foreground leading-snug text-balance">
                    {t(lang, "calc_unsupported_title")}
                  </p>
                  <p className="font-body text-[14.5px] text-primary-foreground/80 leading-relaxed">
                    {t(lang, "calc_unsupported_text")}
                  </p>
                  <p className="md:hidden flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
                    <span>{locLabel(location)}</span>
                    <a href="#kalkulacka-zadani" className="ml-1 inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-foreground/30 hover:text-primary-foreground">
                      <Pencil className="w-3 h-3" aria-hidden="true" />
                      {t(lang, "calc_edit")}
                    </a>
                  </p>
                  <a
                    href="#kontakt"
                    onClick={() => {
                      trackEvent("cta_click", { location: "calculator_unsupported", target: "contact", district: location, size });
                      window.dispatchEvent(new CustomEvent("antam:prefill-contact", {
                        detail: { location: locLabel(location), size: sizes.find((s) => s.value === size)?.label ?? "" },
                      }));
                    }}
                    className="btn btn-primary-inverse w-full"
                  >
                    {t(lang, "calc_cta")}
                  </a>
                </div>
              ) : (
                <>
                  {/* Záložky: Měsíčně / Za 5 let. Stejný vstup, stejné číslo. */}
                  <div className="flex gap-1 rounded-sm bg-primary-foreground/10 p-1" role="tablist">
                    {(["month", "fiveyears"] as const).map((tb) => (
                      <button key={tb} type="button" role="tab" aria-selected={tab === tb}
                        onClick={() => { setTab(tb); if (tb === "fiveyears") trackEvent("calc_tab_5y", { district: location }); }}
                        className={`flex-1 px-3 py-2 rounded-sm font-body text-[13px] font-semibold transition-colors ${
                          tab === tb ? "bg-card text-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
                        }`}
                      >
                        {t(lang, tb === "month" ? "calc_tab_month" : "calc_tab_5y")}
                      </button>
                    ))}
                  </div>

                  {tab === "month" && result.r.supported && (
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                        {t(lang, "calc_net")}
                      </p>
                      <p className="font-body text-[12px] text-primary-foreground/60 -mt-0.5 mb-1">
                        {t(lang, "calc_net_sub")}
                      </p>
                      <p className="flex flex-wrap items-baseline gap-x-2 leading-tight tnum">
                        <span className="font-display text-[2.25rem] min-[360px]:text-[2.75rem] sm:text-5xl md:text-[3.25rem] font-bold text-gradient-gold-on-dark whitespace-nowrap">
                          ~{(Math.round(result.r.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč
                        </span>
                        <span className="font-body text-sm font-normal text-primary-foreground/65 whitespace-nowrap">
                          {t(lang, "calc_month_suffix")}
                        </span>
                      </p>
                      {/* Jedna věta: na čem číslo stojí a co není. */}
                      <p className="mt-2 font-body text-[13px] text-primary-foreground/75 leading-relaxed">
                        {t(lang, "calc_basis")}
                      </p>
                      <p className="md:hidden mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-primary-foreground/70">
                        <span>{locLabel(location)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{t(lang, `calc_season_${season}` as const)}</span>
                        <a href="#kalkulacka-zadani" className="ml-1 inline-flex items-center gap-1 underline underline-offset-4 decoration-primary-foreground/30 hover:text-primary-foreground">
                          <Pencil className="w-3 h-3" aria-hidden="true" />
                          {t(lang, "calc_edit")}
                        </a>
                      </p>
                    </div>

                    {/* Teaser na pětiletou záložku s konkrétním číslem. */}
                    {d && (
                      <button type="button" onClick={() => setTab("fiveyears")}
                        className="flex w-full items-center justify-between gap-3 rounded-sm border border-gold/30 bg-gold/10 px-3.5 py-2.5 text-left font-body text-[13px] text-primary-foreground/90 transition-colors hover:bg-gold/15"
                      >
                        <span className="tnum">
                          {t(lang, "calc_teaser_1")}{" "}
                          <strong className="text-gold font-semibold">+{short(d.gap)} Kč</strong>{" "}
                          {t(lang, "calc_teaser_2")}
                        </span>
                        <ChevronRight className="w-4 h-4 shrink-0 text-gold" aria-hidden="true" />
                      </button>
                    )}

                    <div className="border-t border-primary-foreground/10 pt-4">
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-2">
                        {t(lang, "calc_split_label")}
                      </p>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-primary-foreground/10" role="img" aria-label={t(lang, "calc_split_aria")}>
                        <span className="block h-full w-[70%] bg-gold" />
                        <span className="block h-full w-[30%] bg-primary-foreground/25" />
                      </div>
                      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-body text-[13px] tnum">
                        <span className="text-primary-foreground/85">
                          <strong className="text-gold font-semibold">70 %</strong> {t(lang, "calc_split_owner")}{" "}
                          <span className="text-gold/90">= ~{(Math.round(result.r.net / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč</span>
                        </span>
                        <span className="text-primary-foreground/65 text-right">
                          <strong className="font-semibold text-primary-foreground/80">30 %</strong> {t(lang, "calc_split_fee")}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-primary-foreground/10 pt-4">
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                        {t(lang, "calc_ltr")}
                      </p>
                      <p className="font-display text-xl font-semibold text-primary-foreground/60 tnum">
                        ~{(Math.round(result.ltr / 1000) * 1000).toLocaleString("cs-CZ")}&nbsp;Kč
                      </p>
                      {result.ratio > 0 && (
                        <p className="font-body text-[13px] text-primary-foreground/85 mt-2">
                          → {t(lang, "calc_approx_prefix")}{" "}
                          <strong className="text-gold">
                            {(Math.round(result.ratio * 10) / 10).toLocaleString("cs-CZ")}×{" "}
                          </strong>
                          {t(lang, "calc_vs_ltr")}
                        </p>
                      )}
                    </div>

                    {/* Krytí menších škod: počítá se z téže dispozice jako odhad.
                        Pravidlo žije v lib/yield. */}
                    <div className="border-t border-primary-foreground/10 pt-4">
                      <p className="font-body text-xs text-primary-foreground/65 uppercase tracking-[0.15em] mb-1">
                        {t(lang, "calc_cover_label")}
                      </p>
                      <p className="font-display text-lg font-semibold text-primary-foreground/85 tnum">
                        {annualDamageCover(ROOMS[size]).toLocaleString("cs-CZ")}&nbsp;Kč{" "}
                        <span className="font-body text-[13px] font-normal text-primary-foreground/60">
                          {t(lang, "calc_cover_suffix")}
                        </span>
                      </p>
                      <p className="mt-1 font-body text-[12px] text-primary-foreground/60 leading-relaxed">
                        {t(lang, "calc_cover_note")}
                      </p>
                    </div>

                    <p className="font-body text-[12px] text-primary-foreground/60 leading-relaxed border-t border-primary-foreground/10 pt-4">
                      {t(lang, "calc_excluded_note")}
                    </p>
                    <p className="font-body text-[12px] text-primary-foreground/60 leading-relaxed">
                      {t(lang, "calc_energy_note")}
                    </p>
                  </div>
                  )}

                  {tab === "fiveyears" && d && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(["airbnb", "najem", "prazdny"] as Furn[]).map((f) => (
                        <button key={f} type="button" onClick={() => setFurn(f)} aria-pressed={furn === f} className={chip(furn === f)}>
                          {t(lang, `hz_furn_${f}` as const)}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-sm bg-card p-3 relative">
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

                    <ul className="grid grid-cols-2 gap-px bg-primary-foreground/10 border border-primary-foreground/10 rounded-sm overflow-hidden list-none m-0 p-0">
                      {([
                        [t(lang, "hz_stat_invest"), czk(-d.setup)],
                        [t(lang, "hz_stat_payback"),
                          d.payback ? `${d.payback} ${t(lang, d.payback === 1 ? "hz_months_one" : d.payback < 5 ? "hz_months_few" : "hz_months")}` : "?"],
                        [t(lang, "hz_stat_cross"), d.cross ? `${d.cross}. ${t(lang, "hz_month")}` : "?"],
                        [t(lang, "hz_stat_gap"), `${d.gap >= 0 ? "+" : ""}${czk(d.gap)}`],
                      ] as [string, string][]).map(([k, v]) => (
                        <li key={k} className="bg-primary-foreground/5 px-3 py-2.5">
                          <p className="font-body text-[10.5px] uppercase tracking-[0.12em] text-primary-foreground/60">{k}</p>
                          <p className="font-display text-[17px] mt-0.5 tnum text-primary-foreground">{v}</p>
                        </li>
                      ))}
                    </ul>

                    {/* Proč se pětileté číslo liší od měsíčního: odečtené položky viditelně. */}
                    <div className="font-body text-[12.5px] text-primary-foreground/70 leading-relaxed tnum space-y-1">
                      <p className="flex justify-between gap-3"><span>{t(lang, "calc_5y_energy")}</span><span>−{czk(d.energy)} / {t(lang, "hz_month")}</span></p>
                      <p className="flex justify-between gap-3"><span>{t(lang, "calc_5y_renew")}</span><span>−{czk(d.renew)} / {t(lang, "hz_month")}</span></p>
                      <p className="flex justify-between gap-3"><span>{t(lang, "calc_5y_rent")}</span><span>{czk(d.rent)} / {t(lang, "hz_month")}</span></p>
                    </div>
                    <p className="font-body text-[12px] text-primary-foreground/60 leading-relaxed border-t border-primary-foreground/10 pt-3">
                      {t(lang, "hz_growth")} {t(lang, "hz_assume_5")}
                    </p>
                  </div>
                  )}

                  <p className="font-body text-[13px] text-primary-foreground/75 leading-relaxed border-t border-primary-foreground/10 pt-4">
                    {t(lang, "calc_bridge")}
                  </p>

                  <div className="space-y-3">
                    <a
                      href="#kontakt"
                      onClick={() => {
                        trackEvent("cta_click", { location: "calculator", target: "contact", district: location, size });
                        window.dispatchEvent(
                          new CustomEvent("antam:prefill-contact", {
                            detail: { location: locLabel(location), size: sizes.find((s) => s.value === size)?.label ?? "" },
                          })
                        );
                      }}
                      className="btn btn-primary-inverse w-full"
                    >
                      {t(lang, "calc_cta")}
                    </a>
                    <button
                      type="button"
                      onClick={shareResult}
                      className="mx-auto flex items-center gap-1.5 font-body text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors underline underline-offset-4 decoration-primary-foreground/25"
                    >
                      <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {shared ? t(lang, "calc_share_done") : t(lang, "calc_share")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>

        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto border-t border-border/60 pt-4 sm:pt-5">
          <p className="font-body text-xs md:text-[13px] text-foreground/80 text-center leading-relaxed mb-3 sm:mb-4">
            {t(lang, "calc_method_note")}
          </p>
          <details className="sm:hidden group">
            <summary className="list-none cursor-pointer font-body text-xs text-muted-foreground text-center underline underline-offset-4 decoration-border [&::-webkit-details-marker]:hidden">
              {t(lang, "calc_disclaimer_toggle")}
            </summary>
            <p className="mt-3 font-body text-xs text-foreground/75 text-center leading-relaxed">
              {t(lang, "calc_disclaimer")}
            </p>
          </details>
          <p className="hidden sm:block font-body text-xs md:text-[13px] text-foreground/75 text-center leading-relaxed">
            {t(lang, "calc_disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
