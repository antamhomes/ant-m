import { defineTool } from "@lovable.dev/mcp-js";
import { DAMAGE_COVER_PER_ROOM, DAMAGE_COVER_MAX, ROOMS, annualDamageCover } from "../../yield";

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
  { question: "Kolik je potřeba investovat do přípravy nemovitosti?", answer: "Záleží na stavu a vybavení bytu. Uvedení do provozu stojí 25 000 Kč: příprava bytu a nabídek, focení, nastavení cen a spuštění prodeje. Vybavení se kupuje za pořizovací ceny s doklady, bez přirážky; u projektů nad 30 000 Kč účtuje Antam Homes 20 % z rozpočtu za řízení. U úplně prázdného bytu počítejte orientačně kolem 100 000 Kč na jeden pokoj; vybavení zůstává majitele." },
  { question: "Můžu byt někdy využít pro sebe?", answer: "Byt si můžete kdykoli blokovat pro sebe nebo rodinu. U nejvytíženějších svátků, jako jsou Vánoce, Silvestr a Velikonoce, se na termínu nejdřív domluvíme. Už potvrzené rezervace hostů zůstávají nedotčené." },
  { question: "Jak budu vědět, co byt vydělává?", answer: "Každý měsíc zpětně přehled na jednu stranu: obsazené noci, výnos z jednotlivých platforem, provize platforem, odměna 28 % a co se v bytě řešilo, spolu s fakturou na odměnu. Vyúčtování i výplata proběhnou do 15. dne následujícího měsíce." },
  { question: "Kolik správa stojí?", answer: "Naše odměna je 28 % z čistého výnosu: z toho, co přijde od Airbnb a Booking.com, po odečtení úklidového poplatku. Je konečná, nic dalšího se nepřičítá, bez fixních ani měsíčních poplatků, a je v ní i garance výnosu. Pokrývá také DPH z provize platformy, internet, hygienické potřeby pro hosty a čisticí prostředky. Drobné opravy do 5 000 Kč vyřídíme sami a náklady strhneme z výnosu, dohromady nejvýše 20 000 Kč za rok; větší opravy nejdřív nahlásíme majiteli." },
  { question: "Co je Garance výnosu?", answer: "Ke každému bytu, který Antam Homes vezme do správy, dostane majitel písemné roční minimum: nájem, který by byt vydělal dlouhodobě, plus energie. Když výnos za 12 měsíců zůstane pod minimem, rozdíl se dorovná z odměn Antam Homes, nebo může majitel okamžitě odejít; volba je jeho. Způsobilost bytu se ověřuje zdarma předem a byt, který garanci neunese, Antam Homes do správy nevezme." },
  { question: "Kdo platí úklid a energie?", answer: "Host platí vedle ceny za ubytování i úklidový poplatek; ten pokrývá úklid a prádlo a zůstává celý Antam Homes, takže se z výnosu majitele na úklid nic nestrhává (ve vyúčtování je samostatnou položkou). Výnos, který se dělí 72/28, je to, co přijde od platformy, po odečtení úklidového poplatku. Energie (elektřina, voda) hradí majitel." },
  { question: "Kdo platí DPH z provize platformy?", answer: "Antam Homes, ze své odměny. Airbnb a Booking.com fakturují provizi ze zahraničí a česká DPH z ní se odvádí u nás; do výnosu majitele nevstupuje a z jeho podílu se nestrhává." },
  { question: "Jak dlouho spolupráce trvá a jak ji ukončím?", answer: "Smlouva se uzavírá na 12 měsíců. Po nich pokračuje na dobu neurčitou a lze ji kdykoli ukončit s výpovědní lhůtou 4 měsíce. Potvrzené rezervace se během výpovědní lhůty vždy dokončí." },
  { question: "Je částka v kalkulačce před, nebo po provizi?", answer: "Po. Vše označené jako výnos pro majitele je už po odečtení provize platformy i odměny 28 %. Odměna je konečná; energie hradí majitel zvlášť." },
  { question: "Jaké povinnosti krátkodobý pronájem přináší a kdo je řeší?", answer: "Evidence hostů, hlášení zahraničních hostů cizinecké policii, místní poplatek z pobytu a registrace v e-Turista, provozní povinnosti kolem hostů řeší Antam Homes. Zdanění příjmu z pronájmu zůstává na majiteli; podklady dostane." },
  { question: "Co když host něco poničí?", answer: "Byt se kontroluje po každém pobytu. Škoda se zdokumentuje a nejdřív vymáhá po hostovi a přes platformu (Airbnb AirCover, řešení škod Booking.com). Co se tam nepodaří získat, hradí Antam Homes do ročního limitu podle velikosti bytu: 5 000 Kč u 1+kk, 10 000 Kč u 2+kk, 15 000 Kč u 3+kk, 20 000 Kč u 4+kk a 25 000 Kč u větších. Majitel se dozví hned, včetně fotek. Krytí se týká škod způsobených hostem; opotřebení, poruchy z věku a závady v domě jsou opravy a údržba a zůstávají na majiteli (drobné do 5 000 Kč se řeší hned a strhávají z výnosu, nejvýše 20 000 Kč za rok, větší po jeho souhlasu)." },
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
    structuredContent: {
      services,
      faq,
      managementCommissionRate: 0.28,
      commissionBase:
        "net revenue = what the platform pays out for accommodation, without the cleaning fee, after deducting the Airbnb/Booking.com commission. The Czech VAT on that commission is paid by Antam Homes out of its own fee and is not deducted from the owner's share.",
      ownerContract: {
        initialTermMonths: 12,
        thenIndefinite: true,
        noticePeriodMonths: 4,
      },
      guestDamageCover: {
        description:
          "Qualifying smaller guest-caused damage is first claimed from the guest and through the platform. What is not recovered there is covered by Antam Homes up to a yearly per-apartment limit. Wear and tear, age-related failures and building faults are repairs and stay with the owner.",
        yearlyLimitPerRoomCzk: DAMAGE_COVER_PER_ROOM,
        yearlyLimitMaxCzk: DAMAGE_COVER_MAX,
        yearlyLimitByLayoutCzk: {
          ...Object.fromEntries(Object.entries(ROOMS).map(([k, rooms]) => [k, annualDamageCover(rooms)])),
          "5kk+": DAMAGE_COVER_MAX,
        },
      },
    },
  }),
});