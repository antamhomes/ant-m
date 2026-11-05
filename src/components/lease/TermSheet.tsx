import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { czk, LEASE_MONTHS, type LeaseQuote } from "@/lib/lease";

/**
 * NABÍDKOVÝ LIST (5. 11. 2026): jediný vizuální prvek nové nabídky. Bílý
 * papír, linky, tabulková čísla, podpisová čára. V hero ukazuje příklad,
 * v sekci Vaše splátka číslo návštěvníka. Vzhled je stejný, ať si ho člověk
 * poznal už nahoře.
 */
type Props = {
  quote: LeaseQuote;
  label: string;
  flat: string;
  className?: string;
};

const pct = (r: number) => `${(r * 100).toFixed(2).replace(".", ",")} %`;

const TermSheet = ({ quote, label, flat, className = "" }: Props) => {
  const { lang } = useLanguage();
  const rent = quote.rent ?? quote.payment;
  const rest = quote.rent === null ? null : quote.shortfall;
  return (
    <aside
      className={`relative bg-card border border-border shadow-[0_40px_80px_-50px_hsl(var(--charcoal)/0.35)] ${className}`}
      aria-label={label}
    >
      <div className="px-6 sm:px-8 pt-6 pb-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 border-b border-border">
        <p className="font-body text-[11px] tracking-[0.2em] uppercase text-gold">{label}</p>
        <p className="font-body text-[11px] tracking-[0.08em] text-muted-foreground tnum sm:text-right">{flat}</p>
      </div>
      <dl className="px-6 sm:px-8 py-2 font-body text-[14px] tnum">
        {[
          [t(lang, "lz_sheet_price"), czk(quote.price)],
          [t(lang, "lz_sheet_own"), czk(quote.own)],
          [`${t(lang, "lz_sheet_loan")}, ${pct(quote.rate)}`, czk(quote.loan)],
          [t(lang, "lz_sheet_payment"), czk(quote.payment)],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-6 py-3 border-b border-border">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="whitespace-nowrap text-foreground">{v}</dd>
          </div>
        ))}
        <div className="flex items-end justify-between gap-6 pt-6 pb-4 flex-wrap">
          <div>
            <dt className="text-[11px] tracking-[0.18em] uppercase text-gold">{t(lang, "lz_sheet_rent")}</dt>
            <dd className="mt-2 font-display text-[2.4rem] sm:text-[2.6rem] leading-none text-foreground">{czk(rent)}</dd>
          </div>
          <div className="sm:text-right">
            <dt className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{t(lang, "lz_sheet_rest")}</dt>
            <dd className="mt-2 font-display text-[1.6rem] leading-none text-foreground">
              {rest === null ? "–" : czk(rest)}
            </dd>
          </div>
        </div>
      </dl>
      <div className="px-6 sm:px-8 py-5 bg-secondary flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-6 font-body text-[12px] leading-relaxed text-muted-foreground">
        <p className="max-w-[40ch]">{t(lang, "lz_sheet_note")}</p>
        <div className="shrink-0 sm:text-right">
          <div className="w-24 sm:w-28 mb-1 border-b border-foreground" aria-hidden="true" />
          <span className="text-[10.5px] tracking-[0.12em] uppercase">{t(lang, "lz_sheet_sign")}</span>
        </div>
      </div>
      <span className="sr-only">{`${LEASE_MONTHS} měsíců`}</span>
    </aside>
  );
};

export default TermSheet;
