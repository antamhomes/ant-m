import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

/**
 * PÁS ČÍSEL pod hero (3. 11. 2026). Světlý pás po tmavém hero, čtyři čísla
 * oddělená vlasovými linkami, bez ikon a animovaných počítadel. Dvě čísla
 * změřená v PriceLabs (obsazenost, tržba proti 2+kk v Praze 1), dvě ze
 * stejného zdroje jako Kdo jsme. Poznámka pod čísly je povinná: bez ní je
 * „+25 %“ napadnutelné. Mobil 2 × 2, od lg čtyři vedle sebe.
 */
const items = [
  ["proof1_value", "proof1_label"],
  ["proof2_value", "proof2_label"],
  ["proof3_value", "proof3_label"],
  ["proof4_value", "proof4_label"],
] as const;

const ProofStrip = () => {
  const { lang } = useLanguage();
  return (
    <aside aria-label={t(lang, "proof_aria")} className="bg-background border-b border-border">
      <div className="container-wide py-10 lg:py-14 tnum">
        <dl className="m-0 grid grid-cols-2 lg:grid-cols-4">
          {items.map(([v, l], i) => (
            <div
              key={v}
              className={`flex flex-col items-center text-center gap-2.5 px-3 lg:px-6 py-5 lg:py-1 ${
                i % 2 === 1 ? "border-l border-border" : ""
              } ${i >= 2 ? "border-t border-border lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
            >
              <dt className="order-2 font-body text-[13px] sm:text-sm leading-snug text-muted-foreground max-w-[22ch] text-pretty">
                {t(lang, l)}
              </dt>
              <dd className="order-1 m-0 font-display text-[1.85rem] min-[360px]:text-[2.2rem] sm:text-[2.6rem] lg:text-[3.2rem] leading-none text-foreground whitespace-nowrap">
                {t(lang, v)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="m-0 mt-6 lg:mt-9 text-center font-body text-[12px] text-muted-foreground">{t(lang, "proof_note")}</p>
      </div>
    </aside>
  );
};

export default ProofStrip;
