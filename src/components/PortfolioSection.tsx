import { useState } from "react";
import { MapPin, Users, Ruler, Sparkles, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { MARKET_OCC, ratioFor } from "@/lib/yield";
import byt1 from "@/assets/byt-1.jpg.asset.json";
import byt2 from "@/assets/byt-2.jpg.asset.json";
import byt3 from "@/assets/byt-3.jpg.asset.json";
import byt4 from "@/assets/byt-4.jpg.asset.json";
import byt5 from "@/assets/byt-5.jpg.asset.json";
import byt6 from "@/assets/byt-6.jpg.asset.json";

/** Results shown on the cards: owner's monthly income, rounded to thousands, plus occupancy.
 *  Method confirmed by the owner 28. 8. 2026: take what the platform actually pays out (already net
 *  of its own commission), subtract the cleaning fee, then apply the 70/30 split. Airbnb settles in
 *  CZK, Booking.com in EUR, converted at 25,00. The local tourist tax was collected separately
 *  online and is paid by the guest (owner, 28. 8. 2026); it is deliberately not mentioned in the
 *  footnote, because it is not something the owner reading this has to care about.
 *  Recomputed 28. 8. 2026 from Hospitable and cross-checked against PriceLabs (six flats match to
 *  0,0 %, the rest within 0,9 %). Three "checkpoint voided" duplicates with zero revenue are
 *  excluded; they inflated night counts, not money.
 *  Window: last 12 full months (1. 8. 2025 – 31. 7. 2026) or, for flats that joined later, from the
 *  first stay (`since`).
 *  `ratio` (patch 127) is COMPUTED, not typed: owner income / rentFor(district, actual m²),
 *  the same function the calculator uses (Sreality medians 8/2026, district level × citywide
 *  size curve; Deloitte Q2/2026 kept as a test anchor). Mladá Boleslav has no rent source,
 *  so Klement shows no multiple (audit 28. 8., finding 5).
 *  Market (patch 127): ONE source with the calculator (MARKET_OCC from the PriceLabs district
 *  dataset, 12 months, bedroom band of the flat); the old 90-day comp-set probes are gone, so
 *  the page no longer shows two different "market" numbers for one district.
 *  Occupancy (recomputed 28. 8. 2026): share of booked nights over a window that starts on the
 *  46th day of operation, so the ramp-up weeks do not drag the number down. Only flats older than
 *  three months get one.
 *  Flats younger than ~3 months get no numbers yet (`newSince`), only a note.
 *  Refresh monthly: STATS_ASOF + the numbers below. */
const STATS_ASOF = { cs: "31. 7. 2026", vi: "31/7/2026" };

type Stats = { owner: number; occupancy: number; market: number; since?: string };
/** focus: kam se má ořez fotky držet, když má snímek jiný poměr než rám.
 *  Default je střed; u fotky, které centrování usekne to podstatné, stačí
 *  dopsat "top" nebo "bottom", layout se nemění. */
type Item = { src: string; name: string; loc: string; guests: number; m2?: number; stats?: Stats; newSince?: string; focus?: "top" | "bottom" };
const ratioOf = (item: Item) => item.stats && item.m2 ? ratioFor(item.loc, item.m2, item.stats.owner) : null;

/** The apartments shown publicly (owner's choice); capacities from Hospitable.
 *  byt-1…7 are Lovable assets; 402/405 (Praha 1, Čelakovského sady) are small webp files in public/portfolio.
 *  Order: measured results first (the section pays off the hero claim), longest window leading; flats without a full season follow with their honest badge. */
const items: Item[] = [
  { src: "/portfolio/byt-402.webp", name: "Elegant Museum View\u00a0Apartment", loc: "Praha 1", m2: 52, guests: 8, stats: { owner: 64000, occupancy: 96, market: MARKET_OCC.praha1 } },
  { src: "/portfolio/byt-405.webp", name: "Modern Museum View\u00a0Apartment", loc: "Praha 1", m2: 52, guests: 8, stats: { owner: 57000, occupancy: 94, market: MARKET_OCC.praha1 } },
  { src: "/portfolio/byt-modern-ac.webp", name: "Modern AC\u00a0Apartment", loc: "Praha 3", m2: 55, guests: 6, stats: { owner: 50000, occupancy: 96, market: MARKET_OCC.praha3, since: "2/2026" } },
  // Praha 3, ne Praha 4: potvrzeno majitelem 28. 8. 2026 i PSČ 130 00 v Hospitable.
  { src: byt4.url, name: "Moderní apartmán se zahradou", loc: "Praha 3", m2: 60, guests: 6, stats: { owner: 42000, occupancy: 85, market: MARKET_OCC.praha3, since: "4/2026" } },
  { src: byt5.url, name: "Klement apartment s\u00a0terasou", loc: "Mladá Boleslav", m2: 85, guests: 8, stats: { owner: 30000, occupancy: 91, market: MARKET_OCC.mb, since: "4/2026" } },
  { src: byt3.url, name: "Secret Garden Loft", loc: "Praha 4", m2: 110, guests: 13, newSince: "7/2026" },
  { src: byt1.url, name: "Secret Garden Studio\u00a0I", loc: "Praha 4", m2: 22, guests: 4, newSince: "7/2026" },
  { src: byt2.url, name: "Secret Garden Studio\u00a0II", loc: "Praha 4", m2: 22, guests: 4, newSince: "7/2026" },
  { src: byt6.url, name: "Klement apartment", loc: "Mladá Boleslav", m2: 80, guests: 8, newSince: "8/2026" },
];

const fmtCzk = (n: number) => n.toLocaleString("cs-CZ").replace(/\s/g, "\u00a0");

const copy = {
  cs: {
    eyebrow: "Výsledky",
    title: "Stejný trh. Jiná čísla.",
    desc: "Skutečné částky pro majitele z měsíčních vyúčtování a obsazenost proti průměru okolí.",
    guests: (n: number) => `až ${n} host${n === 4 ? "é" : "ů"}`,
    soonTitle: "Tady může být váš byt",
    soonDesc: "Napište nám a\u00a0do 24 hodin víte, jak je na\u00a0tom ten váš. Zdarma a\u00a0nezávazně.",
    soonDescShort: "Napište nám a\u00a0do 24 hodin víte, jak je na\u00a0tom ten váš.",
    showAll: "Další výsledky",
    prevFlat: "Předchozí byt",
    nextFlat: "Další byt",
    featOwner: "průměrně měsíčně majiteli",
    restLabel: (n: number) => `Dalších ${n} bytů ve\u00a0správě, měsíčně majiteli`,
    restNew: (n: number) => `a\u00a0${n} nové bez celé sezóny`,
    statNoteToggle: "Jak počítáme částky na kartách",
    showLess: "Zobrazit méně",
    statOwner: "majiteli měsíčně",
    statOcc: "obsazenost",
    barMarket: (loc: string) => `trh ${loc === "Mladá Boleslav" ? "MB" : loc}`,
    market: "trh",
    statPeriod12: "průměr 12 měsíců",
    statPeriodSince: (m: string) => `průměr od ${m}`,
    statRatio: (r: number) => `${r.toLocaleString("cs-CZ")}× dlouhodobý nájem`,
    newBadge: (m: string) => `V naší správě od ${m}`,
    newNote: "Výsledky doplníme po první sezóně.",
    statNote: (d: string) => `Částky pro majitele vycházejí ze skutečných rezervací, přepočtených na aktuální odměnu 30\u00a0%: tržby za ubytování po provizi Airbnb a Booking.com, bez úklidových poplatků, po naší odměně. Tedy to, co by majitel dostal při dnešních podmínkách; energie hradí majitel. Zaokrouhleno na tisíce. Průměr za posledních 12 měsíců, u novějších bytů od začátku správy, stav k\u00a0${d}. Obsazenost počítáme u\u00a0bytů starších tří měsíců a\u00a0prvních 45 dní provozu do\u00a0ní nezapočítáváme, byt se\u00a0v\u00a0nich teprve rozjíždí. Údaj o\u00a0trhu je z\u00a0PriceLabs za\u00a0stejných 12 měsíců a\u00a0platí pro celou městskou část a\u00a0velikost bytu (počet ložnic): průměrná obsazenost všech nabídek v\u00a0dané čtvrti, stejná data, ze kterých počítá kalkulačka. Dva byty ve\u00a0stejné čtvrti proto ukazují stejné číslo trhu. U\u00a0Mladé Boleslavi je to průměr srovnatelných bytů v\u00a0okolí za\u00a090 dní. U\u00a0nových nabídek se výsledky během prvního roku provozu teprve ustalují. Dlouhodobý nájem počítáme z\u00a0mediánu aktuálních nabídek na\u00a0Sreality (přes 1\u00a0300 čerstvých pražských inzerátů, srpen 2026) podle čtvrti a\u00a0skutečné plochy bytu; proti Deloitte Rent\u00a0Index Q2/2026 to průběžně kontrolujeme. Pro Mladou Boleslav tahle data nemáme, proto tam násobek neuvádíme. Minulé výsledky nejsou zárukou budoucích.`,
  },
  vi: {
    eyebrow: "Kết quả thực tế",
    title: "Những căn Antam lo, chủ nhà nhận được bao nhiêu",
    desc: "Số liệu thật từ bảng kê hằng tháng, không phải ước tính.",
    guests: (n: number) => `tối đa ${n} khách`,
    soonTitle: "Căn của anh chị có thể ở đây",
    soonDesc: "Nhắn cho Antam, trong 24 giờ anh chị biết căn nhà mình thế nào. Miễn phí, không ràng buộc.",
    soonDescShort: "Nhắn cho Antam, trong 24 giờ anh chị biết căn nhà mình thế nào.",
    showAll: "Kết quả các căn khác",
    prevFlat: "Căn trước",
    nextFlat: "Căn sau",
    featOwner: "trung bình mỗi tháng chủ nhà nhận",
    restLabel: (n: number) => `Còn ${n} căn nữa Antam lo, mỗi tháng chủ nhà nhận`,
    restNew: (n: number) => `và ${n} căn mới chưa đủ một mùa`,
    statNoteToggle: "Antam tính số trên thẻ thế nào",
    showLess: "Thu gọn",
    statOwner: "chủ nhà nhận / tháng",
    statOcc: "lấp phòng",
    barMarket: (loc: string) => `khu ${loc === "Mladá Boleslav" ? "MB" : loc}`,
    market: "khu",
    statPeriod12: "trung bình 12 tháng",
    statPeriodSince: (m: string) => `trung bình từ ${m}`,
    statRatio: (r: number) => `gấp ${r.toLocaleString("vi-VN")} lần cho thuê dài hạn`,
    newBadge: (m: string) => `Antam lo từ ${m}`,
    newNote: "Số liệu sẽ có sau mùa đầu tiên.",
    statNote: (d: string) => `Số tiền chủ nhà nhận dựa trên đặt phòng thật của từng căn, tính lại theo mức phí Antam hiện nay 30%: tiền phòng sau khi trừ phí Airbnb và Booking.com, không tính phí dọn dẹp, sau phí của Antam. Tức là số tiền chủ nhà sẽ nhận với điều kiện hiện nay; điện nước chủ nhà lo. Làm tròn đến hàng nghìn. Trung bình 12 tháng gần nhất, căn mới hơn thì tính từ khi Antam nhận, tính đến ${d}. Tỷ lệ lấp phòng chỉ tính cho căn đã quản lý trên ba tháng, 45 ngày đầu không tính vì nhà mới mở còn đang chạy đà. Số của khu lấy từ PriceLabs, cùng 12 tháng đó, tính cho cả quận và cỡ căn (số phòng ngủ): tỷ lệ lấp phòng trung bình của mọi căn trong quận, đúng số liệu mà phần tính thử dùng. Hai căn cùng quận vì vậy có cùng một số thị trường. Riêng Mladá Boleslav là trung bình các căn tương tự quanh đó trong 90 ngày. Tiền thuê dài hạn tính theo mức giữa của các tin đang đăng trên Sreality (hơn 1\u00a0300 tin mới ở Praha, tháng 8/2026) theo quận và đúng diện tích từng căn; Antam đối chiếu thường xuyên với Deloitte Rent\u00a0Index Q2/2026. Mladá Boleslav không có trong dữ liệu này, nên căn đó Antam không ghi số lần. Kết quả đã qua không phải là cam kết cho tương lai.`,
  },
};

const PortfolioSection = () => {
  const { lang } = useLanguage();
  const c = copy[lang];
  /* AD 1. 9. 2026: jeden byt nese sekci jako důkaz, ne katalog tří karet.
     Zbytek portfolia je pod tím řádek čísel a teprve po rozkliknutí mřížka. */
  const [showAll, setShowAll] = useState(false);
  /* Listuje se po jednom bytě dokolečka (2. 9. 2026). Kompozice zůstává
     „jeden byt = důkaz"; kdo chce, projde si ostatní, ale sekce se nestane
     galerií, protože pořád vidí jen jeden byt naráz. */
  const [featIdx, setFeatIdx] = useState(0);
  const featured = items[featIdx];
  const step = (d: number) => setFeatIdx((i) => (i + d + items.length) % items.length);
  const rest = items.filter((i) => i !== featured);
  const restStats = rest.filter((i) => i.stats);
  const visible = showAll ? rest : [];

  return (
    <section id="portfolio" className="section bg-background scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{c.eyebrow}</p>
          <h2 className="h-section-sm text-foreground">{c.title}</h2>
          <p className="lead">{c.desc}</p>
        </Reveal>
      </div>

      {/* Fotka vystupuje z containeru k levému okraji okna, částka stojí vedle ní.
          Pod 1024 px se to skládá pod sebe, asymetrie se nereprodukuje. */}
      <Reveal className="lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <figure key={`f-${featIdx}`} className="feat-swap relative overflow-hidden bg-secondary">
          <img
            src={featured.src}
            alt={`${featured.name}, ${featured.loc}`}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] ${
              featured.focus === "top" ? "object-top" : featured.focus === "bottom" ? "object-bottom" : "object-center"
            }`}
          />
          {/* AD 2. 9. 2026, jen pod lg: částka stojí NA fotce, dole vlevo.
              Ve sloupci pod fotkou se z toho stávala běžná realitní karta
              (foto → cena → název → údaje); nahoře na fotce zůstává byt
              a jeho výsledek jedním předmětem. Nad lg se nic nemění, tam
              napětí drží asymetrie foto vlevo / číslo vpravo.
              Gradient sahá jen do spodní části snímku, není to hero scrim. */}
          <div
            aria-hidden="true"
            className="lg:hidden pointer-events-none absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(to_top,rgba(14,13,11,0.88)_0%,rgba(14,13,11,0.78)_18%,rgba(14,13,11,0.48)_46%,rgba(14,13,11,0.16)_76%,rgba(14,13,11,0)_100%)]"
          />
          <div className="lg:hidden absolute left-6 right-6 bottom-7 sm:left-8 sm:right-8 sm:bottom-8 tnum">
            {featured.stats ? (
              <p className="font-display font-semibold text-white leading-[0.9] tracking-[-0.028em] text-[clamp(2.75rem,12.5vw,4.25rem)] whitespace-nowrap [text-shadow:0_1px_3px_rgba(0,0,0,0.32)]">
                {fmtCzk(featured.stats.owner)}
                <span className="ml-2.5 sm:ml-3 text-[0.32em] font-normal tracking-normal text-white/90">Kč</span>
              </p>
            ) : (
              <p className="font-display font-semibold text-white leading-[1.1] text-[clamp(1.45rem,6vw,2rem)] max-w-[16ch] [text-shadow:0_1px_3px_rgba(0,0,0,0.32)]">
                {c.newBadge(featured.newSince!)}
              </p>
            )}
            <p className="mt-2 font-body text-[11px] uppercase tracking-[0.14em] text-white/85 leading-snug text-pretty">
              {featured.stats ? c.featOwner : c.newNote}
            </p>
          </div>
        </figure>
        <div className="flex flex-col px-6 pt-5 sm:pt-6 lg:block lg:px-0 lg:py-0 lg:pl-14 lg:pr-[max(1.5rem,calc((100vw-75rem)/2+1.5rem))]">
          <div className="flex items-center gap-2 mb-5 max-lg:order-2 max-lg:mt-7 max-lg:mb-0">
            <button type="button" onClick={() => step(-1)} aria-label={c.prevFlat}
              className="p-1.5 rounded-sm border border-border text-muted-foreground hover:border-foreground/40 transition-colors">
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label={c.nextFlat}
              className="p-1.5 rounded-sm border border-border text-muted-foreground hover:border-foreground/40 transition-colors">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="ml-1.5 font-body text-[11.5px] uppercase tracking-[0.12em] text-muted-foreground tnum">
              {featIdx + 1} / {items.length}
            </span>
          </div>

          {/* Animuje se jen obsah. Ovládání zůstává namontované, jinak by při
              každém kliknutí ztratilo fokus a rychlé klikání by propadalo. */}
          <div key={`d-${featIdx}`} className="feat-swap max-lg:order-1">
          {/* Pod lg tenhle blok nekreslíme: částka i její popiska sedí na fotce. */}
          <div className="hidden lg:block">
            {featured.stats ? (
              <p className="tnum font-display font-semibold text-foreground leading-[0.9] tracking-[-0.028em] text-[clamp(3.25rem,6.8vw,6.5rem)] whitespace-nowrap">
                {fmtCzk(featured.stats.owner)}
                <span className="ml-[0.5em] text-[0.3em] font-normal tracking-normal text-muted-foreground">Kč</span>
              </p>
            ) : (
              /* Byt bez celé sezóny nemá co do velkého slotu postavit. Místo
                 vymyšleného čísla tam stojí, od kdy ho spravujeme. */
              <p className="font-display font-semibold text-foreground leading-[1.05] tracking-[-0.02em] text-[clamp(1.7rem,3vw,2.6rem)] max-w-[16ch]">
                {c.newBadge(featured.newSince!)}
              </p>
            )}
            <p className="mt-3 font-body text-[11px] sm:text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {featured.stats ? c.featOwner : c.newNote}
            </p>
          </div>
          <h3 className="mt-0 lg:mt-6 font-display text-xl sm:text-2xl font-semibold text-foreground text-balance">
            {featured.name}
          </h3>
          <ul className="mt-4 space-y-1.5 font-body text-[11px] sm:text-xs uppercase tracking-[0.09em] text-muted-foreground tnum">
            <li>
              {featured.loc}&nbsp;· {featured.m2}&nbsp;m²
              <span className="hidden sm:inline">&nbsp;· {c.guests(featured.guests)}</span>
            </li>
            {featured.stats && (
              <>
                <li>
                  <b className="font-medium text-foreground">
                    {featured.stats.occupancy}{lang === "cs" ? "\u00a0%" : "%"}
                  </b>{" "}
                  {c.statOcc} ·{" "}
                  <span className="sm:hidden">{c.market}</span>
                  <span className="hidden sm:inline">{c.barMarket(featured.loc)}</span>
                  &nbsp;{featured.stats.market}
                  {lang === "cs" ? "\u00a0%" : "%"}
                </li>
                <li>{featured.stats.since ? c.statPeriodSince(featured.stats.since) : c.statPeriod12}</li>
              </>
            )}
          </ul>
          </div>
        </div>
      </Reveal>

      <div className="container-wide">
        {/* Rozpětí zbytku portfolia. Ukazuje, že čísla jdou i dolů, takže hlavní
            číslo nevypadá jako vybraná třešnička. Počty se berou z dat, ne z ruky. */}
        <Reveal className="mt-9 sm:mt-12 pt-7 border-t border-border">
          <p className="font-body text-[11px] sm:text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {c.restLabel(rest.length)}
          </p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 tnum">
            {restStats.map((i) => (
              <span key={i.name} className="font-display text-lg sm:text-[26px] font-semibold text-muted-foreground/80">
                {fmtCzk(i.stats!.owner)}
              </span>
            ))}
            <span className="font-body text-[11px] sm:text-xs text-muted-foreground">
              {c.restNew(rest.length - restStats.length)}
            </span>
          </p>
        </Reveal>

        <div id="portfolio-vsechny" className={showAll ? "mt-8 sm:mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6" : "hidden"}>
          {visible.map((item, i) => {
            /* K3 (29. 8. 2026), composition under 1024 px: the strongest result leads as a
               full-width card (phone: photo above the numbers; tablet: photo left, numbers
               right), the rest pair up. With 1 + 2 or 1 + 10 cards no card is ever left
               orphaned in a two-column grid. From lg the three-column grid is unchanged. */
            const lead = i === 0;
            return (
            <Reveal as="figure"
              key={item.name} delay={stagger(i % 3, 0.08)}
              className={`group overflow-hidden rounded-md border border-border bg-card shadow-[0_20px_45px_-30px_hsl(var(--charcoal)/0.4)] ${
                lead ? "col-span-2 lg:col-span-1 sm:grid sm:grid-cols-2 lg:block" : ""
              }`}
            >
              <div className={`relative overflow-hidden bg-secondary ${
                lead ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[300px] lg:aspect-[4/3] lg:h-auto lg:min-h-0" : "aspect-[4/3]"
              }`}>
                <img
                  src={item.src}
                  alt={`${item.name}, ${item.loc}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                {/* K2 (29. 8. 2026): the owner's monthly result sits on the photo, lower left,
                    over a gradient that touches only the bottom half. The top of the photo stays
                    untouched, the number is the first thing the eye lands on. */}
                {item.stats && (
                  <>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_top,rgba(14,13,11,0.82)_0%,rgba(14,13,11,0.55)_38%,rgba(14,13,11,0.18)_72%,rgba(14,13,11,0)_100%)]"
                    />
                    <p className={`absolute ${lead ? "left-4 bottom-3.5" : "left-2.5 bottom-2"} sm:left-5 sm:bottom-4 pr-2.5 sm:pr-5 tnum`}>
                      <span className={`block font-display ${lead ? "text-[32px]" : "text-[18px]"} sm:text-[30px] lg:text-[32px] font-semibold text-white leading-none tracking-[-0.01em] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]`}>
                        {fmtCzk(item.stats.owner)}&nbsp;Kč
                      </span>
                      <span className={`mt-1 sm:mt-1.5 block font-body uppercase ${lead ? "text-[11px] tracking-[0.14em]" : "text-[8px] tracking-[0.1em]"} sm:text-[11px] sm:tracking-[0.14em] text-white/85 leading-tight`}>
                        {c.statOwner}
                      </span>
                    </p>
                  </>
                )}
              </div>
              <figcaption className={lead ? "px-4 py-4 sm:px-5 sm:py-4 sm:self-center" : "px-2.5 py-2.5 sm:px-5 sm:py-4"}>
                {/* Below the photo the story continues in one line: the multiple of long-term rent.
                    Then the flat as context, then occupancy against the locality. */}
                {/* Násobek nájmu z karty odešel (2C): tenhle argument dělá
                    kalkulačka, a to osobně, na bytě návštěvníka. Na kartě má
                    vést důkaz, který jinde nemáme: obsazenost proti trhu. */}
                <h3 className={`font-display ${lead ? "text-base" : "text-[13px]"} sm:text-base font-semibold text-foreground leading-snug text-balance`}>
                  {item.name}
                </h3>
                {/* Occupancy as plain typography: the flat's number leads, the locality's market
                    number follows in muted text. No bars, no chart. New flats get a note instead. */}
                {item.stats && (
                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border tnum">
                    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 leading-none">
                      <span className={`font-display ${lead ? "text-xl" : "text-base"} sm:text-xl font-semibold text-foreground`}>
                        {item.stats.occupancy}{lang === "cs" ? "\u00a0%" : "%"}
                      </span>
                      <span className="font-body text-[9.5px] sm:text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {c.statOcc}
                      </span>
                      <span className="basis-full font-body text-[12.5px] sm:text-[13.5px] font-medium text-foreground/75 tnum mt-1">
                        {c.barMarket(item.loc)}&nbsp;{item.stats.market}{lang === "cs" ? "\u00a0%" : "%"}
                      </span>
                    </p>
                    <p className="mt-2 font-body text-[10.5px] sm:text-xs text-muted-foreground leading-snug">
                      {item.stats.since ? c.statPeriodSince(item.stats.since) : c.statPeriod12}
                    </p>
                  </div>
                )}
                {/* 2D: metadata bytu jdou AŽ ZA výkon. Pořadí na kartě je
                    výplata majiteli, obsazenost proti trhu, teprve pak lokalita,
                    kapacita a plocha. */}
                <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs sm:text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {item.loc}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gold" />
                    {c.guests(item.guests)}
                  </span>
                  {item.m2 && (
                    <span className="inline-flex items-center gap-1.5 tnum">
                      <Ruler className="w-3.5 h-3.5 text-gold" />
                      {item.m2}&nbsp;m²
                    </span>
                  )}
                </p>
                {item.newSince && (
                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border">
                    <span className="inline-flex items-center rounded-full bg-gold/10 text-gold-deep font-body text-[9.5px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] px-2 sm:px-2.5 py-0.5 sm:py-1">
                      {c.newBadge(item.newSince)}
                    </span>
                    <p className="mt-1.5 font-body text-[10.5px] sm:text-xs text-muted-foreground leading-snug">
                      {c.newNote}
                    </p>
                  </div>
                )}
              </figcaption>
            </Reveal>
            );
          })}

          {showAll && (
          <Reveal delay={0.08} className="contents">
            <a
              href="#kontakt"
              className="flex flex-col items-center justify-center text-center rounded-md border border-dashed border-gold/40 bg-gold/[0.04] px-4 sm:px-6 py-8 sm:py-10 min-h-[220px] transition-colors hover:border-gold/70 hover:bg-gold/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <Sparkles className="w-6 h-6 text-gold mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {c.soonTitle}
              </h3>
              <p className="font-body text-sm text-muted-foreground max-w-[26ch] leading-relaxed">
                <span className="sm:hidden">{c.soonDescShort}</span>
                <span className="hidden sm:inline">{c.soonDesc}</span>
              </p>
            </a>
          </Reveal>
          )}

        </div>

        {!showAll && (
          <div className="mt-7 sm:mt-9 flex">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              aria-expanded={false}
              aria-controls="portfolio-vsechny"
              className="btn btn-secondary max-sm:px-4 max-sm:tracking-[0.1em]"
            >
              {c.showAll}
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* How the numbers on the cards are computed: full method, but behind a
            toggle (patch 126), so the proof block is not followed by a 1 000-character
            wall. Same pattern as the calculator's "Jak počítáme". */}
        <Reveal delay={0.05} className="mt-4 sm:mt-5">
          <details className="group max-w-prose mx-auto">
            <summary className="list-none cursor-pointer font-body text-xs text-muted-foreground text-center underline underline-offset-4 decoration-border [&::-webkit-details-marker]:hidden">
              {c.statNoteToggle}
            </summary>
            <p className="mt-3 font-body text-[11px] sm:text-xs text-muted-foreground/90 leading-relaxed text-pretty text-left sm:text-center">
              {c.statNote(STATS_ASOF[lang])}
            </p>
          </details>
        </Reveal>

        {/* Recenze hostů odsud odešly do sekce Co za vás řešíme (2B):
            520+ hodnocení není důkaz výsledku, ale důkaz provozu. Tady by
            navíc konkurovaly kartám, které mají sekci nést samy. */}

      </div>
    </section>
  );
};

export default PortfolioSection;
