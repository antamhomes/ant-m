import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import realBedroomLuxury from "@/assets/real-bedroom-luxury.jpg";
import realBedroomModern from "@/assets/real-bedroom-modern.jpg";
import realLivingCozy from "@/assets/real-living-cozy.jpg";
import realLivingRoom from "@/assets/real-living-room.jpg";
import realLivingTv from "@/assets/real-living-tv.jpg";
import realCoffeeDetail from "@/assets/real-coffee-detail.jpg";
import realTerrace from "@/assets/real-terrace.jpg";

const photos: { src: string; alt: string; span: string }[] = [
  { src: realBedroomLuxury, alt: "Luxusní ložnice", span: "md:col-span-2 md:row-span-2" },
  { src: realLivingCozy, alt: "Útulný obývací pokoj", span: "md:col-span-1 md:row-span-1" },
  { src: realBedroomModern, alt: "Moderní ložnice", span: "md:col-span-1 md:row-span-2" },
  { src: realLivingRoom, alt: "Obývací pokoj", span: "md:col-span-2 md:row-span-1" },
  { src: realLivingTv, alt: "Obývací pokoj s TV stěnou", span: "md:col-span-2 md:row-span-2" },
  { src: realTerrace, alt: "Terasa s posezením", span: "md:col-span-2 md:row-span-1" },
  { src: realCoffeeDetail, alt: "Detail kávy s výhledem", span: "md:col-span-1 md:row-span-1" },
];

const Portfolio = () => {
  const { lang } = useLanguage();

  return (
    <main className="min-h-screen bg-background">
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-8 md:pt-14 md:pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === "cs" ? "Zpět na hlavní stránku" : "Quay lại trang chủ"}
        </Link>
        <p className="text-gold/80 font-body text-xs tracking-[0.3em] uppercase mb-3">
          {lang === "cs" ? "Naše realizace" : "Dự án của chúng tôi"}
        </p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground">
          Portfolio
        </h1>
      </header>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-3 md:gap-4">
          {photos.map((p, i) => (
            <figure
              key={i}
              className={`relative overflow-hidden rounded-sm bg-muted group ${p.span}`}
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Portfolio;