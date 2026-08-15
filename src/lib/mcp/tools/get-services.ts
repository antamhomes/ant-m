import { defineTool } from "@lovable.dev/mcp-js";

const services = [
  { title: "Listing & profesionální prezentace", description: "Fotky, popis, pravidla a nastavení bytu na platformách tak, aby přitáhl pozornost." },
  { title: "Dynamické ceny", description: "Cenu ladíme podle sezóny, obsazenosti a aktuální poptávky, aby byt vydělával naplno." },
  { title: "Komunikace s hosty", description: "Dotazy, informace k příjezdu, průběžná podpora a rychlé řešení situací." },
  { title: "Úklid a kontrola kvality", description: "Po každém pobytu byt kontrolujeme a hlídáme detaily, aby zůstal v dobrém stavu." },
  { title: "Údržba a řešení problémů", description: "Drobné opravy, pohotové zásahy a koordinace řemeslníků, když je potřeba." },
  { title: "Měsíční reporting", description: "Jasný přehled rezervací, výnosů, nákladů a důležitých informací o bytu." },
];

const faq = [
  { question: "Musí být byt už připravený?", answer: "Ne. Umíme se podívat i na byt před spuštěním a říct, co dává smysl připravit." },
  { question: "Řešíte Airbnb i Booking.com?", answer: "Ano. Platformy volíme podle bytu, lokality a typu hostů." },
  { question: "Můžu byt někdy využít pro sebe?", answer: "Ano. Vybrané termíny lze v kalendáři dopředu zablokovat." },
  { question: "Jak budu vědět, co byt vydělává?", answer: "Každý měsíc dostanete přehled: kolik nocí bylo obsazeno, jaký byl výnos, kolik činila naše provize 25 % a co jsme v bytě řešili. Vše na jednu stranu, bez složitých tabulek." },
  { question: "Kolik správa stojí?", answer: "Provize je 25 % z výnosu z ubytování a je konečná — bez fixních ani měsíčních poplatků. Pokrývá i internet, hygienické potřeby pro hosty a čisticí prostředky. Drobné opravy do 5 000 Kč vyřídíme sami a náklady strhneme z výnosu; větší opravy nejdřív nahlásíme majiteli. Částky uvádíme bez DPH." },
  { question: "Kdo platí úklid a energie?", answer: "Úklid a praní prádla hradí host v ceně rezervace a zajišťuje je Antam Homes — výnos majitele nesnižují. Energie (elektřina, voda, plyn) hradí majitel." },
  { question: "Jak dlouho spolupráce trvá a jak ji ukončím?", answer: "Smlouva je na dobu neurčitou s výpovědní lhůtou 4 měsíce. Potvrzené rezervace se během výpovědní lhůty ještě dokončí." },
  { question: "Kdy a jak dostanu vyúčtování?", answer: "Měsíčně zpětně: přehled rezervací a výnosů z platforem (Airbnb, Booking.com) spolu s fakturou na provizi." },
  { question: "Je částka v kalkulačce před, nebo po provizi?", answer: "Po. Vše označené jako výnos pro majitele je už po odečtení provize 25 %. Částky bez DPH; energie hradí majitel zvlášť." },
  { question: "Jaké povinnosti krátkodobý pronájem přináší a kdo je řeší?", answer: "Evidence hostů, hlášení zahraničních hostů cizinecké policii, místní poplatek z pobytu a registrace v e-Turista — provozní povinnosti kolem hostů řeší Antam Homes. Zdanění příjmu z pronájmu zůstává na majiteli; podklady dostane." },
  { question: "Co když host něco poničí?", answer: "Byt se kontroluje po každém pobytu. Drobnosti se opraví hned (do 5 000 Kč z výnosu). Větší škoda se zdokumentuje a řeší s hostem a přes platformu (Airbnb AirCover, u ostatních podle platebních údajů hosta). Majitel se dozví hned, včetně fotek." },
  { question: "Co na to sousedé a SVJ?", answer: "Hosté dostávají pravidla domu předem, byt má danou kapacitu (žádné party) a sousedé mají kontakt. Pokud stanovy SVJ krátkodobé ubytování výslovně zakazují, Antam Homes to majiteli řekne před podpisem." },
  { question: "Pro koho krátkodobý pronájem nedává smysl?", answer: "Když SVJ ubytování zakazuje nebo to sousedé nechtějí; když majitel potřebuje každý měsíc stejnou částku; když chce byt většinu roku používat sám; když je byt ve stavu, do kterého nechce nic dát. Lokalita mimo centrum ani starší dům problém nejsou." },
];

export default defineTool({
  name: "get_services_and_faq",
  title: "Get services and FAQ",
  description:
    "Get what Antam Homes does for apartment owners (full short-term rental management) plus the frequently asked questions and answers from the website.",
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
    structuredContent: { services, faq, managementCommissionRate: 0.25 },
  }),
});