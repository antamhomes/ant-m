import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SEO from "@/components/SEO";

import realBedroomLuxury from "@/assets/real-bedroom-luxury.jpg";
import realBedroomModern from "@/assets/real-bedroom-modern.jpg";
import realLivingCozy from "@/assets/real-living-cozy.jpg";
import realLivingRoom from "@/assets/real-living-room.jpg";
import realLivingTv from "@/assets/real-living-tv.jpg";
import realCoffeeDetail from "@/assets/real-coffee-detail.jpg";
import realTerrace from "@/assets/real-terrace.jpg";
import realStudioGold from "@/assets/real-studio-gold.jpg";
import realBedroomBeige from "@/assets/real-bedroom-beige.jpg";
import realStudioGreen from "@/assets/real-studio-green.jpg";
import praha4Studio1 from "@/assets/praha4-studio-1.jpg.asset.json";
import praha4Studio2 from "@/assets/praha4-studio-2.jpg.asset.json";

const photos: { src: string; altCs: string; altVi: string; span: string }[] = [
  { src: realBedroomLuxury, altCs: "Luxusní ložnice s manželskou postelí v bytě v Praze", altVi: "Phòng ngủ sang trọng với giường đôi trong căn hộ tại Praha", span: "md:col-span-2 md:row-span-2" },
  { src: realLivingCozy, altCs: "Útulný obývací pokoj s pohovkou a měkkým osvětlením", altVi: "Phòng khách ấm cúng với ghế sofa và ánh sáng dịu", span: "md:col-span-1 md:row-span-1" },
  { src: realBedroomModern, altCs: "Moderní ložnice v neutrálních tónech", altVi: "Phòng ngủ hiện đại với tông màu trung tính", span: "md:col-span-1 md:row-span-2" },
  { src: realLivingRoom, altCs: "Světlý obývací pokoj se sedačkou v bytě k pronájmu", altVi: "Phòng khách sáng sủa với ghế sofa trong căn hộ cho thuê", span: "md:col-span-2 md:row-span-1" },
  { src: realLivingTv, altCs: "Obývací pokoj s designovou TV stěnou a sedací soupravou", altVi: "Phòng khách với tường tivi thiết kế và bộ ghế sofa", span: "md:col-span-2 md:row-span-2" },
  { src: realTerrace, altCs: "Terasa bytu s venkovním posezením a výhledem", altVi: "Ban công căn hộ với khu vực ngồi ngoài trời và tầm nhìn đẹp", span: "md:col-span-2 md:row-span-1" },
  { src: realCoffeeDetail, altCs: "Detail šálku kávy na stole s výhledem z okna", altVi: "Cận cảnh tách cà phê trên bàn cạnh cửa sổ có tầm nhìn", span: "md:col-span-1 md:row-span-1" },
  { src: realStudioGold, altCs: "Studio s hořčicovými závěsy a designovým interiérem", altVi: "Căn studio với rèm màu vàng mù tạt và nội thất thiết kế", span: "md:col-span-2 md:row-span-2" },
  { src: realBedroomBeige, altCs: "Béžová ložnice s elegantním osvětlením", altVi: "Phòng ngủ tông màu be với ánh sáng trang nhã", span: "md:col-span-2 md:row-span-1" },
  { src: realStudioGreen, altCs: "Studio se zeleným akcentem a kuchyňským koutem", altVi: "Căn studio với điểm nhấn màu xanh và góc bếp", span: "md:col-span-2 md:row-span-2" },
  { src: praha4Studio1.url, altCs: "Studio apartmán Praha 4 s béžovou pohovkou, manželskou postelí a jídelním koutem", altVi: "Căn studio Praha 4 với ghế sofa be, giường đôi và góc ăn", span: "md:col-span-2 md:row-span-2" },
  { src: praha4Studio2.url, altCs: "Útulná ložnice apartmánu Praha 4 s dřevěným čelem postele a šedou pohovkou", altVi: "Phòng ngủ ấm cúng căn hộ Praha 4 với đầu giường gỗ và ghế sofa xám", span: "md:col-span-2 md:row-span-1" },
];

const Portfolio = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <main className="min-h-screen bg-background">
      <SEO page="portfolio" />
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
                alt={lang === "cs" ? p.altCs : p.altVi}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
            </figure>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center bg-gradient-dark rounded-sm p-10 md:p-16 border border-border">
          <p className="text-gold font-body text-xs tracking-[0.3em] uppercase mb-4">
            {lang === "cs" ? "A máme jich mnohem víc…" : "Và chúng tôi còn rất nhiều…"}
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary-foreground mb-6">
            {lang === "cs"
              ? "Chcete, aby Váš byt byl další?"
              : "Bạn muốn căn hộ của mình là tiếp theo?"}
          </h2>
          <p className="font-body text-primary-foreground/70 text-base md:text-lg mb-10">
            {lang === "cs"
              ? "Ozvěte se nám a my se postaráme o zbytek – od návrhu interiéru až po správu pronájmu."
              : "Liên hệ với chúng tôi và chúng tôi sẽ lo phần còn lại – từ thiết kế nội thất đến quản lý cho thuê."}
          </p>
          <button
            onClick={handleContactClick}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body font-medium text-[13px] tracking-[0.15em] uppercase rounded-sm hover:bg-charcoal border border-gold/60 ring-1 ring-gold/30 hover:ring-gold/60 transition-all"
          >
            {lang === "cs" ? "Nezávazná poptávka" : "Yêu cầu không ràng buộc"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </main>
  );
};

export default Portfolio;