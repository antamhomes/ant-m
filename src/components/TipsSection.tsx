import { useState } from "react";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * CO SE NIKDE NEDOČTETE (2. 11. 2026, /vlastni-provoz). Deset provozních
 * tipů jako ochutnávka systému: konkrétní, ověřitelné v provozu, žádná
 * teorie. Prvních pět je vidět, zbytek na rozkliknutí. NÁVRH (Claude):
 * formulace i obsah jsou můj první draft z běžné praxe krátkodobého
 * pronájmu v Praze; Vuong je má nahradit vlastními, protože skutečná
 * "tajemství" zná on. Nic tu netvrdí čísla o Antamu.
 */
const copy = {
  cs: {
    title: "Co se nikde nedočtete",
    lead: "Deset věcí z provozu, které rozhodují víc než fotky. Zbytek je v systému, který vám předáme.",
    more: "Dalších pět",
    less: "Zobrazit méně",
    note: "Návrh tipů k doplnění z našeho provozu.",
    tips: [
      ["Minimální délka pobytu podle dne, ne jedno číslo.", "Pátek a sobota dvě noci, všední dny jedna. Jednotné minimum 2 noci vám v týdnu nechá díry, které už nikdo nezaplní."],
      ["Poslední tři dny prodává cena, ne inzerát.", "Neobsazená noc za 72 hodin má jinou cenu než za 30 dní. Kdo nemá pravidlo pro last minute, prodává buď draho a prázdno, nebo levně a plno."],
      ["První fotka není obývák.", "Je to jediná věc, kterou má váš byt a sousední ne: výhled, terasa, klenba. Pořadí fotek mění počet kliknutí víc než cokoli v popisu."],
      ["Fotka každého pokoje po úklidu, pokaždé.", "Do sdílené skupiny, s časem. Řeší většinu sporů o škody a o stav bytu dřív, než vzniknou."],
      ["Tři zprávy hostovi, všechny automatické.", "Tři dny před příjezdem, den před s přístupem, hodinu po příjezdu s otázkou, jestli je vše v pořádku. Pak už host píše jen, když má problém."],
      ["Prosinec a Silvestr stojí mimo ceník.", "Konec roku v Praze nese násobek běžné zimy. Kdo nechá automatiku, prodá ho v říjnu za běžnou cenu."],
      ["Booking.com bez platby na místě.", "Rezervace s platbou v ubytování mají nejvyšší podíl nepříjezdů. Platba kartou předem, i když přijdete o pár rezervací."],
      ["Hodnocení chtějte dvě hodiny po odjezdu.", "Ne hned u dveří, ne za týden. Krátká zpráva s poděkováním a jednou větou, co napsat, pokud se líbilo."],
      ["Obsazenost příštích 30 dní proti okolí, každé pondělí.", "Jedno číslo, pět minut. Když je pod okolím, je to cena nebo inzerát; když je nad okolím a tržba neroste, prodáváte levně."],
      ["Domovní povinnosti vyřešte před první rezervací.", "Evidence hostů, hlášení cizinců, poplatek z pobytu, eTurista. Nastavené jednou, pak běží samo. Dohánět to zpětně stojí víc než všechno ostatní dohromady."],
    ],
  },
  vi: {
    title: "Kinh nghiệm từ vận hành thực tế",
    lead: "Mười điều rút ra từ vận hành hằng ngày, quan trọng hơn cả ảnh đẹp. Phần còn lại nằm trong hệ thống Antam bàn giao.",
    more: "Xem thêm năm điều",
    less: "Thu gọn",
    note: "Bản nháp, Antam sẽ bổ sung từ vận hành thực tế.",
    tips: [
      ["Số đêm tối thiểu đặt theo ngày trong tuần.", "Thứ sáu, thứ bảy tối thiểu hai đêm, ngày thường một đêm. Để chung hai đêm cho cả tuần là sẽ có những đêm trống không ai lấp."],
      ["Ba ngày cuối, giá quyết định chứ không phải tin đăng.", "Một đêm còn trống trước 3 ngày phải có giá khác với trước 30 ngày. Không có quy tắc cho sát ngày thì hoặc đắt mà trống, hoặc rẻ mà kín."],
      ["Ảnh đầu tiên không phải là phòng khách.", "Mà là thứ căn hộ này có còn căn bên cạnh không có: view, sân thượng, trần vòm. Thứ tự ảnh quan trọng hơn mọi dòng mô tả."],
      ["Sau mỗi lần dọn, chụp ảnh từng phòng.", "Gửi vào nhóm chung, có giờ chụp. Phần lớn tranh cãi về hỏng hóc được giải quyết ngay từ đó."],
      ["Ba tin nhắn cho khách, gửi tự động.", "Ba ngày trước khi đến; một ngày trước, kèm cách vào nhà; một giờ sau khi đến, hỏi mọi thứ có ổn không. Sau đó khách chỉ nhắn khi thật sự có việc."],
      ["Tháng 12 và giao thừa phải đặt giá riêng.", "Cuối năm ở Praha giá cao hơn hẳn mùa đông thường. Để tự động thì tháng 12 sẽ bị đặt hết từ tháng 10 với giá thường."],
      ["Trên Booking.com, không nhận trả tiền tại chỗ.", "Khách trả tại chỗ là nhóm hay không đến nhất. Thu qua thẻ từ trước, dù có mất vài lượt đặt."],
      ["Xin đánh giá hai giờ sau khi khách đi.", "Không phải lúc khách đang ở cửa, cũng không phải một tuần sau. Một tin ngắn cảm ơn, kèm một câu gợi ý khách nên viết gì nếu hài lòng."],
      ["Mỗi thứ hai, xem lấp phòng 30 ngày tới so với khu xung quanh.", "Một con số, năm phút. Thấp hơn khu là do giá hoặc tin đăng; cao hơn mà tiền không tăng là đang để giá rẻ."],
      ["Giấy tờ với cơ quan nhà nước xong trước khi đón khách đầu tiên.", "Sổ khách, khai báo khách nước ngoài, phí lưu trú, eTurista. Làm một lần là chạy. Làm bù về sau tốn công hơn mọi thứ cộng lại."],
    ],
  },
} as const;

const VISIBLE = 5;

const TipsSection = () => {
  const { lang } = useLanguage();
  const c = copy[lang];
  const [all, setAll] = useState(false);
  const shown = all ? c.tips : c.tips.slice(0, VISIBLE);

  return (
    <section id="tipy" className="section bg-secondary scroll-mt-20 chapter-edge">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-x-16 gap-y-8 items-start">
          <Reveal className="lg:sticky lg:top-24">
            <h2 className="h-section-sm text-foreground">{c.title}</h2>
            <p className="lead mt-5">{c.lead}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <ol className="m-0 p-0 list-none border-t border-foreground/15">
              {shown.map(([h, p], i) => (
                <li key={h} className="grid grid-cols-[2.5rem_1fr] gap-x-3 py-5 border-b border-foreground/15">
                  <span className="font-body text-sm text-muted-foreground tnum pt-[3px]">{i + 1}</span>
                  <div>
                    <h3 className="m-0 font-body text-[17px] md:text-[18px] font-medium text-foreground leading-snug text-balance">{h}</h3>
                    <p className="m-0 mt-1.5 font-body text-[15px] md:text-base text-muted-foreground leading-relaxed text-pretty max-w-[60ch]">{p}</p>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              aria-expanded={all}
              className="mt-5 font-body text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              {all ? c.less : `${c.more} (${c.tips.length - VISIBLE})`}
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default TipsSection;
