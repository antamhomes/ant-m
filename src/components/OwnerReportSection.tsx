import Reveal from "@/components/Reveal";
// PortalDemo z veřejné stránky odešlo (patch 2, 7. 9. 2026): vedle skutečného
// vyúčtování ukazovalo vymyšlené byty s reálnými částkami („Ukázka s vymyšlenými
// byty a hosty“) a dělalo ze sekce nejdelší blok stránky (1 844 px). Portál
// tu zůstává jako titulek, věta a odkaz; komponenta žije dál pro /portal.
import { useLanguage } from "@/contexts/LanguageContext";
import Wordmark from "@/components/Wordmark";
import { t } from "@/i18n/translations";

/* Ukázka portálu je DEMO REŽIM SKUTEČNÉHO PORTÁLU, ne kopie. Portál umí
   ?demo sám: běží na vymyšlených bytech, nechce přihlášení a je to tatáž
   aplikace, kterou majitel dostane. Přihlášení do ostrého portálu je /portal. */
const PORTAL_DEMO_URL = "https://antam-owner-portal.netlify.app/?demo";

/**
 * VYÚČTOVÁNÍ JAKO DOKUMENT (2. 11. 2026, vizuál C9). Skutečný byt 402 (Praha 1),
 * průměr 12 uzavřených měsíců do 7/2026 z Hospitable, přepočteno na odměnu
 * 20 % + DPH. Metoda: payout platforem (už po jejich provizi) minus úklid,
 * zrušené rezervace vyloučené, EUR × 25,00. 91 324 × 0,20 = 18 265; DPH 21 %
 * z odměny = 3 835; dohromady 22 100; majiteli 69 224 (na kartě 69 000).
 * Čte se shora dolů: co byt vydělal, co se odečetlo, co přišlo majiteli.
 * Žádný řádek není vymyšlený; provize platforem a úklid se do výpisu nepíší
 * částkou, protože je platforma strhne před výplatou a majitel je nevidí.
 */
const OwnerReportSection = () => {
  const { lang } = useLanguage();
  const cs = lang === "cs";
  const pct = (n: string) => (cs ? `${n} %` : `${n}%`);
  const rows: { label: string; value: string; kind?: "sum" | "minus" | "total" }[] = [
    { label: t(lang, "report_row_base"), value: "91 324 Kč", kind: "sum" },
    { label: cs ? "Odměna Antam Homes, 20 % z příjmu" : "Phí Antam Homes, 20% doanh thu", value: "− 18 265 Kč", kind: "minus" },
    { label: cs ? "DPH 21 % z odměny" : "VAT 21% trên phí", value: "− 3 835 Kč", kind: "minus" },
    { label: t(lang, "report_row_net"), value: "69 224 Kč", kind: "total" },
  ];
  const meta = [
    [cs ? "Byt" : "Căn hộ", "2+kk, 52 m², Praha 1"],
    [cs ? "Období" : "Kỳ", cs ? "průměrný měsíc, 8/2025 až 7/2026" : "tháng trung bình, 8/2025 đến 7/2026"],
    [t(lang, "report_row_occupancy"), pct("96")],
    [cs ? "Výplata" : "Thanh toán", cs ? "do 15. dne následujícího měsíce" : "trước ngày 15 tháng sau"],
  ];

  return (
    <section id="vyuctovani" className="section bg-secondary scroll-mt-20">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-10 lg:gap-16 items-start">
          <Reveal>
            <h2 className="h-section-sm text-foreground">{t(lang, "report_title")}</h2>
            <p className="lead mt-5">{t(lang, "report_desc")}</p>
            <p className="mt-5 font-body text-[15px] text-muted-foreground leading-relaxed text-pretty max-w-[48ch]">
              {t(lang, "report_multi")}
            </p>

            <h3 className="mt-10 font-body text-[19px] md:text-[21px] font-medium text-foreground">{t(lang, "portal_title")}</h3>
            <p className="mt-3 font-body text-[15px] md:text-base text-muted-foreground leading-relaxed max-w-[48ch] text-pretty">
              {t(lang, "portal_desc")}
            </p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <a href={PORTAL_DEMO_URL} target="_blank" rel="noopener noreferrer"
                className="font-body text-[15px] font-medium text-foreground underline underline-offset-4 decoration-foreground/30">
                {t(lang, "portal_open")}
              </a>
              <a href="/portal" className="font-body text-[13.5px] text-muted-foreground underline underline-offset-4 decoration-border">
                {t(lang, "portal_login")}
              </a>
            </div>
            <p className="mt-2 font-body text-[12.5px] text-muted-foreground text-pretty max-w-[56ch]">
              {t(lang, "portal_open_note")}
            </p>
          </Reveal>

          {/* Dokument: bílý list, hlavička s wordmarkem, metadata, řádky, součet.
              Záměrně vypadá jako to, co majiteli přijde e-mailem, ne jako widget. */}
          <Reveal delay={0.08}>
            <article aria-label={cs ? "Ukázka vyúčtování" : "Mẫu bảng kê"} className="bg-card border border-foreground/15 px-6 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <header className="flex items-start justify-between gap-6 pb-5 border-b border-foreground/15">
                <div>
                  <p className="m-0 font-body text-[15px] font-medium text-foreground">{cs ? "Vyúčtování" : "Bảng kê"}</p>
                  <p className="m-0 mt-0.5 font-body text-[13px] text-muted-foreground">{cs ? "skutečný byt z naší správy" : "căn hộ thật Antam đang quản lý"}</p>
                </div>
                <Wordmark on="light" size="sm" className="opacity-80 shrink-0" />
              </header>

              <dl className="m-0 mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 font-body text-[13.5px] sm:text-sm tnum">
                {meta.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="m-0 text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>

              <ol className="m-0 mt-7 p-0 list-none border-t border-foreground/15">
                {rows.map((r) => (
                  <li
                    key={r.label}
                    className={`flex items-baseline justify-between gap-6 py-4 sm:py-5 border-b tnum ${
                      r.kind === "total" ? "border-foreground/40 border-t-2 border-t-foreground/60 mt-1" : "border-foreground/10"
                    }`}
                  >
                    <span className={`font-body text-[14.5px] sm:text-[16px] ${r.kind === "minus" ? "text-muted-foreground pl-4" : "text-foreground"} ${r.kind === "total" ? "font-medium sm:text-[18px]" : ""}`}>
                      {r.label}
                    </span>
                    <span className={`whitespace-nowrap ${
                      r.kind === "total"
                        ? "font-display text-[34px] sm:text-[44px] lg:text-[52px] leading-none font-semibold text-foreground"
                        : r.kind === "minus"
                          ? "font-body text-[17px] sm:text-[19px] text-foreground/75"
                          : "font-body text-[20px] sm:text-[24px] font-medium text-foreground"
                    }`}>
                      {r.value}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 mb-0 font-body text-[12px] text-muted-foreground leading-relaxed text-pretty">
                {cs
                  ? "Příjem je to, co platformy vyplatily po své provizi, bez úklidu, který platí hosté. Průměr 12 měsíců z Hospitable, přepočteno na současnou odměnu. Minulý výsledek není příslib."
                  : "Doanh thu là số nền tảng đã trả sau phí của họ, không gồm phí dọn do khách trả. Trung bình 12 tháng từ Hospitable, tính theo mức phí hiện nay. Kết quả đã qua không phải cam kết."}
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default OwnerReportSection;
