import { MapPin, Users, Quote, Sparkles } from "lucide-react";
import Reveal, { stagger } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import byt1 from "@/assets/byt-1.jpg.asset.json";
import byt2 from "@/assets/byt-2.jpg.asset.json";
import byt3 from "@/assets/byt-3.jpg.asset.json";
import byt4 from "@/assets/byt-4.jpg.asset.json";
import byt5 from "@/assets/byt-5.jpg.asset.json";
import byt6 from "@/assets/byt-6.jpg.asset.json";
import byt7 from "@/assets/byt-7.jpg.asset.json";

/** The apartments shown publicly (owner's choice); capacities from Hospitable.
 *  byt-1…7 are Lovable assets; 402/405 (Praha 1, Čelakovského sady) are small webp files in public/portfolio.
 *  Order: the big loft first, then the two Praha 1 flagships, the Praha 4 cluster, Mladá Boleslav, Mozart last. */
const items: { src: string; name: string; loc: string; guests: number }[] = [
  { src: byt3.url, name: "Secret Garden Loft", loc: "Praha 4", guests: 13 },
  { src: "/portfolio/byt-402.webp", name: "Elegant Museum View\u00a0Apartment", loc: "Praha 1", guests: 8 },
  { src: "/portfolio/byt-405.webp", name: "Modern Museum View\u00a0Apartment", loc: "Praha 1", guests: 8 },
  { src: byt4.url, name: "Moderní apartmán se zahradou", loc: "Praha 4", guests: 6 },
  { src: byt1.url, name: "Secret Garden Studio\u00a0I", loc: "Praha 4", guests: 4 },
  { src: byt2.url, name: "Secret Garden Studio\u00a0II", loc: "Praha 4", guests: 4 },
  { src: byt5.url, name: "Klement apartment s\u00a0terasou", loc: "Mladá Boleslav", guests: 8 },
  { src: byt6.url, name: "Klement apartment", loc: "Mladá Boleslav", guests: 8 },
  { src: byt7.url, name: "My Mozart studio", loc: "Praha 5", guests: 4 },
];

/** Real guest reviews (Hospitable, 2026). Fragments are verbatim; translations are marked. */
const reviews = {
  cs: [
    { text: "Dokonalá lokalita s výbornou dostupností, ale také velice příjemný hostitel, který na všechny zprávy reagoval bleskově rychle.", meta: "Airbnb · 5 ★ · srpen 2026" },
    { text: "Doporučili jsme přidat zapékací mísu. Druhý den stála na stole i s odměrkou.", meta: "Booking.com · 9/10 · červenec 2026 · přeloženo" },
    { text: "Komunikácia s hostiteľom bola bezproblémová a na všetkom sme sa\u00a0vedeli dohodnúť.", meta: "Booking.com · 10/10 · červen 2026" },
  ],
  vi: [
    { text: "Vị trí hoàn hảo, đi lại thuận tiện, và chủ nhà rất dễ mến, trả lời mọi tin nhắn nhanh như chớp.", meta: "Airbnb · 5 ★ · 8/2026 · bản dịch" },
    { text: "Bọn mình góp ý nên có khay nướng. Hôm sau đã thấy trên bàn, kèm cả cốc đong.", meta: "Booking.com · 9/10 · 7/2026 · bản dịch" },
    { text: "Liên lạc với chủ nhà rất thuận lợi, mọi việc đều thỏa thuận được.", meta: "Booking.com · 10/10 · 6/2026 · bản dịch" },
  ],
};

const copy = {
  cs: {
    eyebrow: "Portfolio",
    title: "Byty v naší péči",
    desc: "Apartmány, které pro majitele připravujeme, fotíme a denně spravujeme.",
    guests: (n: number) => `až ${n} host${n === 4 ? "é" : "ů"}`,
    soonTitle: "Připravujeme",
    soonDesc: "Kvalita je pro nás důležitější než počet. Proto nové byty do portfolia zařazujeme postupně.\n",
    soonDescShort: "Kvalita je pro nás důležitější než počet. Proto nové byty do portfolia zařazujeme postupně.\n",
    reviewsLabel: "Co říkají hosté",
    reviewsLine: "Přes 520 recenzí od hostů na Airbnb a\u00a0Booking.com.",
  },
  vi: {
    eyebrow: "Căn hộ",
    title: "Những căn hộ Antam đang quản lý",
    desc: "Antam chuẩn bị, chụp ảnh và trông nom mỗi ngày cho chủ nhà.",
    guests: (n: number) => `tối đa ${n} khách`,
    soonTitle: "Sắp có thêm",
    soonDesc: "Để đảm bảo chất lượng cho từng căn, Antam chủ động giới hạn số lượng căn hộ nhận thêm.\n",
    soonDescShort: "Để đảm bảo chất lượng cho từng căn, Antam chủ động giới hạn số lượng căn hộ nhận thêm.\n",
    reviewsLabel: "Khách nói gì",
    reviewsLine: "Hơn 520 đánh giá của khách trên Airbnb và\u00a0Booking.com.",
  },
};

const PortfolioSection = () => {
  const { lang } = useLanguage();
  const c = copy[lang];

  return (
    <section id="portfolio" className="section bg-background scroll-mt-16">
      <div className="container-wide">
        <Reveal className="section-head">
          <p className="eyebrow eyebrow-center">{c.eyebrow}</p>
          <h2 className="h-section-sm text-foreground">{c.title}</h2>
          <p className="lead">{c.desc}</p>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {items.map((item, i) => (
            <Reveal as="figure"
              key={item.name} delay={stagger(i % 3, 0.08)}
              className="group overflow-hidden rounded-md border border-border bg-card shadow-[0_20px_45px_-30px_hsl(var(--charcoal)/0.4)]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img
                  src={item.src}
                  alt={`${item.name}, ${item.loc}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="px-2.5 py-2.5 sm:px-5 sm:py-4">
                <h3 className="font-display text-[14px] sm:text-lg font-semibold text-foreground leading-snug text-balance">
                  {item.name}
                </h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs sm:text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {item.loc}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gold" />
                    {c.guests(item.guests)}
                  </span>
                </p>
              </figcaption>
            </Reveal>
          ))}

          <Reveal delay={0.08}
            className="flex flex-col items-center justify-center text-center rounded-md border border-dashed border-gold/40 bg-gold/[0.04] px-4 sm:px-6 py-8 sm:py-10 min-h-[220px]"
          >
            <Sparkles className="w-6 h-6 text-gold mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {c.soonTitle}
            </h3>
            <p className="font-body text-sm text-muted-foreground max-w-[26ch] leading-relaxed">
              <span className="sm:hidden">{c.soonDescShort}</span>
              <span className="hidden sm:inline">{c.soonDesc}</span>
            </p>
          </Reveal>
        </div>

        {/* Guest voices: the service quality an owner is really buying. */}
        <Reveal delay={0.1} className="mt-14 md:mt-16">
          <div className="text-center mb-6 md:mb-8">
            <p className="eyebrow eyebrow-center">{c.reviewsLabel}</p>
            <p className="font-display text-xl md:text-2xl font-semibold text-foreground mt-3 mx-auto max-w-[24ch] md:max-w-none" style={{ textWrap: "balance" }}>{c.reviewsLine}</p>
          </div>
          {/* Phones: one row you swipe (snap), so three quotes don't cost three screens. */}
          <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 pb-2 md:pb-0 no-scrollbar">
            {reviews[lang].map((r) => (
              <blockquote key={r.meta} className="snap-start shrink-0 w-[82%] sm:w-[60%] md:w-auto rounded-md bg-card border border-border p-5 md:p-6">
                <Quote className="w-5 h-5 text-gold mb-3" aria-hidden="true" />
                <p className="font-body text-sm md:text-base text-foreground leading-relaxed text-pretty">
                  „{r.text}“
                </p>
                <footer className="mt-3 font-body text-xs text-muted-foreground">{r.meta}</footer>
              </blockquote>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PortfolioSection;
