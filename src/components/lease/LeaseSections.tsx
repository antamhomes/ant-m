import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import Reveal from "@/components/Reveal";

/**
 * SEKCE NOVÉ NABÍDKY (5. 11. 2026). Jeden soubor, protože mají společnou
 * kostru: číslo a popisek mosazí vlevo, obsah vpravo, linky místo rámečků.
 * Pořadí na stránce dává Index.tsx: Hero → 01 Dnešní matematika → Jak to
 * funguje (smyčka) → 02 Nabídka → 03 Co kdyby → 04 Z čeho platíme →
 * 05 Vaše splátka → 06 Které byty → 07 Otázky → Kontakt.
 */
const Head = ({ label, title, dark = false }: { label: TranslationKey; title: TranslationKey; dark?: boolean }) => {
  const { lang } = useLanguage();
  const h = t(lang, title);
  const color = dark ? "text-primary-foreground" : "text-foreground";
  // Bez druhého titulku: popisek je nadpis. Sloganové dvojice („Tři situace,
  // tři odpovědi") šly 5. 11. 2026 pryč, zněly jako reklama.
  if (!h) return <h2 className={`font-display font-medium text-[1.9rem] sm:text-[2.1rem] leading-[1.1] tracking-[-0.01em] max-w-[14ch] ${color}`}>{t(lang, label)}</h2>;
  return (
    <div>
      <p className="font-body text-[11px] tracking-[0.2em] uppercase text-gold">{t(lang, label)}</p>
      <h2 className={`mt-5 font-display font-medium text-[1.9rem] sm:text-[2.1rem] leading-[1.1] tracking-[-0.01em] max-w-[14ch] ${color}`}>{h}</h2>
    </div>
  );
};

const Grid = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`max-w-6xl mx-auto px-6 grid gap-10 lg:gap-16 lg:grid-cols-[17rem_1fr] ${className}`}>{children}</div>
);

/* 01 · Dnešní matematika */
export const LeaseProblem = () => {
  const { lang } = useLanguage();
  return (
    <section className="bg-background border-t border-border py-20 sm:py-24">
      <Grid>
        <Reveal><Head label="lz_problem_label" title="lz_problem_title" /></Reveal>
        <Reveal delay={0.1}>
          <ol className="m-0 p-0 list-none max-w-[52ch]">
            {(["lz_problem_1", "lz_problem_2", "lz_problem_3"] as const).map((k, i) => (
              <li key={k} className="grid grid-cols-[2.2rem_1fr] gap-4 py-5 border-t border-border first:border-t-0 lg:first:border-t">
                <span className="font-body text-[11px] tracking-[0.18em] text-gold tnum pt-1">0{i + 1}</span>
                <p className="font-body text-[16px] sm:text-[17px] leading-relaxed text-foreground text-pretty">{t(lang, k)}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Grid>
    </section>
  );
};

/* Jak to funguje: smyčka. Posoudíme byt → doneste hypotéku → podpis →
   nájem do banky → další byt, a šipka zpět na začátek. Na desktopu kruh
   v SVG, na mobilu svislý seznam se stejnou smyčkou slovy. */
const STEPS = [
  ["Pošlete byt", "Posoudíme ho do 24 hodin."],
  ["Doneste hypotéku", "30 % vlastních, 70 % banka."],
  ["Podpis", "Nájem na 36 měsíců, byt vybavíme."],
  ["Nájem na účet", "Každý měsíc, 5 dní před splátkou."],
  ["Další byt", "Příjem od firmy, banka půjčí dál."],
] as const;

export const LeaseFlow = () => {
  const { lang } = useLanguage();
  // Kruh: pět bodů po obvodu, šipka z pátého zpět do prvního je součást smyčky.
  const cx = 470, cy = 300, R = 205;
  const pts = STEPS.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / STEPS.length;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  return (
    <section id="jak" className="bg-background border-t border-border py-20 sm:py-24 scroll-mt-20">
      <Grid>
        <Reveal>
          <h2 className="font-display font-medium text-[1.9rem] sm:text-[2.1rem] leading-[1.1] tracking-[-0.01em] max-w-[14ch] text-foreground">
            {t(lang, "nav_jak")}
          </h2>
          <p className="mt-5 font-body text-[15px] leading-relaxed text-muted-foreground max-w-[30ch] text-pretty">
            Nájem od firmy je pro banku příjem. S ním jdete na další byt a kruh se zavře.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          {/* Desktop: kruh */}
          <div className="hidden md:block">
            <svg viewBox="0 0 940 600" className="w-full max-w-[760px] mx-auto" role="img" aria-label="Smyčka: pošlete byt, doneste hypotéku, podpis, nájem na účet, další byt">
              <defs>
                <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0L10 5L0 10z" fill="hsl(var(--gold))" />
                </marker>
              </defs>
              {/* obvod jako pět oblouků, každý se šipkou */}
              {pts.map((p, i) => {
                const q = pts[(i + 1) % pts.length];
                const a0 = Math.atan2(p.y - cy, p.x - cx), a1 = Math.atan2(q.y - cy, q.x - cx);
                const gap = 0.16;
                const s = { x: cx + R * Math.cos(a0 + gap), y: cy + R * Math.sin(a0 + gap) };
                const e = { x: cx + R * Math.cos(a1 - gap), y: cy + R * Math.sin(a1 - gap) };
                return (
                  <path key={i} d={`M${s.x} ${s.y} A${R} ${R} 0 0 1 ${e.x} ${e.y}`} fill="none"
                    stroke={i === pts.length - 1 ? "hsl(var(--gold))" : "hsl(var(--border))"} strokeWidth={i === pts.length - 1 ? 1.5 : 1}
                    strokeDasharray={i === pts.length - 1 ? "4 4" : undefined} markerEnd="url(#arr)" />
                );
              })}
              {pts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="22" fill="hsl(var(--card))" stroke="hsl(var(--gold))" strokeWidth="1" />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" letterSpacing="2" fill="hsl(var(--gold))">0{i + 1}</text>
                  {/* popisky vně kruhu */}
                  {(() => {
                    const dx = p.x - cx, dy = p.y - cy;
                    const len = Math.hypot(dx, dy);
                    const ox = (dx / len) * 46, oy = (dy / len) * 46;
                    const anchor = Math.abs(dx) < 40 ? "middle" : dx > 0 ? "start" : "end";
                    const ty = p.y + oy + (dy < -100 ? -6 : dy > 100 ? 14 : 4);
                    return (
                      <g>
                        <text x={p.x + ox} y={ty} textAnchor={anchor} fontFamily="var(--font-display)" fontSize="19" fill="hsl(var(--foreground))">{STEPS[i][0]}</text>
                        <text x={p.x + ox} y={ty + 20} textAnchor={anchor} fontFamily="var(--font-body)" fontSize="12.5" fill="hsl(var(--muted-foreground))">{STEPS[i][1]}</text>
                      </g>
                    );
                  })()}
                </g>
              ))}
              <text x={cx} y={cy + 8} textAnchor="middle" fontFamily="var(--font-display)" fontSize="26" fill="hsl(var(--foreground))">36 měsíců</text>
            </svg>
          </div>
          {/* Mobil: seznam */}
          <ol className="md:hidden m-0 p-0 list-none">
            {STEPS.map(([h, d], i) => (
              <li key={h} className="grid grid-cols-[2.2rem_1fr] gap-4 py-5 border-t border-border">
                <span className="font-body text-[11px] tracking-[0.18em] text-gold tnum pt-1.5">0{i + 1}</span>
                <div>
                  <p className="font-display text-[1.2rem] leading-tight text-foreground">{h}</p>
                  <p className="mt-1.5 font-body text-[14px] leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
            <li className="grid grid-cols-[2.2rem_1fr] gap-4 py-5 border-t border-gold/60">
              <span className="font-body text-gold" aria-hidden="true">↺</span>
              <p className="font-body text-[14px] text-foreground">Znovu od začátku.</p>
            </li>
          </ol>
        </Reveal>
      </Grid>
    </section>
  );
};

/* 02 · Nabídka */
export const LeaseOffer = () => {
  const { lang } = useLanguage();
  const rows = [1, 2, 3, 4, 5, 6, 7, 8] as const;
  return (
    <section id="nabidka" className="bg-background border-t border-border py-20 sm:py-24 scroll-mt-20">
      <Grid>
        <Reveal><Head label="lz_offer_label" title="lz_offer_title" /></Reveal>
        <Reveal delay={0.1}>
          <p className="mb-8 font-display text-[1.3rem] sm:text-[1.5rem] leading-snug text-foreground max-w-[30ch] text-balance">{t(lang, "lz_offer_lead")}</p>
          <dl className="m-0">
            {rows.map((n) => (
              <div key={n} className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-4 border-t border-border last:border-b font-body">
                <dt className="text-[15.5px] sm:text-[16px] text-foreground">{t(lang, `lz_offer_${n}` as TranslationKey)}</dt>
                <dd className="text-[14px] sm:text-[15px] text-muted-foreground tnum">{t(lang, `lz_offer_${n}_v` as TranslationKey)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 font-body text-[13.5px] text-muted-foreground max-w-[60ch]">{t(lang, "lz_offer_note")}</p>
        </Reveal>
      </Grid>
    </section>
  );
};

/* 03 · Co kdyby (tmavá) */
export const LeaseGuarantee = () => {
  const { lang } = useLanguage();
  return (
    <section className="bg-primary text-primary-foreground py-20 sm:py-24">
      <Grid>
        <Reveal><Head label="lz_guar_label" title="lz_guar_title" dark /></Reveal>
        <Reveal delay={0.1}>
          <dl className="m-0 grid sm:grid-cols-3 gap-x-10">
            {([1, 2, 3] as const).map((n) => (
              <div key={n} className="py-6 sm:py-0 border-t sm:border-t-0 border-primary-foreground/15">
                <dt className="font-display text-[1.35rem] leading-tight text-primary-foreground">{t(lang, `lz_guar_${n}_q` as TranslationKey)}</dt>
                <dd className="mt-3 font-body text-[14.5px] leading-relaxed text-primary-foreground/75 text-pretty">{t(lang, `lz_guar_${n}_a` as TranslationKey)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Grid>
    </section>
  );
};

/* 04 · Z čeho platíme */
export const LeaseWhy = () => {
  const { lang } = useLanguage();
  return (
    <section className="bg-background py-20 sm:py-24">
      <Grid>
        <Reveal><Head label="lz_why_label" title="lz_why_title" /></Reveal>
        <Reveal delay={0.1}>
          <p className="font-body text-[17px] sm:text-[18px] leading-relaxed text-foreground max-w-[52ch] text-pretty">{t(lang, "lz_why_p")}</p>
          <p className="mt-8 pt-6 border-t border-border font-display text-[1.15rem] sm:text-[1.3rem] leading-snug text-foreground max-w-[40ch] tnum">{t(lang, "lz_why_proof")}</p>
        </Reveal>
      </Grid>
    </section>
  );
};

/* 06 · Které byty */
export const LeaseWhich = () => {
  const { lang } = useLanguage();
  return (
    <section className="bg-background border-t border-border py-20 sm:py-24">
      <Grid>
        <Reveal><Head label="lz_which_label" title="lz_which_title" /></Reveal>
        <Reveal delay={0.1}>
          <p className="font-body text-[17px] leading-relaxed text-foreground max-w-[48ch] text-pretty">{t(lang, "lz_which_p")}</p>
        </Reveal>
      </Grid>
    </section>
  );
};

/* 07 · Otázky */
export const LeaseFaq = () => {
  const { lang } = useLanguage();
  return (
    <section id="faq" className="bg-background border-t border-border py-20 sm:py-24 scroll-mt-20">
      <Grid>
        <Reveal><Head label="lz_faq_label" title="lz_faq_title" /></Reveal>
        <Reveal delay={0.1}>
          <dl className="m-0">
            {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((n) => (
              <div key={n} className="py-6 border-t border-border last:border-b grid gap-2 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-10">
                <dt className="font-display text-[1.15rem] leading-snug text-foreground">{t(lang, `lz_faq${n}_q` as TranslationKey)}</dt>
                <dd className="font-body text-[14.5px] leading-relaxed text-muted-foreground text-pretty max-w-[60ch]">{t(lang, `lz_faq${n}_a` as TranslationKey)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Grid>
    </section>
  );
};
