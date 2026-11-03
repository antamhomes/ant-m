import { useState } from "react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * CO JSME VYŘEŠILI DŘÍV, NEŽ BYT SPUSTÍME (CZ p15, 2. 11. 2026). Sekce
 * neprodává tipy, ale rozhodnutí, která jsou v předávaném systému už
 * hotová: šest důsledků zkušenosti pod šesti částmi systému výš. Nahradila
 * koncept „10 tipů" (p5) i blok „Chyby, které už nemusíte udělat" (p13).
 * Znění bodů: V. / strategický reviewer, 2. 11. 2026. VI: stejný koncept,
 * znění podle „VI final wording (3. 11.)" v IC docu.
 */
const copy = {
  cs: {
    title: "Co jsme vyřešili dřív, než byt spustíme.",
    lead: "",
    more: "Dalších pět",
    less: "Zobrazit méně",
    note: "",
    tips: [
      ["Kolik lidí má byt opravdu pojmout.", "Podle toho se řeší postele, úložné prostory, prádlo i vybavení."],
      ["Co koupit a co nekupovat.", "Byt se nezařizuje jen podle fotky, ale podle toho, co vydrží provoz a co host skutečně používá."],
      ["Jak mají být nastavené Airbnb a Booking.com.", "Ne výchozí nastavení a následné opravování problémů na prvních rezervacích."],
      ["Co se stane, když něco selže.", "Internet, teplá voda, klíče, úklid nebo večerní problém hosta mají předem daný postup."],
      ["Kdy cenu nechat být a kdy ji změnit.", "Ne podle pocitu, ale podle obsazenosti bytu a okolí."],
      ["Jak provoz postavit tak, aby nestál na majiteli.", "Dodavatelé, přístupy, účty a postupy jsou nastavené tak, aby byt fungoval i bez něj."],
    ],
  },
  vi: {
    title: "Những việc Antam đã giải quyết trước khi nhà đón khách.",
    lead: "",
    more: "Xem thêm năm điều",
    less: "Thu gọn",
    note: "",
    tips: [
      ["Căn hộ thật sự nên đón bao nhiêu khách.", "Từ đó mới tính giường, chỗ cất đồ, chăn ga và đồ đạc."],
      ["Mua gì và không mua gì.", "Đồ đạc chọn theo độ bền và theo thứ khách thật sự dùng, không chỉ theo ảnh đẹp."],
      ["Airbnb và Booking.com phải cài đặt thế nào.", "Cài đúng từ đầu, thay vì để mặc định rồi đến khi có khách mới phát hiện lỗi."],
      ["Khi có sự cố thì làm gì.", "Mất internet, mất nước nóng, mất chìa khóa, người dọn không đến hay khách gọi buổi tối: đều có cách xử lý định sẵn."],
      ["Khi nào giữ giá, khi nào đổi giá.", "Không theo cảm tính, mà theo tỷ lệ lấp phòng của căn hộ và khu xung quanh."],
      ["Vận hành không dựa vào chủ nhà.", "Nhà cung cấp, cách vào nhà, tài khoản và quy trình được sắp xếp để căn hộ vẫn chạy khi chủ nhà không có mặt."],
    ],
  },
} as const;

const VISIBLE = 5;

const TipsSection = () => {
  const { lang } = useLanguage();
  const c = copy[lang];
  const [all, setAll] = useState(false);
  const collapsible = c.tips.length > VISIBLE + 1;
  const shown = all || !collapsible ? c.tips : c.tips.slice(0, VISIBLE);

  return (
    <section id="tipy" className="section bg-secondary scroll-mt-20 chapter-edge">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-x-16 gap-y-8 items-start">
          <Reveal className="lg:sticky lg:top-24">
            <h2 className="h-section-sm text-foreground">{c.title}</h2>
            {c.lead && <p className="lead mt-5">{c.lead}</p>}
          </Reveal>
          <Reveal delay={0.08}>
            <ol className="m-0 p-0 list-none border-t border-foreground/15">
              {shown.map(([h, p], i) => (
                <li key={h} className="grid grid-cols-[2.5rem_1fr] gap-x-3 py-5 border-b border-foreground/15">
                  <span className="font-body text-sm text-muted-foreground tnum pt-[3px]">{i + 1}</span>
                  <div>
                    <h3 className="m-0 font-body text-[17px] md:text-[18px] font-medium text-foreground leading-snug text-balance">{h}</h3>
                    {p && <p className="m-0 mt-1.5 font-body text-[15px] md:text-base text-muted-foreground leading-relaxed text-pretty max-w-[60ch]">{p}</p>}
                  </div>
                </li>
              ))}
            </ol>
            {collapsible && (
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              aria-expanded={all}
              className="mt-5 font-body text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              {all ? c.less : c.more}
            </button>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default TipsSection;
