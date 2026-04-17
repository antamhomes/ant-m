// Test wrapper that imports the actual generator and feeds it browser-like APIs
import fs from "fs";
import { jsPDF } from "jspdf";

// Stub Image so loadImg in generator can resolve from data URIs we pre-fill
global.Image = class { constructor(){ setTimeout(()=>this.onload && this.onload(), 0); } set src(v){ this._src=v; } get src(){return this._src;} };

// We can't easily run the TS module as-is; just replicate final pipeline by re-importing the build steps.
// Instead, render via a fresh inline build that mirrors the latest source exactly.
const reg = fs.readFileSync("/tmp/fonts/NotoSans-Reg.ttf").toString("base64");
const bold = fs.readFileSync("/tmp/fonts/NotoSans-Bold.ttf").toString("base64");
const heroImg = fs.readFileSync("src/assets/real-bedroom-luxury.jpg").toString("base64");
const livingImg = fs.readFileSync("src/assets/real-living-room.jpg").toString("base64");
const bedroomImg = fs.readFileSync("src/assets/real-bedroom-modern.jpg").toString("base64");
const dataUri = (b) => `data:image/jpeg;base64,${b}`;

const copies = {
  cs: { eyebrow:"KOMPLETNÍ SPRÁVA VAŠEHO BYTU", title1:"Váš byt. Naše péče.", title2:"Váš zisk.",
    intro:"Přeměníme váš byt v prémiové ubytování na Airbnb. Od kompletní přestavby po každodenní správu — vy jen inkasujete.",
    statsTitle:"Čísla, která mluví za nás",
    stats:[{v:"2.8×",l:"vyšší výnos"},{v:"95%",l:"obsazenost"},{v:"4.9/5",l:"hodnocení hostů"},{v:"15+",l:"spravovaných bytů"}],
    whyTitle:"Proč ne dlouhodobý pronájem?",
    whyRows:[["Kontrola bytu","Vidíte ho 1× ročně","Kontrola po každém hostu"],["Údržba","Závady se kumulují","Opravy řešíme ihned"],["Cena","Stále stejný nájem","Optimalizace každý den"],["Riziko","Neplatiči, spory","Platba vždy předem"]],
    moneyTitle:"O kolik přicházíte?", moneyBig:"+ 240 000 Kč / rok", moneySmall:"Rozdíl mezi krátkodobým a dlouhodobým pronájmem bytu 2+kk v Praze.",
    ctaTitle:"Chcete vědět, kolik vydělá právě váš byt?", ctaText:"Nezávazná konzultace zdarma. Výpočet do 24 hodin.", ctaUrl:"Navštivte: dauan.cz",
    footer:"DAU AN s.r.o. — Prémiová správa nemovitostí v Praze", headerParam:"PARAMETR", headerLong:"DLOUHODOBÝ", headerUs:"DAU AN" },
  vi: { eyebrow:"QUẢN LÝ TOÀN DIỆN CĂN HỘ CỦA BẠN", title1:"Căn hộ của bạn. Sự chăm sóc của chúng tôi.", title2:"Lợi nhuận của bạn.",
    intro:"Chúng tôi biến căn hộ của bạn thành nơi lưu trú cao cấp trên Airbnb. Từ cải tạo đến quản lý hàng ngày — bạn chỉ việc thu tiền.",
    statsTitle:"Những con số nói lên tất cả",
    stats:[{v:"2.8×",l:"thu nhập cao hơn"},{v:"95%",l:"tỷ lệ lấp đầy"},{v:"4.9/5",l:"đánh giá của khách"},{v:"15+",l:"căn hộ quản lý"}],
    whyTitle:"Tại sao không cho thuê dài hạn?",
    whyRows:[["Kiểm tra căn hộ","1 lần/năm","Sau mỗi khách"],["Bảo trì","Hư hỏng tích tụ","Sửa chữa ngay"],["Giá thuê","Cố định","Tối ưu hàng ngày"],["Rủi ro","Khách không trả","Thanh toán trước"]],
    moneyTitle:"Bạn đang mất bao nhiêu?", moneyBig:"+ 240 000 Kč / năm", moneySmall:"Chênh lệch giữa cho thuê ngắn hạn và dài hạn căn 2+kk tại Praha.",
    ctaTitle:"Muốn biết căn hộ của bạn kiếm được bao nhiêu?", ctaText:"Tư vấn miễn phí. Tính toán trong vòng 24 giờ.", ctaUrl:"Truy cập: dauan.cz",
    footer:"DAU AN s.r.o. — Quản lý bất động sản cao cấp tại Praha", headerParam:"TIÊU CHÍ", headerLong:"DÀI HẠN", headerUs:"DAU AN" },
};

function build(lang){
  const c = copies[lang];
  const pdf = new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
  pdf.addFileToVFS("NotoSans-Regular.ttf",reg); pdf.addFont("NotoSans-Regular.ttf","NotoSans","normal");
  pdf.addFileToVFS("NotoSans-Bold.ttf",bold); pdf.addFont("NotoSans-Bold.ttf","NotoSans","bold");
  const F="NotoSans"; const W=210,H=297;
  const charcoal=[26,26,26],gold=[201,162,39],cream=[248,245,240],muted=[110,110,110];
  pdf.setFillColor(...cream); pdf.rect(0,0,W,H,"F");
  pdf.addImage(dataUri(heroImg),"JPEG",0,0,W,95,undefined,"FAST");
  pdf.setFillColor(26,26,26); pdf.setGState(pdf.GState({opacity:0.55})); pdf.rect(0,0,W,95,"F"); pdf.setGState(pdf.GState({opacity:1}));
  pdf.setTextColor(255,255,255); pdf.setFont(F,"bold"); pdf.setFontSize(11); pdf.text("DAU AN",15,15);
  const bw = pdf.getTextWidth("DAU AN");
  pdf.setTextColor(...gold); pdf.setFont(F,"normal"); pdf.text("s.r.o.",15+bw+2,15);
  pdf.setTextColor(...gold); pdf.setFont(F,"bold"); pdf.setFontSize(8); pdf.text(c.eyebrow,15,45);
  pdf.setTextColor(255,255,255); pdf.setFontSize(lang==="vi"?19:24); pdf.text(c.title1,15,58);
  pdf.setTextColor(...gold); pdf.text(c.title2,15,70);
  pdf.setTextColor(235,235,235); pdf.setFont(F,"normal"); pdf.setFontSize(10);
  pdf.text(pdf.splitTextToSize(c.intro,W-30),15,80);
  pdf.setFillColor(...charcoal); pdf.rect(0,95,W,28,"F");
  pdf.setTextColor(...gold); pdf.setFont(F,"bold"); pdf.setFontSize(8); pdf.text(c.statsTitle.toUpperCase(),15,103);
  const colW=(W-30)/4;
  c.stats.forEach((s,i)=>{const x=15+i*colW;
    pdf.setTextColor(...gold); pdf.setFont(F,"bold"); pdf.setFontSize(18); pdf.text(s.v,x,114);
    pdf.setTextColor(220,220,220); pdf.setFont(F,"normal"); pdf.setFontSize(7); pdf.text(s.l,x,119);});
  let y=132;
  pdf.setTextColor(...charcoal); pdf.setFont(F,"bold"); pdf.setFontSize(14); pdf.text(c.whyTitle,15,y);
  pdf.setDrawColor(...gold); pdf.setLineWidth(0.6); pdf.line(15,y+2,45,y+2); y+=9;
  pdf.setFillColor(...charcoal); pdf.rect(15,y,W-30,7,"F");
  pdf.setTextColor(255,255,255); pdf.setFont(F,"bold"); pdf.setFontSize(8);
  pdf.text(c.headerParam,18,y+4.7); pdf.text(c.headerLong,78,y+4.7);
  pdf.setTextColor(...gold); pdf.text(c.headerUs,138,y+4.7); y+=7;
  pdf.setFont(F,"normal"); pdf.setFontSize(8.5);
  c.whyRows.forEach((row,i)=>{
    pdf.setFillColor(i%2===0?255:243,i%2===0?255:240,i%2===0?255:233); pdf.rect(15,y,W-30,9,"F");
    pdf.setTextColor(...charcoal); pdf.setFont(F,"bold"); pdf.text(row[0],18,y+5.8);
    pdf.setFont(F,"normal"); pdf.setTextColor(...muted);
    pdf.text(pdf.splitTextToSize(row[1],55),78,y+5.8);
    pdf.setTextColor(...charcoal); pdf.text(pdf.splitTextToSize(row[2],55),138,y+5.8); y+=9;});
  y+=6;
  pdf.setFillColor(...charcoal); pdf.rect(15,y,95,42,"F");
  pdf.setTextColor(...gold); pdf.setFont(F,"bold"); pdf.setFontSize(8); pdf.text(c.moneyTitle.toUpperCase(),20,y+8);
  pdf.setFontSize(18); pdf.text(c.moneyBig,20,y+22);
  pdf.setTextColor(220,220,220); pdf.setFont(F,"normal"); pdf.setFontSize(8);
  pdf.text(pdf.splitTextToSize(c.moneySmall,85),20,y+30);
  pdf.addImage(dataUri(livingImg),"JPEG",115,y,80,20,undefined,"FAST");
  pdf.addImage(dataUri(bedroomImg),"JPEG",115,y+22,80,20,undefined,"FAST");
  y+=50;
  pdf.setFillColor(...gold); pdf.rect(0,y,W,28,"F");
  pdf.setTextColor(...charcoal); pdf.setFont(F,"bold"); pdf.setFontSize(12);
  pdf.text(pdf.splitTextToSize(c.ctaTitle,W-30),15,y+8);
  pdf.setFont(F,"normal"); pdf.setFontSize(9); pdf.text(c.ctaText,15,y+18);
  pdf.setFont(F,"bold"); pdf.setFontSize(11); pdf.text(c.ctaUrl,15,y+24);
  pdf.setTextColor(...muted); pdf.setFont(F,"normal"); pdf.setFontSize(7.5);
  pdf.text(c.footer,W/2,H-5,{align:"center"});
  return pdf;
}
fs.writeFileSync("/tmp/pdfqa/cs2.pdf", Buffer.from(build("cs").output("arraybuffer")));
fs.writeFileSync("/tmp/pdfqa/vi2.pdf", Buffer.from(build("vi").output("arraybuffer")));
console.log("ok");
