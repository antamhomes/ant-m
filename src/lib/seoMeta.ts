/** Meta per page and language; the cesty are in lib/pages.ts. Plain TS: vite.config.ts imports it at build time. */
export const META: Record<"home" | "sprava" | "vlastni-provoz", { cs: { title: string; desc: string }; vi: { title: string; desc: string } }> = {
  home: {
    cs: {
      title: "Správa krátkodobých pronájmů a Airbnb v Praze | Antam Homes",
      desc: "Krátkodobý pronájem v Praze: správa za 20 % + DPH s písemným ročním minimem, nebo hotový systém k vlastnímu provozu. Obě cesty spočítáme vedle sebe.",
    },
    vi: {
      title: "Quản lý cho thuê ngắn hạn & Airbnb tại Praha | Antam Homes",
      desc: "Quản lý cho thuê ngắn hạn (Airbnb, Booking) tại Praha: Antam lo khách, dọn dẹp, giá và bảng kê. Căn nào nhận cũng có mức tối thiểu ghi trong hợp đồng.",
    },
  },
  sprava: {
    cs: {
      title: "Správa Airbnb bytu v Praze za 20 % + DPH | Antam Homes",
      desc: "Byt připravíme za 39 000 Kč a provozujeme za 20 % + DPH z příjmu po poplatcích: hosté, úklid, ceny, vyúčtování. Písemné roční minimum, 12 měsíců, bez výstupního poplatku.",
    },
    vi: {
      title: "Antam quản lý căn hộ Airbnb tại Praha, phí 20% + VAT | Antam Homes",
      desc: "Antam chuẩn bị nhà với 39 000 Kč và vận hành với phí 20% + VAT trên doanh thu sau phí: khách, dọn dẹp, giá, bảng kê. Mức tối thiểu ghi trong hợp đồng, 12 tháng, không phí rời đi.",
    },
  },
  "vlastni-provoz": {
    cs: {
      title: "Provozní systém Antam: Airbnb byt k vlastnímu provozu | Antam Homes",
      desc: "Postavíme vám provozní systém krátkodobého pronájmu na vašich účtech a předáme vám ho: 180 000 až 360 000 Kč jednou, pak žádná procenta z výnosu. 90 dní podpory.",
    },
    vi: {
      title: "Hệ thống vận hành Antam: căn hộ Airbnb để tự vận hành | Antam Homes",
      desc: "Antam dựng hệ thống vận hành cho thuê ngắn hạn trên tài khoản của anh chị rồi bàn giao: 180 000 đến 360 000 Kč một lần, sau đó không mất phần trăm. 90 ngày hỗ trợ.",
    },
  },
};

