import jsPDF from "jspdf";
import heroImg from "@/assets/real-bedroom-luxury.jpg";

type Lang = "cs" | "vi";

const copy = {
  cs: {
    eyebrow: "PÉČE O BYT A KRÁTKODOBÝ PRONÁJEM",
    title1: "Váš byt. Naše péče.",
    title2: "Váš zisk.",
    intro:
      "Kompletní správa krátkodobého pronájmu — od přípravy nabídky po hosty, úklid a přehledné výnosy.",
    statsTitle: "antam homes v číslech",
    stats: [
      { v: "15+", l: "bytů v provozu" },
      { v: "4.9★", l: "hodnocení hostů" },
      { v: "až 95 %", l: "obsazenost" },
      { v: "až 2.8×", l: "vyšší výnos" },
    ],
    servicesTitle: "Co za vás řešíme",
    services: [
      ["Příprava nabídky", "Fotky, popis, pravidla a nastavení bytu na platformách."],
      ["Hosté a komunikace", "Dotazy, příjezd, podpora a řešení situací."],
      ["Úklid a kontrola", "Po každém pobytu byt kontrolujeme a hlídáme detaily."],
      ["Cena a obsazenost", "Pracujeme s cenou, sezónou a kalendářem."],
      ["Přehled pro majitele", "Rezervace, výnosy, náklady a důležité informace."],
    ],
    whyTitle: "Krátkodobý vs. dlouhodobý pronájem",
    whyRows: [
      ["Kontrola stavu bytu", "Až po delší době", "Po každém pobytu"],
      ["Výnos", "Nereaguje na sezónu", "Cena podle sezóny a poptávky"],
      ["Flexibilita", "Vázáno smlouvou", "Termíny lze blokovat dopředu"],
      ["Přehled plateb", "Řeší majitel", "Reporty z platforem"],
    ],
    processTitle: "Jak začíná spolupráce",
    process: [
      ["1.", "Pošlete nám byt", "Adresa, fotky nebo odkaz a pár informací."],
      ["2.", "Zhodnotíme směr", "Lokalita, stav bytu, okolní nabídka."],
      ["3.", "Navrhneme postup", "Co dává smysl připravit nebo nastavit."],
      ["4.", "Spustíme správu", "Hosté, úklid, cena, obsazenost i provoz."],
    ],
    ctaTitle: "Nezávazně probereme váš byt.",
    ctaText: "Pošlete nám základní informace. Ozveme se a řekneme, jaký směr může dávat smysl.",
    contactLine: "+420 776 123 456  ·  info@an-tam.com  ·  antamhomes.com",
    disclaimer: "Výsledky se liší podle lokality, stavu bytu, sezóny a nastavení ceny.",
    footer: "Antam s.r.o. (dříve DAU AN s.r.o.) — IČO: 03328511 — Praha, Česká republika",
  },
  vi: {
    eyebrow: "CHĂM SÓC CĂN HỘ VÀ CHO THUÊ NGẮN HẠN",
    title1: "Căn hộ của bạn. Sự chăm sóc của chúng tôi.",
    title2: "Lợi nhuận của bạn.",
    intro:
      "Quản lý toàn diện cho thuê ngắn hạn — từ chuẩn bị listing đến khách, dọn dẹp và báo cáo rõ ràng.",
    statsTitle: "antam homes qua những con số",
    stats: [
      { v: "15+", l: "căn hộ vận hành" },
      { v: "4.9★", l: "đánh giá của khách" },
      { v: "đến 95 %", l: "lượng khách thuê" },
      { v: "đến 2.8×", l: "doanh thu cao hơn" },
    ],
    servicesTitle: "antam homes hỗ trợ những gì",
    services: [
      ["Chuẩn bị listing", "Hình ảnh, mô tả, quy định và thiết lập trên nền tảng."],
      ["Khách và giao tiếp", "Trả lời, hướng dẫn nhận phòng, hỗ trợ khi cần."],
      ["Dọn dẹp và kiểm tra", "Sau mỗi lượt khách, căn hộ được kiểm tra kỹ."],
      ["Giá và lượng khách thuê", "Theo dõi giá, mùa và lịch trống."],
      ["Báo cáo cho chủ nhà", "Đặt phòng, doanh thu, chi phí và ghi chú quan trọng."],
    ],
    whyTitle: "Ngắn hạn vs. dài hạn",
    whyRows: [
      ["Tình trạng căn hộ", "Sau thời gian dài", "Sau mỗi lượt khách"],
      ["Doanh thu", "Cố định theo hợp đồng", "Điều chỉnh theo mùa"],
      ["Linh hoạt", "Bị ràng buộc bởi hợp đồng", "Có thể chặn lịch trước"],
      ["Theo dõi thanh toán", "Chủ nhà tự xử lý", "Báo cáo từ nền tảng"],
    ],
    processTitle: "Quy trình hợp tác",
    process: [
      ["1.", "Gửi thông tin căn hộ", "Địa chỉ, hình ảnh hoặc link và vài thông tin."],
      ["2.", "Xem hướng phù hợp", "Vị trí, tình trạng căn hộ, khu vực xung quanh."],
      ["3.", "Đề xuất cách làm", "Những gì nên chuẩn bị, điều chỉnh hoặc thiết lập."],
      ["4.", "Bắt đầu vận hành", "Khách, dọn dẹp, giá thuê, lấp đầy và vận hành."],
    ],
    ctaTitle: "Trao đổi nhẹ nhàng về căn hộ của cô chú.",
    ctaText: "Gửi vài thông tin cơ bản. Chúng tôi sẽ liên hệ và trao đổi hướng phù hợp.",
    contactLine: "+420 776 123 456  ·  info@antamhomes.com  ·  antamhomes.com",
    disclaimer: "Kết quả khác nhau tùy vị trí, tình trạng căn hộ, mùa và giá.",
    footer: "Antam s.r.o. (trước đây DAU AN s.r.o.) — IČO: 03328511 — Praha, Cộng hòa Séc",
  },
};

const loadImg = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function generateBrochure(lang: Lang) {
  const c = copy[lang];
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // Register Unicode font (NotoSans) so Czech & Vietnamese diacritics render correctly
  const { notoSansRegular, notoSansBold } = await import("./notoSansFont");
  pdf.addFileToVFS("NotoSans-Regular.ttf", notoSansRegular);
  pdf.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  pdf.addFileToVFS("NotoSans-Bold.ttf", notoSansBold);
  pdf.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
  const FONT = "NotoSans";

  const W = 210;
  const H = 297;

  // Brand colors
  const charcoal: [number, number, number] = [26, 26, 26];
  const gold: [number, number, number] = [201, 162, 39];
  const cream: [number, number, number] = [248, 245, 240];
  const muted: [number, number, number] = [110, 110, 110];
  const line: [number, number, number] = [225, 220, 210];

  // Background
  pdf.setFillColor(...cream);
  pdf.rect(0, 0, W, H, "F");

  // === HERO (compact) ===
  const heroH = 70;
  try {
    const hero = await loadImg(heroImg);
    pdf.addImage(hero, "JPEG", 0, 0, W, heroH, undefined, "FAST");
  } catch {}
  pdf.setFillColor(26, 26, 26);
  pdf.setGState(pdf.GState({ opacity: 0.6 }));
  pdf.rect(0, 0, W, heroH, "F");
  pdf.setGState(pdf.GState({ opacity: 1 }));

  // Brand
  pdf.setTextColor(255, 255, 255);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(11);
  pdf.text("antam", 15, 13);
  const brandW = pdf.getTextWidth("antam");
  pdf.setTextColor(...gold);
  pdf.text(" homes", 15 + brandW, 13);

  // Eyebrow
  pdf.setTextColor(...gold);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(7.5);
  pdf.text(c.eyebrow, 15, 32);

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(lang === "vi" ? 17 : 22);
  pdf.text(c.title1, 15, 45);
  pdf.setTextColor(...gold);
  pdf.text(c.title2, 15, 56);

  // Intro
  pdf.setTextColor(235, 235, 235);
  pdf.setFont(FONT, "normal");
  pdf.setFontSize(9);
  const introLines = pdf.splitTextToSize(c.intro, W - 30);
  pdf.text(introLines, 15, 64);

  // === STATS BAR ===
  const statsY = heroH;
  pdf.setFillColor(...charcoal);
  pdf.rect(0, statsY, W, 20, "F");
  const colW = (W - 30) / 4;
  c.stats.forEach((s, i) => {
    const x = 15 + i * colW;
    pdf.setTextColor(...gold);
    pdf.setFont(FONT, "bold");
    pdf.setFontSize(13);
    pdf.text(s.v, x, statsY + 9);
    pdf.setTextColor(220, 220, 220);
    pdf.setFont(FONT, "normal");
    pdf.setFontSize(7);
    pdf.text(s.l, x, statsY + 14.5);
  });

  let y = statsY + 28;

  // === SERVICES ===
  pdf.setTextColor(...charcoal);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(12);
  pdf.text(c.servicesTitle, 15, y);
  pdf.setDrawColor(...gold);
  pdf.setLineWidth(0.6);
  pdf.line(15, y + 1.5, 35, y + 1.5);
  y += 7;

  c.services.forEach(([title, desc]) => {
    pdf.setFillColor(...gold);
    pdf.circle(17, y - 1.2, 0.9, "F");
    pdf.setTextColor(...charcoal);
    pdf.setFont(FONT, "bold");
    pdf.setFontSize(9);
    pdf.text(title, 21, y);
    pdf.setFont(FONT, "normal");
    pdf.setTextColor(...muted);
    pdf.setFontSize(8.5);
    const dl = pdf.splitTextToSize(desc, W - 70);
    pdf.text(dl, 70, y);
    y += Math.max(5.5, dl.length * 4);
  });

  y += 4;

  // === WHY (comparison table) ===
  pdf.setTextColor(...charcoal);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(12);
  pdf.text(c.whyTitle, 15, y);
  pdf.setDrawColor(...gold);
  pdf.line(15, y + 1.5, 35, y + 1.5);
  y += 6;

  // header
  pdf.setFillColor(...charcoal);
  pdf.rect(15, y, W - 30, 6.5, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(7.5);
  pdf.text(lang === "cs" ? "PARAMETR" : "TIÊU CHÍ", 17, y + 4.4);
  pdf.text(lang === "cs" ? "DLOUHODOBÝ" : "DÀI HẠN", 78, y + 4.4);
  pdf.setTextColor(...gold);
  pdf.text("antam homes", 138, y + 4.4);
  y += 6.5;

  pdf.setFontSize(8);
  c.whyRows.forEach((row, i) => {
    const rowFill: [number, number, number] = i % 2 === 0 ? [255, 255, 255] : [243, 240, 233];
    pdf.setFillColor(...rowFill);
    pdf.rect(15, y, W - 30, 7.5, "F");
    pdf.setTextColor(...charcoal);
    pdf.setFont(FONT, "bold");
    pdf.text(row[0], 17, y + 4.9);
    pdf.setFont(FONT, "normal");
    pdf.setTextColor(...muted);
    pdf.text(pdf.splitTextToSize(row[1], 55), 78, y + 4.9);
    pdf.setTextColor(...charcoal);
    pdf.text(pdf.splitTextToSize(row[2], 55), 138, y + 4.9);
    y += 7.5;
  });

  y += 6;

  // === PROCESS ===
  pdf.setTextColor(...charcoal);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(12);
  pdf.text(c.processTitle, 15, y);
  pdf.setDrawColor(...gold);
  pdf.line(15, y + 1.5, 35, y + 1.5);
  y += 6;

  // 2x2 grid (per project memory rule)
  const stepW = (W - 30 - 6) / 2;
  const stepH = 18;
  c.process.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = 15 + col * (stepW + 6);
    const sy = y + row * (stepH + 4);
    pdf.setDrawColor(...line);
    pdf.setLineWidth(0.3);
    pdf.rect(sx, sy, stepW, stepH);
    pdf.setTextColor(...gold);
    pdf.setFont(FONT, "bold");
    pdf.setFontSize(11);
    pdf.text(s[0], sx + 3, sy + 6);
    pdf.setTextColor(...charcoal);
    pdf.setFontSize(9);
    pdf.text(s[1], sx + 11, sy + 6);
    pdf.setFont(FONT, "normal");
    pdf.setTextColor(...muted);
    pdf.setFontSize(8);
    pdf.text(pdf.splitTextToSize(s[2], stepW - 6), sx + 3, sy + 11);
  });
  y += stepH * 2 + 4 + 6;

  // === CTA ===
  pdf.setFillColor(...gold);
  pdf.rect(0, y, W, 22, "F");
  pdf.setTextColor(...charcoal);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(11);
  pdf.text(c.ctaTitle, 15, y + 8);
  pdf.setFont(FONT, "normal");
  pdf.setFontSize(8.5);
  pdf.text(pdf.splitTextToSize(c.ctaText, W - 30), 15, y + 13);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(9);
  pdf.text(c.contactLine, 15, y + 19);

  // === FOOTER ===
  pdf.setTextColor(...muted);
  pdf.setFont(FONT, "normal");
  pdf.setFontSize(6.5);
  pdf.text(c.disclaimer, W / 2, H - 8, { align: "center" });
  pdf.text(c.footer, W / 2, H - 4, { align: "center" });

  pdf.save(lang === "cs" ? "antam-homes-prehled.pdf" : "antam-homes-tong-quan.pdf");
}
