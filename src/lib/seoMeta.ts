/** Meta per page and language; the cesty are in lib/pages.ts. Plain TS: vite.config.ts imports it at build time. */
export const META: Record<"home" | "sprava" | "vlastni-provoz", { cs: { title: string; desc: string }; vi: { title: string; desc: string } }> = {
  // 5. 11. 2026: homepage je nabídka nájmu investorům. VI texty zůstávají jen
  // jako typová výplň (vietnamská verze zrušena), nikde se nevykreslují.
  home: {
    cs: {
      title: "Splácíme hypotéky investorům: nájem bytu na 3 roky | Antam",
      desc: "Pronajmeme si váš byt v Praze na 3 roky a platíme nájem ve výši vaší splátky hypotéky. Každý měsíc, i když je byt prázdný. Byt posoudíme před koupí, do 24 hodin.",
    },
    vi: {
      title: "Quản lý căn hộ cho thuê ngắn hạn tại Praha | Antam Homes",
      desc: "Quản lý cho thuê ngắn hạn (Airbnb, Booking) tại Praha: Antam lo khách, dọn dẹp, giá và bảng kê. Căn nào nhận cũng có mức tối thiểu ghi trong hợp đồng.",
    },
  },
  sprava: {
    cs: {
      title: "Správa Airbnb bytu v Praze za 20 % + DPH | Antam Homes",
      desc: "Byt připravíme za 39 000 Kč a provozujeme za 20 % + DPH z příjmu po poplatcích: hosté, úklid, ceny, vyúčtování. Písemné roční minimum, 12 měsíců, bez výstupního poplatku.",
    },
    vi: {
      title: "Antam quản lý căn hộ cho thuê ngắn hạn ở Praha, phí 20% + DPH | Antam Homes",
      desc: "Antam chuẩn bị nhà với 39 000 Kč và vận hành với phí 20% + DPH trên doanh thu sau phí: khách, dọn dẹp, giá, bảng kê. Mức tối thiểu ghi trong hợp đồng, 12 tháng, không phí rời đi.",
    },
  },
  "vlastni-provoz": {
    cs: {
      title: "Provozní systém Antam: Airbnb byt k vlastnímu provozu | Antam Homes",
      desc: "Postavíme vám provozní systém krátkodobého pronájmu na vašich účtech a předáme vám ho: 270 000 Kč jednou, pak žádná procenta z výnosu. 60 dní podpory.",
    },
    vi: {
      title: "Tự vận hành căn hộ cho thuê ngắn hạn: Antam dựng và bàn giao | Antam Homes",
      desc: "Antam dựng hệ thống vận hành cho thuê ngắn hạn trên tài khoản của anh chị rồi bàn giao: 270 000 Kč một lần, sau đó không mất phần trăm. 60 ngày hỗ trợ.",
    },
  },
};

