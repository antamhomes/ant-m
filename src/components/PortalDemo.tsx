import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import Wordmark from "@/components/Wordmark";

/**
 * Ukázka portálu majitele: vlevo kalendář, vpravo panel majitele, stejně jako
 * ve skutečném portálu. Data jsou vymyšlená, protože skutečné obrazovky nesou
 * jména hostů a příjem konkrétní majitelky.
 *
 * Byt A / srpen je dopočítaný tak, aby seděl na vzorové vyúčtování pod ukázkou:
 * tržby 99 800 − úklid 8 476 = čistý výnos 91 324, z toho majiteli 63 927 a
 * odměna 27 397. Nic z toho se nepíše ručně, počítá se to z rezervací, takže
 * se to nemůže rozejít.
 */
type Booking = { start: number; nights: number; src: "A" | "B" | "own"; guest?: string; amount?: number };
type MonthData = { key: "pdm_m07" | "pdm_m08"; days: number; firstDow: number; cleaning: number; bookings: Booking[] };
type FlatData = { id: string; nameKey: "pdm_flat1" | "pdm_flat2"; locKey: "pdm_loc1" | "pdm_loc2"; blockedYtd: number; months: MonthData[] };

const FLATS: FlatData[] = [
  {
    id: "a1", nameKey: "pdm_flat1", locKey: "pdm_loc1", blockedYtd: 3,
    months: [
      { key: "pdm_m07", days: 31, firstDow: 3, cleaning: 7800, bookings: [
        { start: 1, nights: 4, src: "A", guest: "Charlotte", amount: 13200 },
        { start: 6, nights: 3, src: "B", guest: "Lukas", amount: 9800 },
        { start: 10, nights: 5, src: "A", guest: "Emma", amount: 16400 },
        { start: 16, nights: 3, src: "own" },
        { start: 20, nights: 4, src: "B", guest: "Marco", amount: 13100 },
        { start: 25, nights: 6, src: "A", guest: "Sofia", amount: 19700 } ] },
      { key: "pdm_m08", days: 31, firstDow: 6, cleaning: 8476, bookings: [
        { start: 1, nights: 5, src: "A", guest: "Ingrid", amount: 16800 },
        { start: 6, nights: 4, src: "B", guest: "Tomás", amount: 13400 },
        { start: 10, nights: 6, src: "A", guest: "Yuki", amount: 20100 },
        { start: 16, nights: 5, src: "B", guest: "Anna", amount: 16600 },
        { start: 21, nights: 4, src: "A", guest: "Diego", amount: 13300 },
        { start: 25, nights: 6, src: "A", guest: "Noor", amount: 19600 } ] },
    ],
  },
  {
    id: "a2", nameKey: "pdm_flat2", locKey: "pdm_loc2", blockedYtd: 0,
    months: [
      { key: "pdm_m07", days: 31, firstDow: 3, cleaning: 5400, bookings: [
        { start: 2, nights: 3, src: "B", guest: "Nora", amount: 7300 },
        { start: 7, nights: 4, src: "A", guest: "Pavel", amount: 9800 },
        { start: 13, nights: 5, src: "A", guest: "Hana", amount: 11900 },
        { start: 20, nights: 3, src: "B", guest: "Luca", amount: 7600 },
        { start: 25, nights: 4, src: "A", guest: "Mia", amount: 10200 } ] },
      { key: "pdm_m08", days: 31, firstDow: 6, cleaning: 5000, bookings: [
        { start: 1, nights: 4, src: "A", guest: "Jonas", amount: 9700 },
        { start: 6, nights: 3, src: "B", guest: "Klára", amount: 7400 },
        { start: 11, nights: 5, src: "A", guest: "Ahmed", amount: 12100 },
        { start: 19, nights: 4, src: "A", guest: "Léa", amount: 9900 },
        { start: 26, nights: 3, src: "B", guest: "Filip", amount: 7500 } ] },
    ],
  },
];

const czk = (n: number) => Math.round(n).toLocaleString("cs-CZ").replace(/\s/g, " ");

const PortalDemo = () => {
  const { lang } = useLanguage();
  const [flatIdx, setFlatIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(1);
  const flat = FLATS[flatIdx];
  const m = flat.months[monthIdx];

  const c = useMemo(() => {
    const paid = m.bookings.filter((b) => b.src !== "own");
    const revenue = paid.reduce((s, b) => s + (b.amount ?? 0), 0);
    const nights = paid.reduce((s, b) => s + b.nights, 0);
    const net = revenue - m.cleaning;
    const payout = Math.round(net * 0.7);
    return { paid, revenue, nights, net, payout, fee: net - payout,
      adr: Math.round(revenue / nights), occ: Math.round((nights / m.days) * 100),
      blocked: m.bookings.filter((b) => b.src === "own").reduce((s, b) => s + b.nights, 0) };
  }, [m]);

  const weeks = useMemo(() => {
    const lead = m.firstDow - 1;
    const rows = Math.ceil((lead + m.days) / 7);
    return Array.from({ length: rows }, (_, r) => ({
      r, lead,
      segs: m.bookings.flatMap((b) => {
        const from = lead + b.start - 1, to = from + b.nights - 1;
        const s = Math.max(from, r * 7), e = Math.min(to, r * 7 + 6);
        return e < s ? [] : [{ b, col: s - r * 7 + 1, span: e - s + 1, head: s === from }];
      }),
    }));
  }, [m]);

  const pct = lang === "cs" ? " %" : "%";
  const dows = (t(lang, "pdm_dows") as string).split(",");

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <div className="bg-gradient-dark px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <Wordmark on="dark" size="sm" />
          <span className="font-body text-[11px] uppercase tracking-[0.13em] text-white/50 truncate">{t(lang, "pdm_name")}</span>
        </div>
        <span className="font-body text-[10px] uppercase tracking-[0.13em] text-gold-on-dark">{t(lang, "pdm_tag")}</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div role="tablist" aria-label={t(lang, "pdm_flats_aria")} className="flex gap-1.5">
            {FLATS.map((f, i) => (
              <button key={f.id} type="button" role="tab" aria-selected={i === flatIdx} onClick={() => setFlatIdx(i)}
                className={`font-body text-[12.5px] px-3 py-1.5 rounded-sm border transition-colors ${
                  i === flatIdx ? "border-foreground/70 bg-foreground/[0.06] text-foreground font-medium"
                                : "border-border text-muted-foreground hover:border-foreground/35"}`}>
                {t(lang, f.nameKey)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setMonthIdx((i) => Math.max(0, i - 1))} disabled={monthIdx === 0}
              aria-label={t(lang, "pdm_prev")} className="p-1.5 rounded-sm border border-border text-muted-foreground disabled:opacity-35">
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="font-display text-[15px] text-foreground min-w-[8.5rem] text-center tnum">{t(lang, m.key)}</span>
            <button type="button" onClick={() => setMonthIdx((i) => Math.min(flat.months.length - 1, i + 1))}
              disabled={monthIdx === flat.months.length - 1} aria-label={t(lang, "pdm_next")}
              className="p-1.5 rounded-sm border border-border text-muted-foreground disabled:opacity-35">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Kalendář vlevo, panel majitele vpravo, stejně jako v portálu. */}
        <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5 lg:gap-7">
          <div>
            <div className="grid grid-cols-7 gap-[2px] mb-1">
              {dows.map((d) => (
                <span key={d} className="font-body text-[10px] uppercase tracking-[0.06em] text-muted-foreground text-center">{d}</span>
              ))}
            </div>
            {weeks.map(({ r, lead, segs }) => (
              <div key={r} className="grid grid-cols-7 gap-[2px] mb-[2px]">
                {Array.from({ length: 7 }, (_, col) => {
                  const day = r * 7 + col - lead + 1;
                  return (
                    <span key={col} style={{ gridColumn: col + 1, gridRow: 1 }}
                      className="h-9 bg-muted/60 rounded-[2px] pl-1 pt-0.5 font-body text-[10px] text-muted-foreground tnum">
                      {day > 0 && day <= m.days ? day : ""}
                    </span>
                  );
                })}
                {segs.map(({ b, col, span, head }, i) => (
                  <span key={i} style={{ gridColumn: `${col} / span ${span}`, gridRow: 1 }}
                    className={`self-end mb-1 mx-[2px] h-4 rounded-[2px] flex items-center px-1.5 overflow-hidden whitespace-nowrap font-body text-[9.5px] ${
                      b.src === "own" ? "border border-dashed border-gold text-gold-deep"
                      : b.src === "A" ? "bg-[#C2705A]/85 text-white" : "bg-[#5B7FA6]/85 text-white"}`}>
                    {head ? (b.src === "own" ? t(lang, "pdm_you") : b.guest) : ""}
                  </span>
                ))}
              </div>
            ))}
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 font-body text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><i className="w-3 h-2.5 rounded-[2px] bg-[#C2705A]/85 inline-block" aria-hidden="true" />Airbnb</span>
              <span className="flex items-center gap-1.5"><i className="w-3 h-2.5 rounded-[2px] bg-[#5B7FA6]/85 inline-block" aria-hidden="true" />Booking.com</span>
              <span className="flex items-center gap-1.5"><i className="w-3 h-2.5 rounded-[2px] border border-dashed border-gold inline-block" aria-hidden="true" />{t(lang, "pdm_your_block")}</span>
            </div>
          </div>

          <div>
            <div className="bg-gradient-dark rounded-sm px-4 py-4">
              <p className="font-body text-[10px] uppercase tracking-[0.14em] text-white/45">
                {t(lang, flat.locKey)} · {t(lang, "pdm_payout")}
              </p>
              <p className="mt-1.5 font-display font-semibold text-[#F7F1E8] tnum leading-none text-[clamp(1.9rem,3.4vw,2.5rem)]">
                {czk(c.payout)}&nbsp;Kč
              </p>
              <p className="mt-2 font-body text-[11.5px] text-white/55 tnum">
                {(t(lang, "pdm_payout_sub") as string).replace("{r}", czk(c.revenue)).replace("{n}", String(c.paid.length))}
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3.5">
              {([
                { k: "pdm_kpi_occ", v: `${c.occ}${pct}`, s: `${c.nights}/${m.days}` },
                { k: "pdm_kpi_net", v: `${czk(c.net)} Kč`, s: t(lang, "pdm_kpi_net_sub") },
                { k: "pdm_kpi_adr", v: `${czk(c.adr)} Kč`, s: t(lang, "pdm_kpi_adr_sub") },
                { k: "pdm_kpi_blocked", v: `${c.blocked}`, s: (t(lang, "pdm_kpi_blocked_sub") as string).replace("{y}", String(flat.blockedYtd)) },
              ] as const).map(({ k, v, s }) => (
                <div key={k}>
                  <dt className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{t(lang, k)}</dt>
                  <dd className="m-0 mt-1 font-display text-[1.15rem] font-semibold text-foreground tnum leading-none">{v}</dd>
                  <dd className="m-0 mt-0.5 font-body text-[11px] text-muted-foreground tnum">{s}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 border-t border-border pt-3">
              <p className="font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{t(lang, "pdm_stays")}</p>
              <ul className="m-0 mt-2 p-0 list-none">
                {c.paid.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 py-1.5 border-b border-border last:border-b-0">
                    <span className="min-w-0">
                      <span className="block font-body text-[13px] text-foreground truncate">{b.guest}</span>
                      <span className="block font-body text-[11px] text-muted-foreground tnum">
                        {b.start}. → {b.start + b.nights}. · {b.nights} {t(lang, "pdm_nights")}
                      </span>
                    </span>
                    <span className="font-display text-[14px] text-foreground tnum whitespace-nowrap">{czk(b.amount ?? 0)}&nbsp;Kč</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalDemo;
