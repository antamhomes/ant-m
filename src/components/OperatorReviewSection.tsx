import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { MARKET_OCC } from "@/lib/yield";

/**
 * MĚSÍČNÍ KONTROLA BYTU (2. 11. 2026, brand direction). Proof object pro
 * /vlastni-provoz: ne druhá faktura, ale pracovní výstup operátora. Co se
 * majitel naučí dělat: přečíst měsíc a rozhodnout.
 *
 * Data: byt 402 (Praha 1, 2+kk), říjen 2026, Hospitable, potvrzené pobyty:
 * 30 obsazených nocí z 31 (97 %), 11 pobytů (9 Booking.com, 2 Airbnb),
 * průměrná cena za noc 3 104 Kč (ubytování bez úklidu), pá+so 10/10 nocí za
 * 4 182 Kč, ne až čt 20/21 za 2 566 Kč, jediná prázdná noc čtvrtek 22. 10.,
 * medián rezervace 45 dní před příjezdem, žádná rezervace pod 7 dní, průměr
 * 2,7 noci, žádný jednonoční pobyt. Příjem po provizi platforem a městském
 * poplatku 94 132, úklid 13 650, po poplatcích 80 482 Kč. Trh: PriceLabs
 * Praha 1, 2 ložnice, 12 měsíců: obsazenost MARKET_OCC.praha1, realizovaná
 * cena 4 507 Kč/noc (lib/yield). Doporučení jsou odvozená z těchto čísel
 * (Claude, 2. 11. 2026) a V. je potvrdí nebo přepíše vlastními; jsou
 * označená jako „Co z toho plyne", ne jako provedená.
 */
const OperatorReviewSection = () => {
  const { lang } = useLanguage();
  const cs = lang === "cs";
  const pct = (n: number) => (cs ? `${n} %` : `${n}%`);
  const kpi = [
    [pct(97), cs ? "obsazenost, 30 nocí z 31" : "lấp phòng, 30 trên 31 đêm", cs ? `okolí ${pct(MARKET_OCC.praha1)}` : `xung quanh ${pct(MARKET_OCC.praha1)}`],
    ["3 104 Kč", cs ? "průměrná cena za noc" : "giá trung bình mỗi đêm", cs ? "okolí 4 507 Kč" : "xung quanh 4 507 Kč"],
    ["80 482 Kč", cs ? "příjem po poplatcích a úklidu" : "doanh thu sau phí và dọn dẹp", cs ? "11 pobytů, průměr 2,7 noci" : "11 lượt, trung bình 2,7 đêm"],
  ];
  const rows = cs
    ? [
        ["Pátek a sobota", "10 z 10 nocí", "4 182 Kč"],
        ["Neděle až čtvrtek", "20 z 21 nocí", "2 566 Kč"],
        ["Prázdné noci", "1 (čtvrtek 22. 10.)", ""],
        ["Rezervace předem", "medián 45 dní, žádná pod 7 dní", ""],
      ]
    : [
        ["Thứ sáu và thứ bảy", "10 trên 10 đêm", "4 182 Kč"],
        ["Chủ nhật đến thứ năm", "20 trên 21 đêm", "2 566 Kč"],
        ["Đêm trống", "1 (thứ năm 22/10)", ""],
        ["Đặt trước", "trung vị 45 ngày, không có dưới 7 ngày", ""],
      ];
  const decisions = cs
    ? [
        ["Všední dny jsou plné za cenu 31 % pod okolím.", "Listopad: neděle až čtvrtek +8 %. Když obsazenost zůstane nad 90 %, cena byla nízko; když spadne, vrátit."],
        ["Víkendy se prodávají s předstihem a draho.", "Prosinec: pátek a sobota +5 % a minimum dvě noci držet. Nejčastější chyba je prodat prosinec v říjnu za běžnou cenu."],
        ["Nikdo nerezervuje na poslední chvíli.", "Žádné last-minute slevy. Jedna prázdná noc za měsíc není důvod k akci, je to norma."],
      ]
    : [
        ["Ngày thường kín khách với giá thấp hơn xung quanh 31%.", "Tháng 11: chủ nhật đến thứ năm +8%. Nếu lấp phòng vẫn trên 90%, giá đang thấp; nếu giảm, quay lại."],
        ["Cuối tuần bán sớm và giá cao.", "Tháng 12: thứ sáu và thứ bảy +5%, giữ tối thiểu hai đêm. Lỗi hay gặp nhất là bán tháng 12 từ tháng 10 với giá thường."],
        ["Không ai đặt phút chót.", "Không giảm giá phút chót. Một đêm trống mỗi tháng không phải lý do để làm gì, đó là bình thường."],
      ];

  return (
    <section id="kontrola" className="section bg-secondary scroll-mt-20">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-10 lg:gap-16 items-start">
          <Reveal>
            <h2 className="h-section-sm h-serif text-foreground">
              {cs ? "Co se naučíte dělat každý měsíc." : "Việc anh chị sẽ học làm mỗi tháng."}
            </h2>
            <p className="lead mt-5">
              {cs
                ? "Systém nevyrábí sestavy. Vyrábí rozhodnutí. Tohle je skutečná měsíční kontrola jednoho našeho bytu: tři čísla, jeden pohled na týden a tři rozhodnutí, která z toho plynou."
                : "Hệ thống không tạo ra báo cáo. Nó tạo ra quyết định. Đây là bản kiểm tra tháng thật của một căn Antam: ba con số, một cái nhìn vào tuần và ba quyết định rút ra."}
            </p>
            <p className="mt-5 font-body text-[15px] text-muted-foreground leading-relaxed text-pretty max-w-[46ch]">
              {cs
                ? "Prvních 90 dní to děláme s vámi. Pak to děláte sami za 20 minut, nebo nám řízení cen necháte za 3 490 Kč měsíčně."
                : "90 ngày đầu Antam làm cùng anh chị. Sau đó anh chị tự làm trong 20 phút, hoặc để Antam lo giá với 3 490 Kč mỗi tháng."}
            </p>
          </Reveal>

          {/* Pracovní list, ne faktura: tmavá hlavička s měsícem a bytem, tři
              KPI v serifu, tabulka týdne, rozhodnutí jako odrážky se šipkou. */}
          <Reveal delay={0.08}>
            <article aria-label={cs ? "Měsíční kontrola bytu" : "Kiểm tra tháng"} className="border border-foreground/15 bg-card">
              <header className="bg-[hsl(var(--charcoal))] text-[#F7F1E8] px-6 py-4 sm:px-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="m-0 font-body text-[15px] font-medium">{cs ? "Měsíční kontrola" : "Kiểm tra tháng"}</p>
                <p className="m-0 font-body text-[14px] text-[rgba(232,222,208,0.75)] tnum">{cs ? "Říjen 2026 · 2+kk, Praha 1" : "Tháng 10/2026 · 2+kk, Praha 1"}</p>
              </header>
              <div className="px-6 py-6 sm:px-8 sm:py-7 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5 border-b border-foreground/15 tnum">
                {kpi.map(([v, l, m]) => (
                  <div key={l}>
                    <p className="m-0 font-display text-[2rem] sm:text-[2.1rem] lg:text-[2.4rem] leading-none text-foreground">{v}</p>
                    <p className="m-0 mt-2 font-body text-[14px] text-foreground leading-snug">{l}</p>
                    <p className="m-0 mt-0.5 font-body text-[13.5px] text-muted-foreground leading-snug">{m}</p>
                  </div>
                ))}
              </div>
              <dl className="m-0 px-6 sm:px-8 py-2 border-b border-foreground/15 tnum">
                {rows.map(([k, v, p]) => (
                  <div key={k} className="grid grid-cols-[1fr_auto] sm:grid-cols-[11rem_1fr_auto] gap-x-4 py-2.5 border-b border-foreground/10 last:border-b-0 font-body text-[14.5px]">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="m-0 text-foreground sm:col-auto col-span-1 text-right sm:text-left">{v}</dd>
                    <dd className="m-0 text-foreground text-right col-span-2 sm:col-span-1">{p}</dd>
                  </div>
                ))}
              </dl>
              <div className="px-6 py-6 sm:px-8 sm:py-7">
                <p className="m-0 font-body text-[13.5px] text-muted-foreground">{cs ? "Co z toho plyne" : "Rút ra điều gì"}</p>
                <ol className="m-0 mt-3 p-0 list-none space-y-4">
                  {decisions.map(([obs, act]) => (
                    <li key={obs} className="grid grid-cols-[1.25rem_1fr] gap-x-2">
                      <span aria-hidden="true" className="font-body text-[hsl(var(--gold))] pt-[1px]">→</span>
                      <div>
                        <p className="m-0 font-body text-[16px] font-medium text-foreground leading-snug text-balance">{obs}</p>
                        <p className="m-0 mt-1 font-body text-[14.5px] text-muted-foreground leading-relaxed text-pretty">{act}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </article>
            <p className="mt-3 mb-0 font-body text-[12.5px] text-muted-foreground leading-relaxed text-pretty max-w-[64ch]">
              {cs
                ? "Skutečný byt z naší správy, potvrzené pobyty z Hospitable za říjen 2026. Cena za noc je ubytování bez úklidu. Okolí: PriceLabs, Praha 1, dvě ložnice, 12 měsíců."
                : "Căn hộ thật Antam quản lý, đặt phòng đã xác nhận từ Hospitable tháng 10/2026. Giá mỗi đêm là tiền ở không gồm dọn dẹp. Xung quanh: PriceLabs, Praha 1, hai phòng ngủ, 12 tháng."}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default OperatorReviewSection;
