import { defineTool } from "@lovable.dev/mcp-js";

const services = [
  { title: "Příprava bytu a interiér", description: "Poradíme, co hosté v dané lokalitě hledají: uspořádání, vybavení, drobnosti, které rozhodují o hodnocení. Bez zbytečných investic." },
  { title: "Fotky a prezentace", description: "Profesionální fotky, popis a nastavení nabídky tak, aby byt vynikl mezi stovkami dalších." },
  { title: "Cenotvorba", description: "Cenu ladíme denně podle sezóny, poptávky, obsazenosti a okolí, ne jedna cena na celý rok." },
  { title: "Hosté a komunikace", description: "Odpovědi do minut, informace k příjezdu, podpora během pobytu a rychlé řešení situací." },
  { title: "Úklid, kontrola a údržba", description: "Po každém pobytu úklid a kontrola stavu, drobné opravy hned, řemeslníci, když je potřeba." },
  { title: "Měsíční přehled", description: "Jasný přehled rezervací, výnosů, nákladů a toho, co se v bytě řešilo, na jednu stranu." },
];

const faq = [
  { question: "Musí být byt už připravený?", answer: "Ne. Umíme se podívat i na byt před spuštěním a říct, co dává smysl připravit." },
  { question: "Kolik je potřeba investovat do přípravy nemovitosti?", answer: "Záleží na současném stavu a vybavení bytu. U úplně prázdného bytu počítejte orientačně kolem 100 000 Kč na jeden pokoj. Cílem je připravit byt tak, aby mezi ostatními nabídkami dobře obstál a působil konkurenceschopně. Po zaplacení zálohy Antam Homes připraví orientační seznam toho, co je potřeba koupit a kolik to bude stát." },
  { question: "Můžu byt někdy využít pro sebe?", answer: "Ano. Vybrané termíny lze v kalendáři dopředu zablokovat." },
  { question: "Jak budu vědět, co byt vydělává?", answer: "Každý měsíc zpětně přehled na jednu stranu: obsazené noci, výnos z jednotlivých platforem, provize 25 % a co se v bytě řešilo, spolu s fakturou na provizi." },
  { question: "Kolik správa stojí?", answer: "Provize je 25 % z výnosu z ubytování a je konečná, bez fixních ani měsíčních poplatků. Pokrývá i internet, hygienické potřeby pro hosty a čisticí prostředky. Drobné opravy do 5 000 Kč vyřídíme sami a náklady strhneme z výnosu; větší opravy nejdřív nahlásíme majiteli. Provize je včetně DPH, nic dalšího se nepřičítá." },
  { question: "Kdo platí úklid a energie?", answer: "Host platí vedle ceny za ubytování i úklidový poplatek; ten pokrývá úklid a prádlo a zůstává celý Antam Homes, takže se z výnosu majitele na úklid nic nestrhává (ve vyúčtování je samostatnou položkou). Výnos, který se dělí 75/25, je částka za ubytování bez úklidového poplatku. Energie (elektřina, voda) hradí majitel." },
  { question: "Jak dlouho spolupráce trvá a jak ji ukončím?", answer: "Smlouva se uzavírá na jeden rok, poté pokračuje a lze ji ukončit s výpovědní lhůtou 6 měsíců. Důvod: hosté rezervují často půl roku i déle dopředu a kalendář je otevřený stejně daleko; byt s jistotou provozu prodává líp. Potvrzené rezervace se během výpovědní lhůty vždy dokončí." },
  { question: "Je částka v kalkulačce před, nebo po provizi?", answer: "Po. Vše označené jako výnos pro majitele je už po odečtení provize 25 %. Provize je včetně DPH; energie hradí majitel zvlášť." },
  { question: "Jaké povinnosti krátkodobý pronájem přináší a kdo je řeší?", answer: "Evidence hostů, hlášení zahraničních hostů cizinecké policii, místní poplatek z pobytu a registrace v e-Turista, provozní povinnosti kolem hostů řeší Antam Homes. Zdanění příjmu z pronájmu zůstává na majiteli; podklady dostane." },
  { question: "Co když host něco poničí?", answer: "Byt se kontroluje po každém pobytu. Drobnosti se opraví hned (do 5 000 Kč z výnosu). Větší škoda se zdokumentuje a nejdřív vymáhá po hostovi a přes platformu (Airbnb AirCover, řešení škod Booking.com); na majitele se Antam Homes obrací až tehdy, když se náhrada nepodaří získat tam. Majitel se dozví hned, včetně fotek." },
  { question: "Co na to sousedé a SVJ?", answer: "Hosté dostávají pravidla domu předem, byt má danou kapacitu (žádné party) a sousedé mají kontakt. Pokud stanovy SVJ krátkodobé ubytování výslovně zakazují, Antam Homes to majiteli řekne před podpisem." },
  { question: "Proč to nedělat sám přes Airbnb?", answer: "Můžete, někteří majitelé to zvládají. Je to ale práce na každý den: odpovídat hostům do minut, hlídat ceny podle poptávky, řešit úklid a klíče a držet krok s tím, co Airbnb a Booking mění (algoritmy, pravidla, poplatky, povinnosti). Antam Homes to dělá denně pro víc bytů najednou." },
  { question: "Pracujete i s jinými platformami nebo firmami?", answer: "Byty se inzerují tam, kde je v Praze reálná poptávka: především Airbnb a Booking.com, které Antam Homes zná do detailu (algoritmy, pravidla, změny). Další platformy se přidávají jen tam, kde bytu přinesou rezervace navíc. Provoz nejde přes prostředníky: hosty, ceny, úklid i kontrolu bytu řeší vlastní tým, externí jsou jen řemeslníci." },
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