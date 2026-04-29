import jsPDF from "jspdf";
import heroImg from "@/assets/real-bedroom-luxury.jpg";
import livingImg from "@/assets/real-living-room.jpg";
import bedroomImg from "@/assets/real-bedroom-modern.jpg";

type Lang = "cs" | "vi";

const copy = {
  cs: {
    eyebrow: "KOMPLETNÍ SPRÁVA VAŠEHO BYTU",
    title1: "Váš byt. Naše péče.",
    title2: "Váš zisk.",
    intro:
      "Přeměníme váš byt v prémiové ubytování na Airbnb. Od kompletní přestavby po každodenní správu — vy jen inkasujete.",
    statsTitle: "Čísla, která mluví za nás",
    stats: [
      { v: "2.8×", l: "vyšší výnos" },
      { v: "95%", l: "obsazenost" },
      { v: "4.9/5", l: "hodnocení hostů" },
      { v: "15+", l: "spravovaných bytů" },
    ],
    whyTitle: "Proč ne dlouhodobý pronájem?",
    whyRows: [
      ["Kontrola bytu", "Vidíte ho 1× ročně", "Kontrola po každém hostu"],
      ["Údržba", "Závady se kumulují", "Opravy řešíme ihned"],
      ["Cena", "Stále stejný nájem", "Optimalizace každý den"],
      ["Riziko", "Neplatiči, spory", "Platba vždy předem"],
    ],
    moneyTitle: "O kolik přicházíte?",
    moneyBig: "+ 240 000 Kč / rok",
    moneySmall: "Rozdíl mezi krátkodobým a dlouhodobým pronájmem bytu 2+kk v Praze.",
    ctaTitle: "Chcete vědět, kolik vydělá právě váš byt?",
    ctaText: "Nezávazná konzultace zdarma. Výpočet do 24 hodin.",
    ctaUrl: "Navštivte: dauan.cz",
    footer: "ANTAM s.r.o. — Prémiová správa nemovitostí v Praze",
  },
  vi: {
    eyebrow: "QUẢN LÝ TOÀN DIỆN CĂN HỘ CỦA BẠN",
    title1: "Căn hộ của bạn. Sự chăm sóc của chúng tôi.",
    title2: "Lợi nhuận của bạn.",
    intro:
      "Chúng tôi biến căn hộ của bạn thành nơi lưu trú cao cấp trên Airbnb. Từ cải tạo đến quản lý hàng ngày — bạn chỉ việc thu tiền.",
    statsTitle: "Những con số nói lên tất cả",
    stats: [
      { v: "2.8×", l: "thu nhập cao hơn" },
      { v: "95%", l: "tỷ lệ lấp đầy" },
      { v: "4.9/5", l: "đánh giá của khách" },
      { v: "15+", l: "căn hộ quản lý" },
    ],
    whyTitle: "Tại sao không cho thuê dài hạn?",
    whyRows: [
      ["Kiểm tra căn hộ", "1 lần/năm", "Sau mỗi khách"],
      ["Bảo trì", "Hư hỏng tích tụ", "Sửa chữa ngay"],
      ["Giá thuê", "Cố định", "Tối ưu hàng ngày"],
      ["Rủi ro", "Khách không trả", "Thanh toán trước"],
    ],
    moneyTitle: "Bạn đang mất bao nhiêu?",
    moneyBig: "+ 240 000 Kč / năm",
    moneySmall: "Chênh lệch giữa cho thuê ngắn hạn và dài hạn căn 2+kk tại Praha.",
    ctaTitle: "Muốn biết căn hộ của bạn kiếm được bao nhiêu?",
    ctaText: "Tư vấn miễn phí. Tính toán trong vòng 24 giờ.",
    ctaUrl: "Truy cập: dauan.cz",
    footer: "ANTAM s.r.o. — Quản lý bất động sản cao cấp tại Praha",
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

  // Brand colors (charcoal + gold)
  const charcoal: [number, number, number] = [26, 26, 26];
  const gold: [number, number, number] = [201, 162, 39];
  const cream: [number, number, number] = [248, 245, 240];
  const muted: [number, number, number] = [110, 110, 110];

  // Background
  pdf.setFillColor(...cream);
  pdf.rect(0, 0, W, H, "F");

  // === HERO ===
  try {
    const hero = await loadImg(heroImg);
    pdf.addImage(hero, "JPEG", 0, 0, W, 95, undefined, "FAST");
  } catch {}
  // dark overlay
  pdf.setFillColor(26, 26, 26);
  pdf.setGState(pdf.GState({ opacity: 0.55 }));
  pdf.rect(0, 0, W, 95, "F");
  pdf.setGState(pdf.GState({ opacity: 1 }));

  // Brand
  pdf.setTextColor(255, 255, 255);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(11);
  pdf.text("ANTAM", 15, 15);
  const brandW = pdf.getTextWidth("ANTAM");
  pdf.setTextColor(...gold);
  pdf.setFont(FONT, "normal");
  pdf.text("s.r.o.", 15 + brandW + 2, 15);

  // Eyebrow
  pdf.setTextColor(...gold);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(8);
  pdf.text(c.eyebrow, 15, 45);

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(lang === "vi" ? 19 : 24);
  pdf.text(c.title1, 15, 58);
  pdf.setTextColor(...gold);
  pdf.text(c.title2, 15, 70);

  // Intro
  pdf.setTextColor(235, 235, 235);
  pdf.setFont(FONT, "normal");
  pdf.setFontSize(10);
  const introLines = pdf.splitTextToSize(c.intro, W - 30);
  pdf.text(introLines, 15, 80);

  // === STATS BAR ===
  pdf.setFillColor(...charcoal);
  pdf.rect(0, 95, W, 28, "F");

  pdf.setTextColor(...gold);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(8);
  pdf.text(c.statsTitle.toUpperCase(), 15, 103);

  const colW = (W - 30) / 4;
  c.stats.forEach((s, i) => {
    const x = 15 + i * colW;
    pdf.setTextColor(...gold);
    pdf.setFont(FONT, "bold");
    pdf.setFontSize(18);
    pdf.text(s.v, x, 114);
    pdf.setTextColor(220, 220, 220);
    pdf.setFont(FONT, "normal");
    pdf.setFontSize(7);
    pdf.text(s.l, x, 119);
  });

  // === WHY NOT LONG-TERM (comparison table) ===
  let y = 132;
  pdf.setTextColor(...charcoal);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(14);
  pdf.text(c.whyTitle, 15, y);

  // gold underline
  pdf.setDrawColor(...gold);
  pdf.setLineWidth(0.6);
  pdf.line(15, y + 2, 45, y + 2);

  y += 9;
  // header row
  pdf.setFillColor(...charcoal);
  pdf.rect(15, y, W - 30, 7, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(8);
  pdf.text(lang === "cs" ? "PARAMETR" : "TIÊU CHÍ", 18, y + 4.7);
  pdf.text(lang === "cs" ? "DLOUHODOBÝ" : "DÀI HẠN", 78, y + 4.7);
  pdf.setTextColor(...gold);
  pdf.text(lang === "cs" ? "ANTAM" : "ANTAM", 138, y + 4.7);
  y += 7;

  pdf.setFont(FONT, "normal");
  pdf.setFontSize(8.5);
  c.whyRows.forEach((row, i) => {
    if (i % 2 === 0) {
      pdf.setFillColor(255, 255, 255);
    } else {
      pdf.setFillColor(243, 240, 233);
    }
    pdf.rect(15, y, W - 30, 9, "F");

    pdf.setTextColor(...charcoal);
    pdf.setFont(FONT, "bold");
    pdf.text(row[0], 18, y + 5.8);
    pdf.setFont(FONT, "normal");
    pdf.setTextColor(...muted);
    const a = pdf.splitTextToSize(row[1], 55);
    pdf.text(a, 78, y + 5.8);
    pdf.setTextColor(...charcoal);
    const b = pdf.splitTextToSize(row[2], 55);
    pdf.text(b, 138, y + 5.8);
    y += 9;
  });

  // === MONEY HIGHLIGHT + GALLERY ===
  y += 6;
  // left money box
  pdf.setFillColor(...charcoal);
  pdf.rect(15, y, 95, 42, "F");
  pdf.setTextColor(...gold);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(8);
  pdf.text(c.moneyTitle.toUpperCase(), 20, y + 8);
  pdf.setFontSize(18);
  pdf.text(c.moneyBig, 20, y + 22);
  pdf.setTextColor(220, 220, 220);
  pdf.setFont(FONT, "normal");
  pdf.setFontSize(8);
  const ms = pdf.splitTextToSize(c.moneySmall, 85);
  pdf.text(ms, 20, y + 30);

  // right images (2 stacked)
  try {
    const i1 = await loadImg(livingImg);
    pdf.addImage(i1, "JPEG", 115, y, 80, 20, undefined, "FAST");
  } catch {}
  try {
    const i2 = await loadImg(bedroomImg);
    pdf.addImage(i2, "JPEG", 115, y + 22, 80, 20, undefined, "FAST");
  } catch {}

  // === CTA ===
  y += 50;
  pdf.setFillColor(...gold);
  pdf.rect(0, y, W, 28, "F");
  pdf.setTextColor(...charcoal);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(12);
  const ctaLines = pdf.splitTextToSize(c.ctaTitle, W - 30);
  pdf.text(ctaLines, 15, y + 8);
  pdf.setFont(FONT, "normal");
  pdf.setFontSize(9);
  pdf.text(c.ctaText, 15, y + 18);
  pdf.setFont(FONT, "bold");
  pdf.setFontSize(11);
  pdf.text(c.ctaUrl, 15, y + 24);

  // === FOOTER ===
  pdf.setTextColor(...muted);
  pdf.setFont(FONT, "normal");
  pdf.setFontSize(7.5);
  pdf.text(c.footer, W / 2, H - 5, { align: "center" });

  pdf.save(lang === "cs" ? "DAU-AN-prehled.pdf" : "DAU-AN-tong-quan.pdf");
}
