import { Quote } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";

/** Real guest reviews (Hospitable, 2026). Fragments are verbatim; translations are marked.
 *  Moved out of PortfolioSection (results → calculator must stay uninterrupted); they now
 *  sit next to the services grid, where they support operating quality. */
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
    label: "Co říkají hosté",
    pre: "Přes ",
    num: "520 hodnocení",
    post: " na Airbnb a\u00a0Booking.com.",
  },
  vi: {
    label: "Khách nói gì",
    pre: "Hơn ",
    num: "520 đánh giá",
    post: " của khách trên Airbnb và\u00a0Booking.com.",
  },
};

const ReviewsBlock = () => {
  const { lang } = useLanguage();
  const c = copy[lang];

  return (
    <Reveal delay={0.1} className="mt-14 md:mt-16">
      <div className="text-center mb-6 md:mb-8">
        <p className="eyebrow eyebrow-center">{c.label}</p>
        <p
          className="font-display text-xl md:text-2xl font-semibold text-primary-foreground mt-3 mx-auto max-w-[24ch] md:max-w-none"
          style={{ textWrap: "balance" }}
        >
          {c.pre}
          <span className="text-gradient-gold-on-dark whitespace-nowrap">{c.num}</span>
          {c.post}
        </p>
      </div>
      {/* Phones: one row you swipe (snap), so three quotes don't cost three screens. */}
      <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 pb-2 md:pb-0 no-scrollbar">
        {reviews[lang].map((r) => (
          <blockquote
            key={r.meta}
            className="snap-start shrink-0 w-[82%] sm:w-[60%] md:w-auto rounded-md bg-primary-foreground/[0.04] border border-gold/20 p-5 md:p-6"
          >
            <Quote className="w-5 h-5 text-gold mb-3" aria-hidden="true" />
            <p className="font-body text-sm md:text-base text-primary-foreground/85 leading-relaxed text-pretty">
              „{r.text}“
            </p>
            <footer className="mt-3 font-body text-xs text-primary-foreground/60">{r.meta}</footer>
          </blockquote>
        ))}
      </div>
    </Reveal>
  );
};

export default ReviewsBlock;
