import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { reveal, revealDelayed, stagger } from "@/lib/motion";
import byt1 from "@/assets/byt-1.jpg.asset.json";
import byt2 from "@/assets/byt-2.jpg.asset.json";
import byt3 from "@/assets/byt-3.jpg.asset.json";
import byt4 from "@/assets/byt-4.jpg.asset.json";
import byt5 from "@/assets/byt-5.jpg.asset.json";
import byt6 from "@/assets/byt-6.jpg.asset.json";
import byt7 from "@/assets/byt-7.jpg.asset.json";

const items = [
  { src: byt1.url, name: "Secret garden studio I", loc: { cs: "Praha 4", vi: "Praha 4" } },
  { src: byt2.url, name: "Secret garden studio II", loc: { cs: "Praha 4", vi: "Praha 4" } },
  { src: byt3.url, name: "Secret garden loft", loc: { cs: "Praha 4", vi: "Praha 4" } },
  { src: byt4.url, name: "Moderní apartmán se zahradou", loc: { cs: "Praha 4", vi: "Praha 4" } },
  { src: byt5.url, name: "Klement apartment s terasou", loc: { cs: "Mladá Boleslav", vi: "Mladá Boleslav" } },
  { src: byt6.url, name: "Klement apartment", loc: { cs: "Mladá Boleslav", vi: "Mladá Boleslav" } },
  { src: byt7.url, name: "My Mozart studio", loc: { cs: "Praha 3", vi: "Praha 3" } },
];

const copy = {
  cs: {
    eyebrow: "Portfolio",
    title: "Byty v naší péči",
    desc: "Reálné apartmány, které pro majitele připravujeme, fotíme a denně spravujeme.",
    soonTitle: "Připravujeme",
    soonDesc: "Do konce sezóny rozšiřujeme portfolio na celkem 10 apartmánů po Praze.",
  },
  vi: {
    eyebrow: "Portfolio",
    title: "Những căn hộ chúng tôi chăm sóc",
    desc: "Các căn hộ thật mà chúng tôi chuẩn bị, chụp ảnh và quản lý mỗi ngày cho chủ nhà.",
    soonTitle: "Sắp ra mắt",
    soonDesc: "Chúng tôi đang mở rộng danh mục lên tổng cộng 10 căn hộ tại Praha.",
  },
};

const PortfolioSection = () => {
  const { lang } = useLanguage();
  const c = copy[lang];

  return (
    <section id="portfolio" className="section bg-background scroll-mt-16">
      <div className="container-wide">
        <motion.div {...reveal} className="section-head">
          <p className="eyebrow eyebrow-center">{c.eyebrow}</p>
          <h2 className="h-section-sm text-foreground">{c.title}</h2>
          <p className="lead">{c.desc}</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {items.map((item, i) => (
            <motion.figure
              key={i}
              {...revealDelayed(stagger(i % 3, 0.08))}
              className="group overflow-hidden rounded-md border border-border bg-card shadow-[0_20px_45px_-30px_hsl(var(--charcoal)/0.4)]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.src}
                  alt={`${item.name} — ${item.loc[lang]}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="px-3 py-3 sm:px-5 sm:py-4">
                <h3 className="font-display text-[15px] sm:text-lg font-semibold text-foreground leading-snug">
                  {item.name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 font-body text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  {item.loc[lang]}
                </p>
              </figcaption>
            </motion.figure>
          ))}

          <motion.div
            {...revealDelayed(0.08)}
            className="flex flex-col items-center justify-center text-center rounded-md border border-dashed border-gold/40 bg-gold/[0.04] px-6 py-10 min-h-[220px]"
          >
            <Sparkles className="w-6 h-6 text-gold mb-4" />
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {c.soonTitle}
            </h3>
            <p className="font-body text-sm text-muted-foreground max-w-[26ch] leading-relaxed">
              {c.soonDesc}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;