import { defineTool } from "@lovable.dev/mcp-js";
import { LTV, TERM_YEARS, LEASE_MONTHS, RENT_DAYS_BEFORE, DEFAULT_EXIT_DAYS, REGULATION_NOTICE_MONTHS } from "../../lease";

const services = [
  { title: "Nájem na 3 roky ve výši splátky", description: "Antam si byt pronajme na 36 měsíců a platí nájem ve výši splátky standardní investiční hypotéky (70 % ceny, 30 let). Každý měsíc, i když je byt prázdný. Nájem je splatný 5 dní před splátkou hypotéky." },
  { title: "Posouzení bytu před koupí", description: "Investor pošle odkaz na inzerát, do 24 hodin ví, jestli Antam splátku pokryje celou, zčásti, nebo byt posoudí individuálně. Zdarma, nezávazně." },
  { title: "Vybavení", description: "Výběr, nákup, doprava a montáž přes Antam za pořizovací ceny plus 20 %. Vybavení kupuje investor a zůstává jeho." },
  { title: "Provoz", description: "Byt Antam pronajímá krátkodobě, nebo střednědobě firmám. Energie, internet, služby k užívání, úklid, drobné opravy a celý provoz platí Antam. Investor platí fond oprav, daň z nemovitosti a pojištění domu a vybavení." },
  { title: "Provozní systém Antam (vlastní provoz)", description: "Pro majitele, kteří chtějí byt provozovat sami: Antam postaví provozní systém na jejich účtech a předá ho. 270 000 Kč bez DPH jednou, jakákoli dispozice; řízení cen prvních 60 dní v ceně, pak 3 490 Kč měsíčně." },
];

const faq = [
  { question: "Uzná mi banka nájem od Antam jako příjem?", answer: "Nájemní smlouva s firmou na 3 roky a platby na účtu investora jsou stabilní příjem. Kolik z něj která banka započítá, je na ní; většinou část, ne celý. Po prvním roce je nájem i v daňovém přiznání." },
  { question: "Proč zrovna 70 % a 30 let?", answer: "Je to standardní investiční hypotéka: 70 % je strop ČNB pro byty na pronájem od dubna 2026 a 30 let běžná splatnost. Kratší splatnost nebo vyšší splátku nad standardní splátku doplácí investor." },
  { question: "Kdo platí fond oprav a pojištění?", answer: "Investor: fond oprav, daň z nemovitosti, pojištění domu a vybavení. Antam: energie, internet, služby k užívání bytu, úklid, drobné opravy a celý provoz. Rozpis je součástí smlouvy." },
  { question: "Komu patří vybavení?", answer: "Investorovi. Kupuje ho přes Antam za pořizovací ceny plus 20 % za výběr, nákup, dopravu a montáž. Po skončení nájmu zůstává v bytě." },
  { question: "Co se stane po třech letech?", answer: "Investor dostane byt zpět vybavený a v provozu. Může ho prodat, pronajmout dlouhodobě, nebo s Antam podepsat další 3 roky." },
  { question: "Co je to za smlouvu?", answer: "Nájem prostoru k podnikání se souhlasem majitele s krátkodobým ubytováním. Ne nájem bytu k bydlení. Vzor dostane investor před podpisem." },
  { question: "Co když Antam nezaplatí?", answer: "Nájem chodí 5 dní před splátkou hypotéky. Když nepřijde 30 dní, smlouva končí a investor dostává byt zpět vybavený." },
  { question: "Co když se změní zákon?", answer: "Když stát, obec nebo úřad krátkodobé ubytování v bytě znemožní, má Antam dvouměsíční výpověď. Do té doby platí. Byt vrací vybavený." },
  { question: "Co když host něco rozbije?", answer: "Antam opraví na vlastní náklady. Byt je po každém hostovi uklizený a každý týden kontrolovaný." },
  { question: "Musí to vědět SVJ?", answer: "Ano, Antam to oznámí. SVJ krátkodobé ubytování ve stanovách zakázat nemůže, může ale upravit pravidla domu." },
  { question: "Vydělá na tom Antam?", answer: "Ano. Byt vydělá víc, než je nájem investora, a rozdíl je marže Antam. Je to cena za to, že splátka chodí každý měsíc a investor nedělá nic." },
  { question: "Co když investorovi skončí fixace?", answer: "Nájem je pevná částka: splátka v den podpisu. Když po fixaci splátka stoupne, rozdíl doplácí investor; když klesne, rozdíl je jeho. Antam doporučuje fixaci na 3 roky a déle." },
  { question: "Jak se nájem daní?", answer: "Jako příjem z nájmu podle § 9. Úroky z hypotéky, odpisy bytu a fond oprav jsou náklad, daň bývá v prvních letech blízko nuly. Investor si to ověří s účetním." },
  { question: "Které byty Antam bere?", answer: "Praha 1, 2, 3, Karlín, Smíchov. 1+kk až 3+kk. Ne každý byt pokryje celý; řekne to před koupí." },
];

export default defineTool({
  name: "get_services_and_faq",
  title: "Get services and FAQ",
  description:
    "Get Antam's offer to Prague property investors (3-year lease paying the investor's mortgage payment), the self-operation alternative, and the FAQ from the website.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text" as const,
        text: [
          "Services:",
          ...services.map((s) => `- ${s.title}: ${s.description}`),
          "",
          "FAQ:",
          ...faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`),
        ].join("\n"),
      },
    ],
    structuredContent: {
      services,
      faq,
      lease: {
        termMonths: LEASE_MONTHS, loanToValue: LTV, mortgageTermYears: TERM_YEARS, rentEquals: "standard mortgage payment (70 % LTV, 30 years)",
        rentDaysBeforeMortgage: RENT_DAYS_BEFORE, paidInEmptyMonths: true, defaultExitDays: DEFAULT_EXIT_DAYS, regulationNoticeMonths: REGULATION_NOTICE_MONTHS,
        furnitureProcurementFee: 0.20, districts: ["Praha 1", "Praha 2", "Praha 3", "Karlín", "Smíchov"], layouts: ["1kk", "2kk", "3kk"],
      },
      selfOperatedSystemCzk: { anyLayout: 270000, furnishedOrEmptySame: true, revenueManagementMonthly: 3490, revenueManagementIncludedDays: 60, procurementFee: 0.20, procurementFeeAboveCzk: 500000, procurementRateAbove: 0.12 },
    },
  }),
});