import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/**
 * NABÍDKOVÝ LIST PRO MAJITELE (5. 11. 2026 večer). Nahrazuje TermSheet, který
 * počítal novou hypotéku kupujícího. Majitel byt už má, takže list ukazuje
 * jeho dvě alternativy (běžný nájem, jeho splátka) proti nájmu od Antam.
 * Stejný vzhled v hero (příklad) i v kalkulačce (jeho byt).
 */
type Props = {
  label: string;
  flat: string;
  ltr: string;
  payment: string | null;
  rent: string;
  rentSub?: string;
  vsLtr: string | null;
  cover: string | null;
  className?: string;
};

const OfferSheet = ({ label, flat, ltr, payment, rent, rentSub, vsLtr, cover, className = "" }: Props) => {
  const { lang } = useLanguage();
  const rows: [string, string][] = [[t(lang, "lz_sheet_ltr"), ltr]];
  if (payment) rows.push([t(lang, "lz_sheet_payment"), payment]);
  return (
    <aside aria-label={label} className={`relative bg-card border border-border shadow-[0_40px_80px_-50px_hsl(var(--charcoal)/0.35)] ${className}`}>
      <div className="px-6 sm:px-8 pt-6 pb-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 border-b border-border">
        <p className="font-body text-[11px] tracking-[0.2em] uppercase text-gold">{label}</p>
        <p className="font-body text-[11px] tracking-[0.08em] text-muted-foreground tnum sm:text-right">{flat}</p>
      </div>
      <dl className="px-6 sm:px-8 py-2 font-body text-[14px] tnum">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-6 py-3 border-b border-border">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="whitespace-nowrap text-foreground">{v}</dd>
          </div>
        ))}
        <div className="pt-6 pb-2">
          <dt className="text-[11px] tracking-[0.18em] uppercase text-gold">{t(lang, "lz_sheet_rent")}</dt>
          <dd className="mt-2 font-display text-[2.3rem] sm:text-[2.6rem] leading-none text-foreground">{rent}</dd>
          {rentSub && <dd className="mt-1.5 text-[12px] text-muted-foreground">{rentSub}</dd>}
        </div>
        {(vsLtr || cover) && (
          <div className="grid grid-cols-2 gap-6 pt-3 pb-5">
            {vsLtr && (
              <div>
                <dt className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">{t(lang, "lz_sheet_vs_ltr")}</dt>
                <dd className="mt-1.5 font-display text-[1.35rem] leading-none text-foreground">{vsLtr}</dd>
              </div>
            )}
            {cover && (
              <div className="text-right">
                <dt className="text-[11px] tracking-[0.16em] uppercase text-muted-foreground">{t(lang, "lz_sheet_cover")}</dt>
                <dd className="mt-1.5 font-display text-[1.35rem] leading-none text-foreground">{cover}</dd>
              </div>
            )}
          </div>
        )}
      </dl>
      <div className="px-6 sm:px-8 py-5 bg-secondary flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-6 font-body text-[12px] leading-relaxed text-muted-foreground">
        <p className="max-w-[40ch]">{t(lang, "lz_sheet_note")}</p>
        <div className="shrink-0 sm:text-right">
          <div className="w-24 sm:w-28 mb-1 border-b border-foreground" aria-hidden="true" />
          <span className="text-[10.5px] tracking-[0.12em] uppercase">{t(lang, "lz_sheet_sign")}</span>
        </div>
      </div>
    </aside>
  );
};

export default OfferSheet;
