import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { trackEvent } from "@/lib/analytics";
import { useSplashDone } from "@/hooks/use-splash-done";
import { czk, leaseCap } from "@/lib/lease";
import { ownerOffer } from "@/lib/ownerOffer";
import OfferSheet from "@/components/lease/OfferSheet";

const enter = (y: number, delay: number, duration = 0.7) =>
  ({
    "data-enter": "",
    style: { "--enter-y": `${y}px`, "--enter-delay": `${delay}s`, "--enter-dur": `${duration}s` } as React.CSSProperties,
  }) as const;

/**
 * HERO (5. 11. 2026 večer): majitel, který byt už má. Vpravo nabídkový list
 * s příkladem: 2+kk 60 m² na Starém Městě, splátka 32 000 Kč, nabídka
 * 38 000 Kč. Nabídka leží pod stropem z lib/lease (test to hlídá), běžný
 * nájem je model Sreality pro zařízený byt téže plochy a čtvrti.
 */
export const HERO_OWNER = { loc: "praha1", size: "2kk", m2: 60, ctvrt: "stare_mesto", payment: 32_000, offer: 38_000 } as const;

const LeaseHero = () => {
  const { lang } = useLanguage();
  const ready = useSplashDone();
  const o = ownerOffer({ antamRent: HERO_OWNER.offer, loc: HERO_OWNER.loc, size: HERO_OWNER.size, m2: HERO_OWNER.m2, ctvrt: HERO_OWNER.ctvrt, actualPayment: HERO_OWNER.payment });
  const ltrRound = Math.round(o.ltr / 500) * 500;
  const diff = HERO_OWNER.offer - ltrRound;

  return (
    <section className={`relative bg-background ${ready ? "is-ready" : ""}`}>
      <div className="max-w-6xl mx-auto px-6 pt-28 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="lg:pt-4">
          <p {...enter(10, 0.35, 0.6)} className="font-body text-[11px] tracking-[0.2em] uppercase text-gold">
            {t(lang, "lz_hero_label")}
          </p>
          <h1
            {...enter(20, 0.45, 0.8)}
            className="mt-6 font-display font-medium text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.02] tracking-[-0.02em] text-balance text-foreground max-w-[15ch]"
          >
            {t(lang, "lz_hero_title")}
          </h1>
          <p {...enter(16, 0.65, 0.6)} className="mt-7 font-body text-lg sm:text-xl leading-relaxed max-w-[42ch] text-pretty text-muted-foreground">
            {t(lang, "lz_hero_desc")}
          </p>
          <div {...enter(16, 0.8, 0.6)} className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href="#kontakt"
              onClick={() => trackEvent("cta_click", { location: "hero", target: "contact" })}
              className="btn btn-primary px-8 py-4"
            >
              {t(lang, "lz_hero_cta")}
            </a>
            <a href="#jak" className="font-body text-[14px] text-foreground border-b border-gold pb-0.5">
              {t(lang, "nav_jak")}
            </a>
          </div>
          <p {...enter(10, 1.0, 0.6)} className="mt-10 font-body text-[13px] sm:text-sm text-muted-foreground tnum">
            {t(lang, "lz_hero_line")}
          </p>
        </div>
        <div {...enter(24, 0.7, 0.9)}>
          <OfferSheet
            label={t(lang, "lz_sheet_label")}
            flat={`2+kk · ${HERO_OWNER.m2} m² · Staré Město`}
            ltr={`kolem ${czk(ltrRound)}`}
            payment={czk(HERO_OWNER.payment)}
            rent={czk(HERO_OWNER.offer)}
            vsLtr={`${diff >= 0 ? "+" : "−"}${czk(Math.abs(diff))}`}
            cover={o.coveragePct !== null ? `${Math.min(o.coveragePct, 100)} %` : null}
          />
          <p className="mt-4 font-body text-[12px] leading-relaxed text-muted-foreground max-w-[60ch]">{t(lang, "lz_sheet_caption")}</p>
        </div>
      </div>
    </section>
  );
};

/** Pro test: příklad v hero musí ležet pod stropem kernelu. */
export const heroCap = () => leaseCap(HERO_OWNER.loc, HERO_OWNER.size, { ctvrt: HERO_OWNER.ctvrt, m2: HERO_OWNER.m2 });

export default LeaseHero;
