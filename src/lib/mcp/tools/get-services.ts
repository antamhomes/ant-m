import { defineTool } from "@lovable.dev/mcp-js";

const services = [
  { title: "Příprava bytu a interiér", description: "Poradíme, co hosté v dané lokalitě hledají: uspořádání, vybavení, drobnosti, které rozhodují o hodnocení. Bez zbytečných investic." },
  { title: "Fotky a prezentace", description: "Profesionální fotky, popis a nastavení nabídky tak, aby byt vynikl mezi stovkami dalších." },
  { title: "Cenotvorba", description: "Cenu ladíme denně podle sezóny, poptávky, obsazenosti a okolí — ne jedna cena na celý rok." },
  { title: "Hosté a komunikace", description: "Odpovědi do minut, informace k příjezdu, podpora během pobytu a rychlé řešení situací." },
  { title: "Úklid, kontrola a údržba", description: "Po každém pobytu úklid a kontrola stavu, drobné opravy hned, řemeslníci, když je potřeba." },
  { title: "Měsíční přehled", description: "Jasný přehled rezervací, výnosů, nákladů a toho, co se v bytě řešilo — na jednu stranu." },
];

const faq = [
  { question: "Musí být byt už připravený?", answer: "Ne. Umíme se podívat i na byt před spuštěním a říct, co dává smysl připravit." },
  { question: "Můžu byt někdy využít pro sebe?", answer: "Ano. Vybrané termíny lze v kalendáři dopředu zablokovat." },
  { question: "Jak budu vědět, co byt vydělává?", answer: "Každý měsíc zpětně přehled na jednu stranu: obsazené noci, výnos z jednotlivých platforem, provize 25 % a co se v bytě řešilo — spolu s fakturou na provizi." },
  { question: "Kolik správa stojí?", answer: "Provize je 25 % z výnosu z ubytování a je konečná — bez fixních ani měsíčních poplatků. Pokrývá i internet, hygienické potřeby pro hosty a čisticí prostředky. Drobné opravy do 5 000 Kč vyřídíme sami a náklady strhneme z výnosu; větší opravy nejdřív nahlásíme majiteli. Provize je včetně DPH — nic dalšího se nepřičítá." },
  { question: "Kdo platí úklid a energie?", answer: "Host platí vedle ceny za ubytování i úklidový poplatek; ten pokrývá úklid a prádlo a zůstává celý Antam Homes, takže se z výnosu majitele na úklid nic nestrhává (ve vyúčtování je samostatnou položkou). Výnos, který se dělí 75/25, je částka za ubytování bez úklidového poplatku. Energie (elektřina, voda, plyn) hradí majitel." },
  { question: "Jak dlouho spolupráce trvá a jak ji ukončím?", answer: "Smlouva je na dobu neurčitou s výpovědní lhůtou 4 měsíce. Potvrzené rezervace se během výpovědní lhůty ještě dokončí." },
  { question: "Je částka v kalkulačce před, nebo po provizi?", answer: "Po. Vše označené jako výnos pro majitele je už po odečtení provize 25 %. Provize je včetně DPH; energie hradí majitel zvlášť." },
  { question: "Jaké povinnosti krátkodobý pronájem přináší a kdo je řeší?", answer: "Evidence hostů, hlášení zahraničních hostů cizinecké policii, místní poplatek z pobytu a registrace v e-Turista — provozní povinnosti kolem hostů řeší Antam Homes. Zdanění příjmu z pronájmu zůstává na majiteli; podklady dostane." },
  { question: "Co když host něco poničí?", answer: "Byt se kontroluje po každém pobytu. Drobnosti se opraví hned (do 5 000 Kč z výnosu). Větší škoda se zdokumentuje a řeší s hostem a přes platformu (Airbnb AirCover, u ostatních podle platebních údajů hosta). Majitel se dozví hned, včetně fotek." },
  { question: "Co na to sousedé a SVJ?", answer: "Hosté dostávají pravidla domu předem, byt má danou kapacitu (žádné party) a sousedé mají kontakt. Pokud stanovy SVJ krátkodobé ubytování výslovně zakazují, Antam Homes to majiteli řekne před podpisem." },
  { question: "Proč to nedělat sám přes Airbnb?", answer: "Můžete — někteří majitelé to zvládají. Je to ale práce na každý den: odpovídat hostům do minut, hlídat ceny podle poptávky, řešit úklid a klíče a držet krok s tím, co Airbnb a Booking mění (algoritmy, pravidla, poplatky, povinnosti). Antam Homes to dělá denně pro víc bytů najednou." },
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