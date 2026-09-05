/**
 * One source of truth for every yield number on the site.
 *
 * Přestavěno 30. 8. 2026: model stojí na TRŽNÍCH datech celých čtvrtí
 * (PriceLabs STR index přes MCP market_research, oficiální hranice čtvrtí
 * z OSM, 12 uzavřených měsíců 8/2025 až 7/2026, surová data v
 * data/pricelabs-2026-08/). Už žádné comp sety vlastních listingů ani
 * paušální obsazenost: kalkulačka říká, co dělá průměrný byt dané čtvrti
 * a velikosti na trhu.
 *
 * ZÁKLAD výpočtu = roční RevPAR čtvrti a pásma (průměr měsíčních RevPAR,
 * tedy průměr součinů ADR × obsazenost, ne součin průměrů; prosinec táhne).
 * SEZÓNY = násobky RevPAR i ADR z týchž měsíčních řad, vážené počtem
 * nabídek přes pásma; 7×léto + 4×zima + 1×prosinec = 12×rok PŘESNĚ.
 * OBSAZENOST ve výsledku = RevPAR / ADR, tedy tržní průměr čtvrti.
 *
 * Buňku ukazujeme jen při průměrně ≥ 50 aktivních nabídkách a bez anomálií
 * (P3/P4/P6/P7/P9 mají tenká pásma, viz poznámky v datech). Praha 10 čeká
 * na doplnění dat (rate limit 30. 8.), do té doby „posoudíme individuálně“.
 * Nikdy neopisovat čísla jedné čtvrti do jiné.
 *
 * Přestavěno 31. 8. 2026 (čtyři vstupy: čtvrť, dispozice, plocha, sezóna) po
 * rekonciliaci jedenácti vlastních bytů proti PriceLabs za 8/2025 až 7/2026.
 * Tři věci se tím změnily. Efekt Antam je naměřený poměr tržby proti průměru
 * trhu (operatorFactor), ne zvednutá obsazenost: obsazenost u nás opravdu jede
 * 92 až 96 %, ale za 63 až 77 % tržního ADR, takže kombinace „plné tržní ADR
 * a zvednutá obsazenost" popisovala byt, který nemáme. RevPAR × dny se převádí
 * na tržbu za kalendářní měsíc přes AVAILABILITY, protože RevPAR počítá jen
 * dostupné noci. A pásmo se bere z dispozice A plochy, ne z kapacity odvozené
 * jen z dispozice: 2+kk může být 1BR i 2BR produkt podle toho, jestli se dá
 * zařídit pro šest (Mozart 40 m² pro čtyři vs. Čelakovského 52 m² pro osm).
 * Nájem se řídí jen plochou.
 */

export type SizeKey = "1kk" | "2kk" | "3kk" | "4kk";
export type LocationKey =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9" | "praha10";

/**
 * O výdělku rozhoduje, kolik hostů se vejde (rozhodnutí 30. 8. 2026). Majitel
 * to ale nezadává: kapacita se odvodí z dispozice a plochy tak, jak Antam
 * byty reálně listuje (ložnice × 2 + rozkládací gauč v obýváku): 1+kk 4,
 * 2+kk 6, 3+kk 8, 4+kk 10. Každých plných 20 m² nad typickou plochu dispozice
 * (medián MF) přidá 2 hosty, nejvýš +2. Přesná kapacita se určí při prohlídce.
 * Od patche 142 bez plošného bonusu: plocha už není vstup, kapacita jde čistě
 * z dispozice a přesně se určí při prohlídce.
 */
/** Medián výměry nájemního bytu v Praze podle MF, v m². */
export const MEDIAN_AREA: Record<SizeKey, number> = {
  "1kk": 35, "2kk": 53, "3kk": 71, "4kk": 88,
};
export const BASE_GUESTS: Record<SizeKey, number> = { "1kk": 4, "2kk": 6, "3kk": 8, "4kk": 10 };
export const guestsFor = (size: SizeKey) => BASE_GUESTS[size];

/** Pásmo trhu podle kapacity: host na Airbnb filtruje podle počtu osob. Na
 *  PriceLabs biny podle ložnic to sedí tak, jak Antam listuje (2+kk s gaučem
 *  = dvě ložnice): do 4 hostů = 1BR, 5 až 8 = 2BR, 9 a víc = 3BR. */
export type Band = "1BR" | "2BR" | "3BR";
export const bandFor = (guests: number): Band =>
  guests <= 4 ? "1BR" : guests <= 8 ? "2BR" : "3BR";
export const BAND_LABEL: Record<Band, { cs: string; vi: string }> = {
  "1BR": { cs: "1 ložnice", vi: "1 phòng ngủ" },
  "2BR": { cs: "2 ložnice", vi: "2 phòng ngủ" },
  "3BR": { cs: "3+ ložnice", vi: "3+ phòng ngủ" },
};

/** Čtvrti, kde má trh dost velký vzorek na aspoň jedno pásmo. */
export type MeasuredLocation =
  | "praha1" | "praha2" | "praha3" | "praha4" | "praha5"
  | "praha6" | "praha7" | "praha8" | "praha9";
export const isMeasured = (loc: string): loc is MeasuredLocation =>
  loc in MARKET_STR;

/**
 * Tržní data čtvrti po pásmech (PriceLabs STR index, 8/2025 až 7/2026,
 * oficiální hranice čtvrti; zdroj: data/pricelabs-2026-08/*.json).
 * adr = roční průměr realizovaného ADR (Kč/noc), revpar = průměr měsíčních
 * RevPAR (Kč/noc na dostupnou noc), listings = průměr aktivních nabídek
 * (velikost vzorku). Chybějící pásmo = vzorek pod ~50 nabídek nebo anomálie
 * v řadě, takové číslo NEukazujeme (P1 3BR má 320 nabídek, P9 2BR jen 24).
 */
export const MARKET_STR: Record<MeasuredLocation, Partial<Record<Band, MarketRow>>> = {
  praha1: { "1BR": { adr: 2917, revpar: 2207.5, nMean: 1675, nMin: 1606 }, "2BR": { adr: 4507, revpar: 3399.3, nMean: 904, nMin: 866 }, "3BR": { adr: 6576, revpar: 4924.8, nMean: 320, nMin: 308 } },
  praha2: { "1BR": { adr: 2419, revpar: 1739.9, nMean: 920, nMin: 869 },  "2BR": { adr: 3748, revpar: 2831.4, nMean: 361, nMin: 346 }, "3BR": { adr: 5874, revpar: 4278.2, nMean: 128, nMin: 120 } },
  praha3: { "1BR": { adr: 2130, revpar: 1568.9, nMean: 626, nMin: 592 },  "2BR": { adr: 3085, revpar: 2303.5, nMean: 179, nMin: 162 } },
  praha4: { "1BR": { adr: 1810, revpar: 1254.0, nMean: 184, nMin: 158 },  "2BR": { adr: 2539, revpar: 1697.0, nMean: 69, nMin: 60 } },
  praha5: { "1BR": { adr: 2259, revpar: 1579.7, nMean: 452, nMin: 408 },  "2BR": { adr: 3378, revpar: 2363.4, nMean: 183, nMin: 158 }, "3BR": { adr: 5599, revpar: 3710.5, nMean: 74, nMin: 65 } },
  praha6: { "1BR": { adr: 1873, revpar: 1286.6, nMean: 155, nMin: 144 },  "2BR": { adr: 2913, revpar: 1878.9, nMean: 83, nMin: 79 } },
  praha7: { "1BR": { adr: 2105, revpar: 1507.0, nMean: 215, nMin: 196 },  "2BR": { adr: 3336, revpar: 2087.1, nMean: 98, nMin: 91 } },
  praha8: { "1BR": { adr: 2532, revpar: 1902.3, nMean: 350, nMin: 336 },  "2BR": { adr: 3654, revpar: 2508.0, nMean: 92, nMin: 86 } },
  praha9: { "1BR": { adr: 2065, revpar: 1363.9, nMean: 76, nMin: 64 } },
};

/**
 * Celoměstský poměr mezi pásmy (PriceLabs, tytéž řady, vážený počtem nabídek
 * přes čtvrti se solidním vzorkem obou pásem): o ložnici víc = ×1,5 na ceně
 * za noc i na RevPAR. Z toho se dopočítá pásmo, kde má čtvrť málo nabídek
 * (P3/P4/P6/P7/P8 3BR, P9 2BR a 3BR); takové číslo nese derived: true a web
 * to u něj napíše. Rozhodnutí 30. 8. 2026 („proč jen 2?“): odvozuje se
 * z nejbližšího spolehlivého pásma, krok po kroku. Hlídá facts.test.ts.
 */
export const SIZE_RATIO = {
  "2BR/1BR": { adr: 1.525, revpar: 1.517 },
  "3BR/2BR": { adr: 1.514, revpar: 1.481 },
  /** Přímý poměr přes dvě pásma. Spočítaný z týchž řad jako oba sousední
   *  (čtvrti se solidním vzorkem obou pásem, váženo nabídkami), ne jejich
   *  součin: řetězit dva odvozené poměry zesiluje chybu. Rozhodnutí
   *  31. 8. 2026 po rekonciliaci jedenácti bytů. */
  "3BR/1BR": { adr: 2.329, revpar: 2.304 },
} as const;
/**
 * Řádek trhu. Počet nabídek má DVĚ různá čísla a každé odpovídá na jinou otázku:
 *  - `nMean` = průměr aktivních nabídek přes 12 měsíců. Používá se tam, kde se
 *    VÁŽÍ (donor při shodné vzdálenosti pásma, shrinkage čtvrti), protože adr
 *    i revpar jsou taky průměry přes měsíce — míchat průměrné metriky
 *    s minimálním počtem by bylo nekoherentní.
 *  - `nMin` = minimum přes těch 12 měsíců, tedy nejtenčí měsíc. Používá se
 *    VÝHRADNĚ jako brána spolehlivosti.
 * Do 31. 8. 2026 tu bylo jedno pole `listings` (průměr) a Supabase pod týmž
 * názvem drží minimum, takže dvě úložiště hlásila pro tentýž pull jiné n.
 * `nMin: null` = surový artefakt chybí, hodnota je rekonstruovaná (viz
 * RECONSTRUCTED_CELLS).
 *
 * Zaokrouhlení `nMean`: půlka VŽDY nahoru (JS Math.round). Repo mělo do
 * 31. 8. 2026 dvě různá: praha4 1BR 183,5 → 184, ale praha6 1BR 154,5 → 154.
 * Sjednoceno nahoru, praha6 1BR tím jde 154 → 155. Na žádné zobrazené číslo to
 * nemá vliv: nMean rozhoduje jen o donorovi při SHODNÉ vzdálenosti pásma
 * (což u praha6 nenastává) a o shrinkage čtvrti (praha6 čtvrť nemá).
 */
export type MarketRow = { adr: number; revpar: number; nMean: number; nMin: number | null };
export type MarketCell = { adr: number; revpar: number; nMean: number; nMin: number | null; derived: boolean };

/**
 * JEDINÉ pravidlo spolehlivosti. NOVÉ PRAVIDLO od 31. 8. 2026, ne přejmenování:
 * dřív se práh 50 aplikoval na PRŮMĚR, nově na MINIMUM. Ověřeno, že se tím
 * nepřeklopí ani jedna z 27 buněk, takže je změna číselně neutrální — ale
 * je to jiné pravidlo a při dalším pullu se rozhodne jinak.
 * `reliable` se nikde NEUKLÁDÁ, vždycky se odvozuje odsud.
 */
export const RELIABLE_MIN_N = 50;
export const isReliableN = (nMin: number | null): boolean => nMin !== null && nMin >= RELIABLE_MIN_N;

/**
 * Buňky bez surového artefaktu v repu. Nejsou zakázané, ale musí být PŘIZNANÉ:
 * test je z dat přepočítat nemůže. Od 5. 9. 2026 PRÁZDNÉ: Staré Město,
 * jediná taková buňka, bylo přetaženo s měsíční řadou (viz MARKET_CTVRT).
 * Mechanismus zůstává — každá další rekonstrukce se sem musí zapsat a test
 * ve facts.test.ts to vynucuje (nMin null bez záznamu tady = fail).
 */
export const RECONSTRUCTED_CELLS: Record<string, string> = {};
/**
 * Buňka trhu pro čtvrť a pásmo. Když čtvrť pásmo nemá dost velké, odvodí se
 * JEDNÍM krokem z nejbližšího spolehlivého pásma téže čtvrti přímým poměrem.
 * Nikdy se neřetězí dva poměry za sebou: 3BR se bere buď z 2BR (×3BR/2BR),
 * nebo, když 2BR chybí taky, rovnou z 1BR (×3BR/1BR).
 */
const RATIO_OF: Record<string, { adr: number; revpar: number }> = {
  "1BR>2BR": SIZE_RATIO["2BR/1BR"],
  "2BR>3BR": SIZE_RATIO["3BR/2BR"],
  "1BR>3BR": SIZE_RATIO["3BR/1BR"],
};
const BAND_ORDER: Band[] = ["1BR", "2BR", "3BR"];
export const marketCell = (loc: MeasuredLocation, band: Band): MarketCell | null => {
  const own = MARKET_STR[loc][band];
  if (own) return { ...own, derived: false };
  // Donor = NEJBLIŽŠÍ spolehlivé pásmo (kratší extrapolace = menší chyba;
  // poměr 2BR→3BR má rozptyl 3,4 %, kdežto 1BR→3BR 7,2 %). Při stejné
  // vzdálenosti rozhoduje větší vzorek.
  const target = BAND_ORDER.indexOf(band);
  const donors = BAND_ORDER
    .filter((b) => b !== band && MARKET_STR[loc][b])
    .sort((a, b) => {
      const da = Math.abs(BAND_ORDER.indexOf(a) - target), db = Math.abs(BAND_ORDER.indexOf(b) - target);
      return da !== db ? da - db : MARKET_STR[loc][b]!.nMean - MARKET_STR[loc][a]!.nMean;
    });
  for (const from of donors) {
    const up = BAND_ORDER.indexOf(from) < BAND_ORDER.indexOf(band);
    const k = RATIO_OF[up ? `${from}>${band}` : `${band}>${from}`];
    if (!k) continue;
    const src = MARKET_STR[loc][from]!;
    return {
      adr: Math.round(up ? src.adr * k.adr : src.adr / k.adr),
      revpar: up ? src.revpar * k.revpar : src.revpar / k.revpar,
      nMean: src.nMean,
      nMin: src.nMin,
      derived: true,
    };
  }
  return null;
};

/**
 * Efekt Antam Homes. Do 31. 8. 2026 to byl zvednutý koeficient obsazenosti
 * (×1,15, strop 85 %) aplikovaný na plné tržní ADR. Rekonciliace jedenácti
 * vlastních bytů proti PriceLabs (12 měsíců 8/2025–7/2026) ukázala, že ta
 * kombinace u nás nenastává: obsazenost opravdu jede 92–96 % proti trhu
 * 68–77 %, ale za 63–77 % tržního ADR. Čistý poměr tržby proti průměru trhu
 * vyšel v Praze 1 na 0,99 (402 1,08, 405 0,95, 302 0,94), v Praze 3 na 1,21
 * (Modern AC 1,31) a v Praze 5 na 1,08 (Mozart).
 *
 * Od 31. 8. 2026 veřejný faktor NENÍ paušální srážka: odvozuje se z měření
 * pravidlem pod tímhle blokem. Praha 1 tak jde z 0,95 na naměřených 0,99,
 * protože ta srážka nebyla ničím podložená. Pravidlo, že každý náš byt musí
 * veřejný odhad překonat, bylo opuštěno a nevrací se. Interní podklad pro
 * nabídku majiteli počítá dál s 1,00.
 */
export const OPERATOR_FACTOR_DEFAULT_PUBLIC = 1.1;
export const OPERATOR_FACTOR_DEFAULT = 1.1;

/**
 * Co je kde NAMĚŘENÉ, včetně velikosti vzorku. Veřejný faktor se z tohohle
 * odvozuje pravidlem níž, nezapisuje se ručně — aby se sám posunul, jak
 * vlastním bytům přibývá historie.
 */
export const OPERATOR_EVIDENCE: Partial<Record<LocationKey, { measured: number; weight: number; sample: string }>> = {
  // PŘEMĚŘENO 2. 9. 2026 (audit shodných období). Dřívějších 0,99 se nedalo
  // reprodukovat — odvození nebylo nikde uložené. Nové měření: 12 uzavřených
  // měsíců 2025_08..2026_07, tržba za ubytování PO SLEVÁCH proti avg_revenue
  // okresu z data/pricelabs-2026-08/praha1.json.
  praha1: { measured: 1.032, weight: 1.00, sample: "3 byty × 12 měsíců (402 1,126 · 405 1,028 · 302 0,942)" },
  praha3: { measured: 1.21, weight: 0.50, sample: "2 byty (Modern AC 1,31 / 139 dní · Garden APT 1,21 / 54 dní)" },
  praha5: { measured: 1.08, weight: 1.00, sample: "1 byt (Mozart, 113 dní)" },
};

/**
 * Veřejný faktor z naměřeného. PRAVIDLO, ne jednotlivá čísla:
 *
 *  - měření, které veřejné číslo SNIŽUJE (pod výchozí 1,10), se bere celé;
 *  - měření, které ho ZVYŠUJE, se krátí k výchozí 1,10 podle váhy vzorku
 *    (týž princip jako ctvrtWeight u čtvrtí: tenký vzorek se stahuje k celku).
 *
 * Ta asymetrie je ZÁMĚRNÁ veřejná opatrnost, ne statistika, a je tu napsaná
 * proto, aby se za statistiku nevydávala: příznivé měření musí být pořádné,
 * nepříznivé bereme hned. Bez toho by model byl selektivně optimistický.
 *
 * Praha 3: naměřeno 1,21, ale na dvou bytech a Garden APT má za sebou 54 dní,
 * tedy kus jedné sezóny. Váha 0,50 -> 1,155. Až Garden doběhne rok, váha jde
 * nahoru a číslo se posune samo.
 * Praha 5: naměřeno 1,08, tedy POD výchozí 1,10, a bere se celé, i když to
 * veřejné číslo snižuje.
 * Praha 2: žádný vlastní byt, tedy ŽÁDNÉ měření. Do 2. 9. 2026 tu stálo ruční
 * 0,95, což nebyl konzervativní odhad, ale nepodložená srážka: každý okres,
 * kde se opravdu měří, vyšel 1,03 nebo výš. Výjimka se ruší a Praha 2 spadne
 * na výchozí 1,10 jako každý jiný neměřený okres. Není to tvrzení o výkonu,
 * je to odstranění zvláštního případu.
 *
 * METODIKA MĚŘENÍ (audit 2. 9. 2026, ať se to příště nemusí hádat):
 * základem je `guest.accommodation` z Hospitable, tedy částka PO SLEVÁCH
 * a před provizí platformy — `host.accommodation` je ceníková cena před
 * slevami a nadsazuje o 7 %. Rezervace z Booking.com jsou vedené v EUR
 * (`financials.currency`), Airbnb v CZK; sečíst je bez přepočtu je chyba,
 * která posune faktor řádově. Přepočítává se měsíčním průměrem ČNB podle
 * měsíce, do kterého noc spadá.
 * Praha 4, 6, 7, 8, 9: bez měření, výchozí 1,10. Praha 8 se NESRÁŽÍ za to,
 * že jí vychází vysoký násobek — uvnitř okresu je Karlín a ten okresní
 * benchmark legitimně táhne nahoru.
 */
export const publicFactorFrom = (measured: number, weight: number): number =>
  measured <= OPERATOR_FACTOR_DEFAULT_PUBLIC
    ? measured
    : Math.round((OPERATOR_FACTOR_DEFAULT_PUBLIC + weight * (measured - OPERATOR_FACTOR_DEFAULT_PUBLIC)) * 1000) / 1000;

export const OPERATOR_FACTOR_PUBLIC: Partial<Record<LocationKey, number>> = {
  // Praha 2 tu měla ruční 0,95. Zrušeno 2. 9. 2026: bez měření platí výchozí
  // 1,10 jako pro každý jiný neměřený okres (viz operatorFactor níž).
  ...Object.fromEntries(
    Object.entries(OPERATOR_EVIDENCE).map(([loc, e]) => [loc, publicFactorFrom(e.measured, e.weight)]),
  ),
};
/**
 * Interní faktory jsou ZÁMĚRNĚ TOTOŽNÉ s veřejnými. Rozdíl mezi veřejným
 * odhadem a interním propočtem NENÍ násobitel, ale MNOŽSTVÍ INFORMACÍ:
 * veřejně se neznámá konfigurace mísí mezi pásmy, interně se nahradí tím,
 * co je na prohlídce vidět (viz ObservedConfig níž).
 *
 * Prohlídka totiž odstraní nejistotu o KONKRÉTNÍM BYTĚ, ale nezvětší vzorek,
 * ze kterého je změřený OKRESNÍ faktor. Zvednout Prahu 3 z 1,155 na naměřených
 * 1,21 jen proto, že jsem byt viděl, by ty dvě různé nejistoty zaměnilo.
 * Faktor se pohne teprve tím, že vlastním bytům přibude historie.
 */
export const OPERATOR_FACTOR_INTERNAL: Partial<Record<LocationKey, number>> = OPERATOR_FACTOR_PUBLIC;

/**
 * RevPAR × dny NENÍ tržba na inzerát. PriceLabs počítá obsazenost a RevPAR
 * z DOSTUPNÝCH nocí (blokované noci jsou pryč), kdežto avg_revenue je tržba
 * na aktivní inzerát za celý kalendářní měsíc. Rozklad všech 27 segmentů
 * (Praha 1–9 × tři pásma, 8/2025–7/2026) dává avg_revenue / (RevPAR × dny)
 * = 0,92 s rozptylem 0,88 až 0,98; průměrně 8 % nocí je blokovaných.
 * Bez tohoto koeficientu by web nadsazoval o 8 % a operátorský faktor,
 * změřený proti avg_revenue, by se s tím vynásobil podruhé.
 */
export const AVAILABILITY = 0.92;
export const operatorFactor = (loc: string, scope: "public" | "internal" = "public") =>
  (scope === "public" ? OPERATOR_FACTOR_PUBLIC : OPERATOR_FACTOR_INTERNAL)[loc as LocationKey]
  ?? (scope === "public" ? OPERATOR_FACTOR_DEFAULT_PUBLIC : OPERATOR_FACTOR_DEFAULT);

/**
 * Dispozice → pásmo trhu. Do 31. 8. 2026 se pásmo bralo z kapacity odvozené
 * jen z dispozice (2+kk = 6 hostů = vždy 2BR). Rekonciliace vlastních bytů
 * ukázala, že to platí jen pro byty, které se opravdu dají zařídit pro šest.
 * Modern AC a free movies jsou 2+kk pro 6 a vydělávají jako 2BR. Čelakovského
 * 402, 405 a 302 jsou taky 2+kk (jedna samostatná ložnice, v obýváku postel
 * a gauč) a komerčně jedou jako plnohodnotný 2BR produkt. Mozart je 2+kk
 * pro 4 a vydělává jako 1BR. Veřejná kalkulačka se na počet lůžek záměrně
 * neptá, takže tu roli zastane plocha: mezi lo a hi se pásmo plynule překlápí
 * do vyššího. HEURISTIC: že rozhoduje kapacita, je změřené; že zlomy leží
 * zrovna na 40/55 a 75/100 m², změřené není.
 *
 * Prahy u 2+kk kalibrovány 31. 8. 2026 na skutečných plochách vlastních bytů
 * (PortfolioSection): Mozart 40 m² / 4 lůžka = 1BR produkt, Čelakovského
 * 402, 405 a 302 52 m² / 8 lůžek = 2BR produkt, Modern AC 55 m² / 6 lůžek
 * a Garden APT 60 m² / 6 lůžek = 2BR. Přechod tedy končí nejpozději na
 * 52 m². Ponecháno 55 m² záměrně: 52 by celý zlom pověsilo na jeden bod
 * a veřejné číslo má být spíš pod skutečností.
 */
/**
 * 3+kk: prahy posunuty 31. 8. 2026 z 75–100 na 65–95. HEURISTIC / OPRAVA
 * KONZISTENCE, NE změřená kalibrace. Pro 3+kk nemáme ANI JEDEN vlastní byt
 * s historií (Secret Garden Loft jede od 7/2026, Klement je Mladá Boleslav),
 * takže tohle číslo změřené není a nesmí se tak popisovat.
 *
 * Důvodem je vnitřní rozpor s prahem u 2+kk, který změřený JE: typický 2+kk
 * okresu ležel na váze 0,87 až 1,00, kdežto typický 3+kk na 0,20 až 0,64 a
 * v Praze 9 (72 m²) rovnou na 0,00. Model tedy tvrdil, že třípokojový byt
 * nemůže být 3BR produkt, přestože má o samostatný pokoj a o 25 až 30 m² víc
 * než 2+kk, který do vyššího pásma pouští úplně. Střed 80 m² je medián typické
 * plochy 3+kk přes okresy, typický 3+kk je tedy nově půl na půl.
 *
 * Kapacita (malý 3+kk ~8, běžný ~10, velký ~12 lůžek) je DŮVOD téhle úvahy,
 * ne vstup výpočtu: do peněz vstupuje výhradně přes výběr a mísení pásma,
 * žádný násobitel za hosty ani další násobitel za m². Počet hostů se z plochy
 * veřejně NEODVOZUJE a NEUKAZUJE — celková plocha na to není dost přesná
 * (rozhodnutí 31. 8. 2026). Zůstává HEURISTIC, dokud nebude vlastní 3+kk
 * historie; 4+kk se tímhle nemění a zůstává otevřený (chybí pásmo 4BR).
 */
export const BAND_BLEND: Record<SizeKey, { base: Band; next?: Band; lo?: number; hi?: number }> = {
  "1kk": { base: "1BR" },
  "2kk": { base: "1BR", next: "2BR", lo: 40, hi: 55 },
  "3kk": { base: "2BR", next: "3BR", lo: 65, hi: 95 },
  "4kk": { base: "3BR" },
};
/** Váha překlopení do vyššího pásma podle plochy (0 = základní pásmo, 1 = vyšší). */
export const bandWeight = (size: SizeKey, m2: number): number => {
  const b = BAND_BLEND[size];
  if (!b.next || b.lo === undefined || b.hi === undefined) return 0;
  return Math.min(1, Math.max(0, (m2 - b.lo) / (b.hi - b.lo)));
};
/** Pásmo, které výsledek popisuje (to s větší vahou); jen pro popisek. */
export const bandForSize = (size: SizeKey, m2: number): Band => {
  const b = BAND_BLEND[size];
  return b.next && bandWeight(size, m2) >= 0.5 ? b.next : b.base;
};
/**
 * Velikost bytu se veřejně vybírá TLAČÍTKY, ne posuvníkem na jeden metr
 * (31. 8. 2026). Posuvník předstíral, že rozdíl mezi 79 a 81 m² se dá veřejně
 * underwritovat; majitel to neví a stejně to nerozhoduje. Rozhoduje, jestli je
 * byt na svou dispozici menší, běžný nebo větší.
 *
 * Kbelík je JEN VSTUPNÍ ROZHRANÍ. Pošle do modelu reprezentativní plochu `m2`
 * a dál se počítá úplně stejně jako dřív. Žádná nová ekonomika, žádný kbelík
 * nekóduje počet osob.
 *
 * Hranice jsou ODVOZENÉ, ne vymyšlené:
 *  - kde dispozice překlápí pásmo (2+kk, 3+kk), dělí se přesně na `lo` a `hi`
 *    z BAND_BLEND, protože tam se opravdu mění komerční produkt;
 *  - kde překlopení není (1+kk, 4+kk), ekonomický zlom neexistuje a dělí se
 *    podle rozložení skutečného pražského stocku (p25 a p75, Sreality n=1354);
 *  - poslední uzavřená hranice je vždy p95 stocku a `m2` v kbelíku je medián
 *    inzerátů, které do něj spadají.
 *
 * Poslední volba má `m2: null`: byt nad p95 se NEEXTRAPOLUJE, jde na
 * individuální posouzení. Týká se 3 až 5 % bytů podle dispozice.
 */
export type SizeBucket = {
  id: string;
  /** klíč do překladů; kbelík si NEDRŽÍ hotový text, web je dvojjazyčný */
  labelKey: string;
  minM2: number | null;
  maxM2: number | null;
  /** plocha, která jde do modelu; null = mimo podložená data */
  representativeM2: number | null;
  /** false = neextrapoluje se, jde se na individuální posouzení */
  supported: boolean;
};

/**
 * VERZOVANÁ konfigurace. Kbelíky se časem posunou (přibude pásmo 4BR, dořeší se
 * ploché zóny, přijdou další čtvrtě), ale historická verze se NESMÍ přepisovat:
 * u leadu je uložené `calc_model_version` a musí jít zpětně zrekonstruovat, co
 * přesně majitel viděl. Nová hranice = NOVÁ VERZE, ne editace staré.
 * `facts.test.ts` obsah verze 2026-08-31.1 zamyká; když ho někdo změní, test
 * spadne a připomene, že má přidat verzi.
 */
export const CALC_MODEL_VERSION = "2026-08-31.1";

const B = (id: string, minM2: number | null, maxM2: number | null, representativeM2: number | null): SizeBucket =>
  ({ id, labelKey: `calc_size_${id}`, minM2, maxM2, representativeM2, supported: representativeM2 !== null });

export const SIZE_BUCKETS_BY_VERSION: Record<string, Record<SizeKey, SizeBucket[]>> = {
  "2026-08-31.1": {
    // p25 30 · p50 34 · p75 40 · p95 49 — bez překlopení, dělí rozložení
    "1kk": [B("s", null, 30, 28), B("m", 31, 40, 35), B("l", 41, 49, 45), B("xl", 50, null, null)],
    // překlopení 1BR→2BR na 40 a 55 · p95 80
    "2kk": [B("s", null, 40, 38), B("m", 41, 55, 50), B("l", 56, 80, 63), B("xl", 81, null, null)],
    // překlopení 2BR→3BR na 65 a 95 · p95 120
    "3kk": [B("s", null, 65, 63), B("m", 66, 95, 78), B("l", 96, 120, 106), B("xl", 121, null, null)],
    // p25 93 · p50 115 · p75 132 · p95 151 — bez překlopení (chybí pásmo 4BR)
    "4kk": [B("s", null, 93, 85), B("m", 94, 132, 116), B("l", 133, 151, 142), B("xl", 152, null, null)],
  },
};

/** Kbelíky dispozice pro danou verzi modelu; výchozí je ta aktuální. */
export const bucketsFor = (size: SizeKey, version: string = CALC_MODEL_VERSION): SizeBucket[] =>
  (SIZE_BUCKETS_BY_VERSION[version] ?? SIZE_BUCKETS_BY_VERSION[CALC_MODEL_VERSION])[size];
/** Kbelík, do kterého padne daná plocha (mapuje starší sdílené odkazy v m²). */
export const bucketFor = (size: SizeKey, m2: number, version?: string): SizeBucket =>
  bucketsFor(size, version).find((b) => (b.maxM2 === null || m2 <= b.maxM2) && (b.minM2 === null || m2 >= b.minM2))
  ?? bucketsFor(size, version)[1];
export const bucketById = (size: SizeKey, id: string, version?: string): SizeBucket =>
  bucketsFor(size, version).find((b) => b.id === id) ?? bucketsFor(size, version)[1];

/**
 * Co se na prohlídce OPRAVDU zjistilo. Není to posuvník „horší/lepší": je to
 * výslovné určení komerčního pásma, kterým byt je, plus doklad, čím to na
 * prohlídce podloženo. Bez `evidence` to nemá u konkrétního bytu co dělat —
 * musí jít dohledat, PROČ se číslo hnulo.
 *
 * INVARIANT: samotné přepnutí na interní režim nesmí číslo zvednout. Interní
 * odhad bez pozorované konfigurace se musí rovnat veřejnému do koruny (hlídá
 * facts.test.ts). Číslem hne jen zaznamenané pozorování, a to OBĚMA SMĚRY:
 * špatný půdorys, tmavé přízemí nebo malý obývák ho musí umět srazit pod
 * veřejný odhad. Bez toho by „interní" byla jen skrytá funkce na hezčí číslo.
 */
export type ObservedConfig = { band: Band; evidence: string };

/** Spodek rozpětí bere jen polovinu překlopení, vršek celé. */
export const LOW_BLEND = 0.5;
/** Rozpětí u dispozic bez překlopení a minimální šířka rozpětí. */
export const SPREAD = { low: 0.92, high: 1.08, minWidth: 0.08, derivedWiden: 1.6 };

/**
 * Čtvrti uvnitř okresu. Okres je pro Prahu 1 nebo 5 hrubé síto: Staré Město
 * má 2BR o 11 % nad průměrem Prahy 1, Nové Město naopak pod ním. Data se
 * stahují postupně (PriceLabs market_research, 20 dotazů denně), čtvrť se na
 * webu nabídne teprve tehdy, když pro ni data jsou. Mísení s okresem podle
 * velikosti vzorku: 100+ nabídek = čtvrť sama, 50–99 = 0,75, 25–49 = 0,5,
 * míň = okres. Sdílené čtvrti (Vinohrady, Nové Město) patří pod víc okresů;
 * rodičem je vždycky okres, který si člověk vybral.
 */
/**
 * Původ čtvrťového pásma. ČISTÁ METADATA: do žádného výpočtu nevstupují,
 * jen říkají, čím to číslo je.
 *
 *  "measured"      = pásmo pullnuté PŘÍMO pro tuhle geometrii
 *  "derived_split" = jeden součet přes všechny dispozice rozpadlý poměrem.
 *                    NENÍ to měření a do produkce nesmí.
 *
 * Proč to existuje: 1. 9. 2026 vznikl soubor s deseti čtvrtěmi, kde čtvrťové
 * SOUČTY jsou měřené, ale jejich 1BR/2BR/3BR ne — vznikly vynásobením
 * celopražským poměrem 0,779 / 1,221 / 1,891. V `CtvrtCell` do té doby nebylo
 * kam to napsat, takže by taková buňka seděla v tabulce k nerozeznání od pásma,
 * které PriceLabs opravdu změřil. Okresní `MarketCell` má `derived`, čtvrťová
 * neměla nic.
 *
 * POZOR, dvě RŮZNÉ osy provenience, nezaměňovat:
 *   `basis`               = bylo pásmo změřené, nebo rozpadlé z součtu?
 *   `RECONSTRUCTED_CELLS` = je za tím surový artefakt, ze kterého to jde
 *                           přepočítat?
 * Staré Město je `measured` (pásma se pullovala zvlášť, 533/297/110 nabídek)
 * a ZÁROVEŇ rekonstruované (měsíční řada se neuložila). Jiná otázka, jiná
 * náprava.
 */
export type CellBasis =
  | { basis: "measured" }
  | { basis: "derived_split"; from: string; reason: string };

export type CtvrtCell = {
  adr: number; revpar: number; nMean: number; nMin: number | null;
} & CellBasis;
export const MARKET_CTVRT: Record<string, { label: string; parents: LocationKey[]; bands: Partial<Record<Band, CtvrtCell>> }> = {
  /**
   * Staré Město: přetaženo 5. 9. 2026 S MĚSÍČNÍ ŘADOU, geometrie „Old Town
   * official boundary (openstreetmap)" schválená člověkem (anglický label,
   * jako „New Town" u Nového Města). Surové odpovědi
   * data/pricelabs-raw/stare_mesto.{1BR,2BR,3BR}.raw.json, artefakt
   * data/pricelabs-2026-09/stare_mesto.json. Tím zmizelo z RECONSTRUCTED_CELLS.
   *
   * Co re-pull ukázal proti rekonstrukci z 30. 8.: 1BR RevPAR +0,07 % a ADR
   * +0,14 % (tentýž polygon), 2BR RevPAR +1,1 %, 3BR +3,7 % (u ADR i RevPAR
   * stejně — jiná cenová úroveň rekonstrukce, ne jiný polygon). Původní
   * „nMean" 533 / 297 / 110 byla ve skutečnosti MINIMA řady (dnešní nMin
   * 533 / 296 / 111); skutečný nMean je 567 / 321 / 114. Ve sporu kód vs DB
   * (2BR 3733,7 vs 3479; 3BR 4809,4 vs 4560) měl pravdu kód; DB řádky byly
   * záměrně přepsané ventilem antam.allow_history_rewrite v téže transakci.
   */
  stare_mesto: {
    label: "Staré Město", parents: ["praha1"],
    bands: {
      "1BR": { adr: 3211, revpar: 2469.2, nMean: 567, nMin: 533, basis: "measured" },
      "2BR": { adr: 4867, revpar: 3774.2, nMean: 321, nMin: 296, basis: "measured" },
      "3BR": { adr: 6588, revpar: 4987.8, nMean: 114, nMin: 111, basis: "measured" },
    },
  },
  /**
   * Nové Město leží v Praze 1 I v Praze 2 — katastr je rozdělený, takže
   * `parents` má obě. Není to kompromis kvůli UX: kdyby tu byla jen praha1,
   * majitel bytu v novoměstské části Prahy 2 by dostal okresní číslo, aniž
   * by se ho kdokoli zeptal.
   *
   * Všechna tři pásma PŘÍMO MĚŘENÁ, jeden pull 2. 9. 2026, geometrie
   * „New Town official boundary (openstreetmap)", okno 2025_08..2026_07.
   * Surová odpověď PriceLabs je v repu a artefakt se z ní reprodukuje:
   * data/pricelabs-raw/nove_mesto.{1BR,2BR,3BR}.raw.json,
   * artefakt data/pricelabs-2026-09/nove_mesto.json.
   * Vzorky jsou velké (nMin 1226 / 608 / 219), takže váha je u všech 1,0.
   */
  nove_mesto: {
    label: "Nové Město", parents: ["praha1", "praha2"],
    bands: {
      "1BR": { adr: 2627, revpar: 1959.9, nMean: 1288, nMin: 1226, basis: "measured" },
      "2BR": { adr: 4031, revpar: 3045.7, nMean: 619, nMin: 608, basis: "measured" },
      "3BR": { adr: 6503, revpar: 4851.3, nMean: 231, nMin: 219, basis: "measured" },
    },
  },
  /**
   * Vinohrady leží v Praze 2 i v Praze 3, takže jeden pull (2. 9. 2026)
   * obsluhuje oba kontexty: praha2/vinohrady (LTR +0,6 %, n=63) i
   * praha3/vinohrady (+3,5 %, n=32). Geometrie
   * „Vinohrady official boundary (openstreetmap)", okno 2025_08..2026_07,
   * surové odpovědi v data/pricelabs-raw/vinohrady.{1BR,2BR,3BR}.raw.json.
   *
   * POZOR na 3BR: nMean 71 spadá do pásma 50–99, takže `ctvrtWeight` dá
   * váhu 0,75 — je to PRVNÍ čtvrťové pásmo, které nejede na plnou váhu.
   * Výsledek je 75 % Vinohrad + 25 % okresu, a protože geometrie patří
   * dvěma obvodům, vyjde pro Prahu 2 a Prahu 3 jiné číslo. Tak to pravidlo
   * má fungovat; není to výjimka ani chyba.
   */
  vinohrady: {
    label: "Vinohrady", parents: ["praha2", "praha3"],
    bands: {
      "1BR": { adr: 2335, revpar: 1669.8, nMean: 616, nMin: 586, basis: "measured" },
      "2BR": { adr: 3656, revpar: 2710.4, nMean: 227, nMin: 215, basis: "measured" },
      "3BR": { adr: 5437, revpar: 3946.1, nMean: 71, nMin: 63, basis: "measured" },
    },
  },
  /**
   * Žižkov leží celý v Praze 3 (jediný kontext praha3/zizkov, LTR −3,8 %,
   * n=79). Pull 4. 9. 2026, geometrie „Žižkov official boundary
   * (openstreetmap)" schválená člověkem znak po znaku, okno 2025_08..2026_07,
   * surové odpovědi data/pricelabs-raw/zizkov.{1BR,2BR,3BR}.raw.json,
   * artefakt data/pricelabs-2026-09/zizkov.json.
   *
   * Na STR je Praha 3 z ~86 % Žižkov (1BR 537 z 626, 2BR 152 z 179, 3BR
   * 44 z 46 nabídek okresu), takže 1BR a 2BR sedí na okres na procento
   * (RevPAR 0,985 / 0,990 okresu). Předregistrace čekala podíl 35–45 %;
   * mýlil se předpoklad, ne polygon — podíl je 0,85–0,86 ve všech dvanácti
   * měsících, tak se chová podmnožina.
   *
   * POZOR na 3BR: nMean 44 dává `ctvrtWeight` 0,5 a okresní buňka P3 3BR
   * NENÍ měřená — MARKET_STR.praha3 pásmo 3BR nemá a `marketCell` ho odvozuje
   * z 2BR poměrem (RevPAR 2303,5 × 1,481 = 3411,5). Veřejný výsledek je tedy
   * 50 % naměřeného Žižkova (4333,9) + 50 % odvozeného okresu = 3872,7,
   * s příznakem `derived` a rozšířeným rozpětím. Naměřených 4334 se
   * nepublikuje přímo; přesně na to je shrinkage. Že odvozených 3411 leží
   * hluboko pod naměřeným Žižkovem i pod potlačeným tenkým měřením okresu
   * (4211, n≈46), je otázka kalibrace okresního pásma a řeší se ZVLÁŠŤ,
   * ne v téhle integraci (docs/calculator-model.md, otevřené body).
   */
  zizkov: {
    label: "Žižkov", parents: ["praha3"],
    bands: {
      "1BR": { adr: 2085, revpar: 1545.0, nMean: 537, nMin: 510, basis: "measured" },
      "2BR": { adr: 3052, revpar: 2279.6, nMean: 152, nMin: 135, basis: "measured" },
      "3BR": { adr: 6006, revpar: 4333.9, nMean: 44, nMin: 38, basis: "measured" },
    },
  },
  /**
   * Smíchov leží celý v Praze 5 (jediný kontext praha5/smichov, LTR +7,7 %,
   * n=101 — nejlepší nájemní vzorek ze všech čtvrtí). Pull 4. 9. 2026,
   * geometrie „Smíchov official boundary (openstreetmap)" schválená člověkem
   * znak po znaku, okno 2025_08..2026_07, surové odpovědi
   * data/pricelabs-raw/smichov.{1BR,2BR,3BR}.raw.json, artefakt
   * data/pricelabs-2026-09/smichov.json. 1BR a 2BR přišly jako 13 měsíců
   * (neuzavřený 2026_08 navíc); obálka ho drží, extrakce ho vyřadila
   * kalendářním pravidlem.
   *
   * Na STR je Smíchov 72–79 % Prahy 5 a sedí na okres ve všech pásmech
   * (RevPAR 0,99 / 1,01 / 0,96 okresu). Nájemní prémie +7,7 % se na STR
   * NEPŘENÁŠÍ — stejný vzorec jako Žižkov (LTR −3,8 %, STR −1,5 %). Čtvrť
   * tedy pro majitele v Praze 5 skoro nic nemění; je tu proto, že to teď
   * je změřené, ne odhadnuté.
   *
   * 3BR: nMean 58 → `ctvrtWeight` 0,75, nMin 50 přesně na prahu
   * spolehlivosti. Na rozdíl od Žižkova je okresní rodič P5 3BR MĚŘENÝ
   * (nMin 65), takže blend je 75 % naměřené čtvrti + 25 % naměřeného
   * okresu, bez příznaku derived.
   */
  smichov: {
    label: "Smíchov", parents: ["praha5"],
    bands: {
      "1BR": { adr: 2263, revpar: 1566.6, nMean: 327, nMin: 293, basis: "measured" },
      "2BR": { adr: 3348, revpar: 2385.4, nMean: 145, nMin: 125, basis: "measured" },
      "3BR": { adr: 5524, revpar: 3562.1, nMean: 58, nMin: 50, basis: "measured" },
    },
  },
  /**
   * Karlín leží celý v Praze 8 (jediný kontext praha8/karlin, LTR +11,4 %,
   * n=36 — největší nájemní prémie v registru). Pull 4. 9. 2026, geometrie
   * „Karlín official boundary (openstreetmap)" schválená člověkem znak po
   * znaku, okno 2025_08..2026_07, surové odpovědi
   * data/pricelabs-raw/karlin.{1BR,2BR,3BR}.raw.json, artefakt
   * data/pricelabs-2026-09/karlin.json.
   *
   * Tohle je první čtvrť, kde se lokální efekt na STR opravdu ukázal:
   * Karlín je nad Prahou 8 ve všech pásmech (RevPAR 1,086 / 1,082 / 1,069
   * okresu), u 1BR v každém z 12 měsíců, při stabilním podílu 70–90 %
   * okresní nabídky. Žižkov a Smíchov seděly na okres bez ohledu na nájemní
   * rozestup; Karlín je místo, kde se nájem i STR rozcházejí stejným směrem.
   * „Karlín effect" z docs/calculator-model.md je tím změřený, ne
   * předpokládaný.
   *
   * VÁHY: 2BR nMean 64 → 0,75 (první čtvrťové 2BR pod plnou vahou).
   * 3BR nMean 43 → 0,5 a okresní rodič P8 3BR NENÍ měřený (potlačené
   * n≈47, `marketCell` odvozuje z 2BR: 2508,0 × 1,481 = 3714,3) — týž
   * režim jako Žižkov: 50 % naměřených 3981,1 + 50 % odvozených 3714,3
   * = 3847,7 s příznakem `derived`. Rozdíl proti Žižkovu: tady jsou
   * naměřená čtvrť a odvozený okres blízko (+7 %), takže shrinkage skoro
   * nic nemění.
   */
  karlin: {
    label: "Karlín", parents: ["praha8"],
    bands: {
      "1BR": { adr: 2671, revpar: 2066.8, nMean: 269, nMin: 253, basis: "measured" },
      "2BR": { adr: 3928, revpar: 2713.1, nMean: 64, nMin: 56, basis: "measured" },
      "3BR": { adr: 5709, revpar: 3981.1, nMean: 43, nMin: 36, basis: "measured" },
    },
  },
};
export const ctvrtiOf = (loc: string) =>
  Object.entries(MARKET_CTVRT)
    .filter(([, v]) => v.parents.includes(loc as LocationKey))
    .map(([id, v]) => ({ id, label: v.label }));
const ctvrtWeight = (n: number) => (n >= 100 ? 1 : n >= 50 ? 0.75 : n >= 25 ? 0.5 : 0);
/** Buňka trhu pro čtvrť: vlastní data smíchaná s okresem podle vzorku. */
export const localCell = (loc: MeasuredLocation, band: Band, ctvrt?: string | null): MarketCell | null => {
  const district = marketCell(loc, band);
  const c = ctvrt ? MARKET_CTVRT[ctvrt] : undefined;
  if (!c || !c.parents.includes(loc as LocationKey)) return district;
  const own = c.bands[band];
  // Rozpad součtu poměrem se do produkčního výpočtu nedostane. Tichý fail-safe:
  // vrátí se okres, tedy totéž, co kdyby čtvrť pásmo vůbec neměla. Hlasitá
  // pojistka je test, který takovou buňku do MARKET_CTVRT vůbec nepustí.
  if (!own || own.basis !== "measured" || !district) return district;
  const w = ctvrtWeight(own.nMean);
  if (w === 0) return district;
  return {
    adr: Math.round(own.adr * w + district.adr * (1 - w)),
    revpar: own.revpar * w + district.revpar * (1 - w),
    nMean: own.nMean,
    nMin: own.nMin,
    derived: district.derived && w < 1,
  };
};

/** Tržní obsazenost čtvrti a pásma v procentech (RevPAR / ADR z MARKET_STR),
 *  totéž číslo, které kalkulačka ukazuje jako „obsazenost okolí“. */
export const marketOccPct = (loc: MeasuredLocation, band: Band): number | null => {
  const cell = marketCell(loc, band);
  return cell ? Math.round((cell.revpar / cell.adr) * 100) : null;
};

/**
 * Trh na kartách portfolia: JEDEN zdroj s kalkulačkou (MARKET_STR, 12 měsíců,
 * celá čtvrť, pásmo podle ložnic bytu). Dřív tu bylo 90denní okno comp setů
 * kolem našich listingů (P1 77, P3 73, P5 74), takže stránka měla dvě různá
 * čísla „trhu“ pro tutéž čtvrť. mb = Mladá Boleslav: čtvrťová data nemáme,
 * zůstává PriceLabs comp set 90 dní; jen pro karty, kalkulačka MB nenabízí.
 */
export const MARKET_OCC = {
  praha1: marketOccPct("praha1", "2BR")!,
  praha3: marketOccPct("praha3", "2BR")!,
  praha4: marketOccPct("praha4", "1BR")!,
  praha5: marketOccPct("praha5", "1BR")!,
  mb: 72,
} as const;
export type CardMarketLocation = "praha1" | "praha3" | "praha4" | "praha5";

/**
 * Sezónní násobky ADR a RevPAR z tržních měsíčních řad každé čtvrti,
 * vážené počtem nabídek přes spolehlivá pásma. léto = duben až říjen
 * (7 měs.), zima = listopad až březen BEZ prosince (4 měs.), Vánoce =
 * prosinec. Vážený součet dává přesně roční průměr, hlídá to facts.test.ts.
 * RevPAR násobek řídí peníze (nese i sezónní obsazenost), ADR násobek
 * jen zobrazenou cenu za noc.
 */
export type SeasonFactor = { adr: number; revpar: number };
export const SEASONS_BY_LOC: Record<MeasuredLocation, { summer: SeasonFactor; winter: SeasonFactor; xmas: SeasonFactor }> = {
  praha1: { summer: { adr: 1.053, revpar: 1.092 }, winter: { adr: 0.798, revpar: 0.690 }, xmas: { adr: 1.437, revpar: 1.599 } },
  praha2: { summer: { adr: 1.045, revpar: 1.090 }, winter: { adr: 0.809, revpar: 0.691 }, xmas: { adr: 1.448, revpar: 1.603 } },
  praha3: { summer: { adr: 1.040, revpar: 1.086 }, winter: { adr: 0.824, revpar: 0.713 }, xmas: { adr: 1.427, revpar: 1.544 } },
  praha4: { summer: { adr: 1.034, revpar: 1.093 }, winter: { adr: 0.856, revpar: 0.714 }, xmas: { adr: 1.338, revpar: 1.491 } },
  praha5: { summer: { adr: 1.047, revpar: 1.110 }, winter: { adr: 0.820, revpar: 0.678 }, xmas: { adr: 1.389, revpar: 1.521 } },
  praha6: { summer: { adr: 1.031, revpar: 1.110 }, winter: { adr: 0.892, revpar: 0.727 }, xmas: { adr: 1.215, revpar: 1.322 } },
  praha7: { summer: { adr: 1.021, revpar: 1.089 }, winter: { adr: 0.861, revpar: 0.707 }, xmas: { adr: 1.408, revpar: 1.548 } },
  praha8: { summer: { adr: 1.036, revpar: 1.084 }, winter: { adr: 0.815, revpar: 0.697 }, xmas: { adr: 1.490, revpar: 1.624 } },
  praha9: { summer: { adr: 1.013, revpar: 1.067 }, winter: { adr: 0.922, revpar: 0.784 }, xmas: { adr: 1.219, revpar: 1.393 } },
};
export type SeasonKey = "year" | "summer" | "winter" | "xmas";

/**
 * Dlouhodobý nájem. Přestavěno 30. 8. 2026 na ŽIVÁ TRŽNÍ DATA: 1354
 * čerstvých pražských inzerátů ze Sreality (scrape 30. 8. 2026, čistý nájem
 * bez poplatků, bez duplicit, short-term nabídek, pokojů a luxusních extrémů,
 * jen inzeráty do 60 dnů, protože ležáky nadsazují medián o ~8 %; vyčištěný
 * dataset a metodika: data/sreality-2026-08/). Deloitte Rent Index Q2/2026
 * zůstává jako kotva v testu (±12 %), do výpočtu už nevstupuje.
 *
 * Tvar: Kč/m² klesá s plochou podle celopražské mocninné křivky (m2^b),
 * úroveň drží čtvrť (exp(a)). Vybavenost hýbe nájmem o ±10 % (změřeno na
 * témž vzorku); kalkulačka ukazuje střed trhu, graf Za 5 let bere faktor
 * podle přepínače vybavení.
 */
export const RENT_SLOPE = -0.2565;
export const RENT_INTERCEPT: Record<LocationKey, number> = {
  praha1: 7.301, praha2: 7.285, praha3: 7.238, praha4: 7.121, praha5: 7.152,
  praha6: 7.161, praha7: 7.273, praha8: 7.159, praha9: 7.154, praha10: 7.115,
};
/**
 * Typická plocha dispozice V DANÉ ČTVRTI: medián čerstvých inzerátů (Sreality
 * 8/2026); buňky pod 8 inzerátů berou celopražský medián dispozice. 2+kk
 * v Praze 1 bývá 65 m², v Praze 9 53 m², a nájem se počítá pro tuhle plochu.
 * Plocha není vstup kalkulačky (rozhodnutí 30. 8. 2026: „slider může pryč“).
 */
export const TYPICAL_AREA: Record<LocationKey, Record<SizeKey, number>> = {"praha1": {"1kk": 34, "2kk": 65, "3kk": 91, "4kk": 124}, "praha2": {"1kk": 41, "2kk": 52, "3kk": 94, "4kk": 123}, "praha3": {"1kk": 40, "2kk": 55, "3kk": 87, "4kk": 115}, "praha4": {"1kk": 32, "2kk": 50, "3kk": 79, "4kk": 84}, "praha5": {"1kk": 35, "2kk": 53, "3kk": 80, "4kk": 118}, "praha6": {"1kk": 35, "2kk": 53, "3kk": 91, "4kk": 113}, "praha7": {"1kk": 35, "2kk": 59, "3kk": 80, "4kk": 115}, "praha8": {"1kk": 34, "2kk": 53, "3kk": 80, "4kk": 115}, "praha9": {"1kk": 35, "2kk": 53, "3kk": 72, "4kk": 115}, "praha10": {"1kk": 33, "2kk": 54, "3kk": 83, "4kk": 115}};
export const typicalArea = (loc: string, size: SizeKey): number =>
  (TYPICAL_AREA as Record<string, Record<SizeKey, number>>)[loc]?.[size] ?? MEDIAN_AREA[size];

export type FurnRent = "furnished" | "partly" | "none" | "mix";
export const FURN_RENT: Record<FurnRent, number> = {
  furnished: 1.114, partly: 0.99, none: 0.938, mix: 1,
};
/**
 * REGISTR GEOGRAFIÍ. Jediné místo, kde čtvrť vzniká, a jediný způsob, jak se
 * STR a LTR spojují. Nikdy ne shodou řetězců.
 *
 * DVĚ IDENTITY, protože to nejsou tytéž věci:
 *  - `id` = MODELOVÁ identita, čtvrť V KONTEXTU okresu ("praha3/vinohrady").
 *    Čtyři čtvrti patří pod dva okresy naráz a mají v každém jinou hodnotu:
 *    Vinohrady +1 % v Praze 2, ale +4 % v Praze 3. Samotné "vinohrady"
 *    neidentifikuje nic.
 *  - `sourceGeometry` = FYZICKÁ geometrie u dodavatele. Jeden polygon, jeden
 *    artefakt, jeden pull. Praha 2 a Praha 3 sdílejí TÝŽ polygon Vinohrad,
 *    takže se kvóta PriceLabs nesmí utratit dvakrát za totéž. Tímhle klíčem
 *    se klíčuje i MARKET_CTVRT.
 *
 * `ltr` je VŽDYCKY vyplněné: buď vlastní efekt, nebo výslovně deklarovaný pád
 * na okres i s důvodem. Chybět nesmí, aby test uměl rozlišit „fallback
 * schválený" od „zapomněli jsme to napojit".
 *
 * Efekt je průměrné reziduum čtvrti proti okresní křivce, UŽ PO shrinkage.
 * Reprodukovatelné z data/sreality-2026-08/ltr-source.csv.
 * HEURISTIC: schody shrinkage 100 / 50 / 25 / 12 nejsou změřený zákon.
 */
export type GeoLtr = { effect: number; n: number } | { fallback: "district"; reason: string };
export type GeoContext = { id: string; district: LocationKey; sourceGeometry: string; label: string; ltr: GeoLtr };
export const GEO: GeoContext[] = [
  { id: "praha1/nove_mesto", district: "praha1", sourceGeometry: "nove_mesto", label: "Nové Město", ltr: { effect: -0.0077, n: 41 } },
  { id: "praha1/stare_mesto", district: "praha1", sourceGeometry: "stare_mesto", label: "Staré Město", ltr: { fallback: "district", reason: "n=11 pod prahem shrinkage" } },
  { id: "praha2/nove_mesto", district: "praha2", sourceGeometry: "nove_mesto", label: "Nové Město", ltr: { effect: -0.0222, n: 26 } },
  { id: "praha2/vinohrady", district: "praha2", sourceGeometry: "vinohrady", label: "Vinohrady", ltr: { effect: 0.006, n: 63 } },
  { id: "praha3/vinohrady", district: "praha3", sourceGeometry: "vinohrady", label: "Vinohrady", ltr: { effect: 0.0347, n: 32 } },
  { id: "praha3/zizkov", district: "praha3", sourceGeometry: "zizkov", label: "Žižkov", ltr: { effect: -0.0381, n: 79 } },
  { id: "praha4/branik", district: "praha4", sourceGeometry: "branik", label: "Braník", ltr: { effect: -0.01, n: 16 } },
  { id: "praha4/chodov", district: "praha4", sourceGeometry: "chodov", label: "Chodov", ltr: { effect: -0.0004, n: 24 } },
  { id: "praha4/krc", district: "praha4", sourceGeometry: "krc", label: "Krč", ltr: { effect: -0.0091, n: 21 } },
  { id: "praha4/michle", district: "praha4", sourceGeometry: "michle", label: "Michle", ltr: { effect: 0.0047, n: 22 } },
  { id: "praha4/modrany", district: "praha4", sourceGeometry: "modrany", label: "Modřany", ltr: { effect: 0.0046, n: 22 } },
  { id: "praha4/nusle", district: "praha4", sourceGeometry: "nusle", label: "Nusle", ltr: { effect: 0.0407, n: 48 } },
  { id: "praha5/hlubocepy", district: "praha5", sourceGeometry: "hlubocepy", label: "Hlubočepy", ltr: { effect: -0.0129, n: 37 } },
  { id: "praha5/kosire", district: "praha5", sourceGeometry: "kosire", label: "Košíře", ltr: { effect: 0.0338, n: 30 } },
  { id: "praha5/smichov", district: "praha5", sourceGeometry: "smichov", label: "Smíchov", ltr: { effect: 0.0773, n: 101 } },
  { id: "praha5/stodulky", district: "praha5", sourceGeometry: "stodulky", label: "Stodůlky", ltr: { effect: -0.0455, n: 48 } },
  { id: "praha6/brevnov", district: "praha6", sourceGeometry: "brevnov", label: "Břevnov", ltr: { effect: 0.0033, n: 15 } },
  { id: "praha6/bubenec", district: "praha6", sourceGeometry: "bubenec", label: "Bubeneč", ltr: { effect: 0.0144, n: 16 } },
  { id: "praha6/dejvice", district: "praha6", sourceGeometry: "dejvice", label: "Dejvice", ltr: { effect: 0.0234, n: 15 } },
  { id: "praha6/ruzyne", district: "praha6", sourceGeometry: "ruzyne", label: "Ruzyně", ltr: { effect: -0.0063, n: 12 } },
  { id: "praha7/holesovice", district: "praha7", sourceGeometry: "holesovice", label: "Holešovice", ltr: { effect: 0.0008, n: 62 } },
  { id: "praha8/karlin", district: "praha8", sourceGeometry: "karlin", label: "Karlín", ltr: { effect: 0.1143, n: 36 } },
  { id: "praha8/kobylisy", district: "praha8", sourceGeometry: "kobylisy", label: "Kobylisy", ltr: { effect: -0.03, n: 19 } },
  { id: "praha8/liben", district: "praha8", sourceGeometry: "liben", label: "Libeň", ltr: { effect: -0.0235, n: 29 } },
  { id: "praha8/troja", district: "praha8", sourceGeometry: "troja", label: "Troja", ltr: { effect: -0.0081, n: 14 } },
  { id: "praha9/cerny_most", district: "praha9", sourceGeometry: "cerny_most", label: "Černý Most", ltr: { effect: -0.012, n: 12 } },
  { id: "praha9/hloubetin", district: "praha9", sourceGeometry: "hloubetin", label: "Hloubětín", ltr: { effect: 0.0022, n: 19 } },
  { id: "praha9/liben", district: "praha9", sourceGeometry: "liben", label: "Libeň", ltr: { effect: -0.0063, n: 13 } },
  { id: "praha9/prosek", district: "praha9", sourceGeometry: "prosek", label: "Prosek", ltr: { effect: -0.012, n: 14 } },
  { id: "praha9/vysocany", district: "praha9", sourceGeometry: "vysocany", label: "Vysočany", ltr: { effect: 0.0082, n: 37 } },
  { id: "praha10/hostivar", district: "praha10", sourceGeometry: "hostivar", label: "Hostivař", ltr: { effect: 0.0005, n: 18 } },
  { id: "praha10/strasnice", district: "praha10", sourceGeometry: "strasnice", label: "Strašnice", ltr: { effect: -0.0037, n: 37 } },
  { id: "praha10/vrsovice", district: "praha10", sourceGeometry: "vrsovice", label: "Vršovice", ltr: { effect: 0.0282, n: 40 } },
  { id: "praha10/zabehlice", district: "praha10", sourceGeometry: "zabehlice", label: "Záběhlice", ltr: { effect: -0.0182, n: 18 } },
];
/** Kontext podle okresu a fyzické geometrie. Cizí kombinace vrací undefined. */
export const geoContext = (district: string, sourceGeometry?: string | null): GeoContext | undefined =>
  sourceGeometry ? GEO.find((g) => g.district === district && g.sourceGeometry === sourceGeometry) : undefined;

/** Násobek nájmu za čtvrť. 1 = bez čtvrti, cizí čtvrť, nebo deklarovaný fallback. */
export const ctvrtRentFactor = (loc: string, ctvrt?: string | null): number => {
  const g = geoContext(loc, ctvrt);
  return g && "effect" in g.ltr ? Math.exp(g.ltr.effect) : 1;
};

/** Nájem konkrétní plochy v dané lokalitě. JEDINÁ funkce na nájem na webu.
 *  Dispozice jen dodá výchozí plochu, když m² chybí. Čtvrť je nepovinná a bez
 *  ní se výsledek nemění. */
export const rentFor = (
  loc: LocationKey, size: SizeKey, m2 = MEDIAN_AREA[size], furn: FurnRent = "mix", ctvrt?: string | null,
) =>
  Math.round(m2 * Math.exp(RENT_INTERCEPT[loc]) * Math.pow(m2, RENT_SLOPE) * FURN_RENT[furn] * ctvrtRentFactor(loc, ctvrt));

/** Lokalita karty („Praha 1“) → klíč nájmu; Mladá Boleslav nájemní data nemá. */
export const locKeyOf = (loc: string): LocationKey | null => {
  const m = /^Praha (\d+)$/.exec(loc);
  return m ? (`praha${m[1]}` as LocationKey) : null;
};
/** Násobek dlouhodobého nájmu pro kartu: skutečná plocha a čtvrť bytu, na
 *  desetiny. null tam, kde nájemní data nejsou (Mladá Boleslav). */
export const ratioFor = (loc: string, m2: number, ownerMonthlyCzk: number): number | null => {
  const key = locKeyOf(loc);
  if (!key) return null;
  return Math.round((ownerMonthlyCzk / rentFor(key, "2kk", m2)) * 10) / 10;
};

/** Zálohy na energie, které u krátkodobého pronájmu hradí majitel (u nájmu nájemce) */
export const ENERGY: Record<SizeKey, number> = {
  "1kk": 2500, "2kk": 3500, "3kk": 4500, "4kk": 5500,
};

export const ROOMS: Record<SizeKey, number> = { "1kk": 1, "2kk": 2, "3kk": 3, "4kk": 4 };

/**
 * Krytí menších škod způsobených hostem, roční limit na byt: 5 000 Kč za pokoj,
 * nejvýše 25 000 Kč. Platí na to, co se nepodaří získat po hostovi ani přes
 * platformu. Jediné místo, kde tohle pravidlo žije.
 */
export const DAMAGE_COVER_PER_ROOM = 5000;
export const DAMAGE_COVER_MAX = 25000;
export const annualDamageCover = (rooms: number) =>
  Math.min(Math.max(0, Math.round(rooms)) * DAMAGE_COVER_PER_ROOM, DAMAGE_COVER_MAX);

/**
 * Obsazenost jednotlivých bytů proti trhu jejich lokality.
 * occupancy: z rezervací v Hospitable (byty starší tří měsíců, okno od 46. dne
 * provozu do 31. 7. 2026) — NAMĚŘENÁ ČÍSLA, nesahat.
 * market: MARKET_OCC lokality, od patche 127 z téhož datasetu jako kalkulačka
 * (celá čtvrť, 12 měsíců, pásmo podle ložnic bytu); MB comp set 90 dní.
 * bedrooms z Hospitable (30. 8. 2026).
 * Byt 302 (Praha 1) měří 93 % proti trhu 77 %, ale publikovaný není.
 * Karty v PortfolioSection musí ukazovat stejná čísla; hlídá to facts.test.ts.
 */
export const OCCUPANCY_BY_FLAT: {
  name: string; loc: string; kat?: string; m2: number; bedrooms: number; occupancy: number; market: number; days: number;
}[] = [
  { name: "Elegant Museum View Apartment", loc: "Praha 1", kat: "Nové Město",        m2: 52, bedrooms: 2, occupancy: 96, market: MARKET_OCC.praha1, days: 319 },
  { name: "Modern Museum View Apartment",  loc: "Praha 1", kat: "Nové Město",        m2: 52, bedrooms: 2, occupancy: 94, market: MARKET_OCC.praha1, days: 318 },
  { name: "Modern AC Apartment",           loc: "Praha 3", kat: "Žižkov",        m2: 55, bedrooms: 2, occupancy: 96, market: MARKET_OCC.praha3, days: 139 },
  { name: "Moderní apartmán se zahradou",  loc: "Praha 3", kat: "Žižkov",        m2: 60, bedrooms: 2, occupancy: 85, market: MARKET_OCC.praha3, days: 54 },
  { name: "Klement apartment s terasou",   loc: "Mladá Boleslav", kat: "Mladá Boleslav", m2: 85, bedrooms: 2, occupancy: 91, market: MARKET_OCC.mb, days: 54 },
  { name: "My Mozart studio",                loc: "Praha 5", kat: "Smíchov",        m2: 40, bedrooms: 1, occupancy: 97, market: MARKET_OCC.praha5, days: 113 },
];

/** Vážený průměr naší obsazenosti: 1 240 obsazených nocí z 1 317 dní okna. */
export const OCCUPANCY_OURS = 94;

/** Plocha, kterou dispozice předvyplní (medián MF); posuvník ji přepíše. */
export const SIZE_PRESET: Record<SizeKey, { m2: number }> = {
  "1kk": { m2: MEDIAN_AREA["1kk"] },
  "2kk": { m2: MEDIAN_AREA["2kk"] },
  "3kk": { m2: MEDIAN_AREA["3kk"] },
  "4kk": { m2: MEDIAN_AREA["4kk"] },
};

export const MGMT_FEE = 0.30;      // odměna Antam Homes z čistého výnosu
// Změřeno 27. 8. 2026 na 7 bytech (Hospitable, 12 měsíců): skutečná provize je
// 17,3 až 20,6 % z ceny pokoje podle listingu. 0,17 je dolní okraj měřeného
// pásma, tedy záměrně optimistická strana; disclaimer uvádí pásmo 15 až 21 %.
export const PLATFORM_FEE = 0.17;
export const DAYS = 30.44;  // průměrná délka měsíce

/** Uvedení do provozu, vybavení a obnova — vstupy pro záložku Za 5 let */
export const LAUNCH_FEE = 25000;
export const KIT_PER_ROOM = 30000;    // dovybavení bytu zařízeného pro nájemníka
export const EMPTY_PER_ROOM = 100000; // kompletní vybavení prázdného bytu
export const RENEW_PER_ROOM_YEAR = 4000;
export const YEAR_ONE_RAMP = 0.85;    // nová nabídka nenajede hned na plný výkon

/**
 * Růst cen v pětiletém horizontu: NULA na obou stranách (31. 8. 2026).
 *
 * Do té doby tu stálo 5 % ročně u nájmu proti 3 % u krátkodobého pronájmu.
 * Byla to nepodložená makro předpověď, která přitom rozhodovala o výsledku:
 * u typického 3+kk v Praze 9 sebrala za pět let ~80 000 Kč a dokázala překlopit
 * dobrý dnešní případ do záporu. Navíc si to odporovalo s vlastním textem na
 * webu (hz_assume_5 už tehdy tvrdil „bez růstu cen na obou stranách").
 *
 * Pětiletka teď drží DNEŠNÍ tržní podmínky konstantní a web to říká nahlas.
 * Není to tvrzení, že trh poroste nulou; je to odmítnutí hádat, kterým směrem
 * se rozejdou dva trhy, když pro to nemáme data. Až budou, můžou se sem vrátit
 * — ale jako změřený vstup, ne jako předpoklad.
 */
export const RENT_GROWTH = 0;
export const STR_GROWTH = 0;
export const PROJECT_FEE = 0.20;           // odměna za řízení projektu, z rozpočtu
export const PROJECT_FEE_THRESHOLD = 30000;// pod tímto rozpočtem je řízení v ceně uvedení do provozu

/** Jedna varianta výsledku: obsazenost, hrubé tržby, provize, dělení. */
export type Split = {
  occupancy: number; gross: number; platformFee: number;
  netRevenue: number; mgmt: number; net: number;
};
export type OwnerMonthly = {
  supported: true;
  band: Band;
  /** reálná tržní cena za noc (realizované ADR čtvrti a pásma, × sezóna) */
  adr: number;
  /** průměr trhu: tržní RevPAR, tj. tržní cena × tržní obsazenost */
  market: Split;
  /** vršek rozpětí: vyšší konfigurace téhož bytu × operátorský faktor */
  antam: Split;
  /** true = pásmo dopočítané z menšího pásma čtvrti × celoměstský poměr */
  derived: boolean;
  /** orientační kapacita z dispozice (přesně se určí při prohlídce) */
  guests: number;
  /** rozpětí pro majitele: spodek = konzervativní konfigurace, vršek = vyšší, střed pro dělení a násobek */
  low: number; high: number; mid: number;
  /** jak se k číslu došlo: základní pásmo, případné vyšší, váha překlopení,
   *  použitá čtvrť a operátorský faktor. Web to nezobrazuje, hlídají to testy. */
  trace: { base: Band; next: Band | null; w: number; ctvrt: string | null; factor: number; availability: number;
    /** null = číslo stojí na odhadu z m²; jinak co se na prohlídce zjistilo a čím je to doložené */
    config: { band: Band; evidence: string } | null };
} | { supported: false; band: Band; guests: number };

const split = (gross: number, occupancy: number): Split => {
  const platformFee = Math.round(PLATFORM_FEE * gross);
  const netRevenue = gross - platformFee;
  const mgmt = Math.round(netRevenue * MGMT_FEE);
  return { occupancy, gross, platformFee, netRevenue, mgmt, net: netRevenue - mgmt };
};

/**
 * Výnos majitele za měsíc. JEDINÁ funkce na výnos na webu: kalkulačka,
 * pětiletý graf i MCP počítají odsud.
 *
 * Vstup je lokalita, dispozice a plocha; z dispozice a plochy se odvodí
 * kapacita (guestsFor) a z ní pásmo trhu (bandFor). Výsledek je ROZPĚTÍ:
 * spodek = průměr trhu čtvrti, vršek = s Antam; na vlastních bytech leží
 * skutečnost mezi −5 a +22 % od průměru trhu (test „backtest“).
 * Spodek i vršek jdou z tržního RevPAR × sezónní násobek × dny × AVAILABILITY
 * × operátorský faktor; liší se jen vahou překlopení do vyššího pásma podle
 * plochy. Z hrubého se odečte provize platformy (počítá se z celé ceny
 * rezervace včetně úklidu), zbytek se dělí 70/30. DPH z provize neodečítáme,
 * hradí ji Antam ze své odměny. Energie majitel platí zvlášť a nejsou tu.
 *
 * Když pro čtvrť nebo pásmo tržní vzorek nestačí, vrací { supported: false }
 * a web ukáže „posoudíme individuálně“, nikdy cizí číslo.
 */
export function ownerMonthly(
  location: string,
  size: SizeKey,
  { season = "year" as SeasonKey, m2, ctvrt = null, scope = "public" as "public" | "internal", config }: {
    season?: SeasonKey; m2?: number; ctvrt?: string | null;
    scope?: "public" | "internal";
    /** jen pro scope "internal": pásmo zjištěné na prohlídce, nahradí odhad z m² */
    config?: ObservedConfig;
  } = {},
): OwnerMonthly {
  const guests = guestsFor(size);
  const area = m2 ?? typicalArea(location, size);
  const band = bandForSize(size, area);
  if (!isMeasured(location)) return { supported: false, band, guests };

  // Pozorovaná konfigurace platí jen interně. Ve veřejném režimu se ignoruje,
  // aby se do webu nedala propašovat jinou cestou.
  const observed = scope === "internal" ? config ?? null : null;
  const cfg = observed
    ? { base: observed.band, next: undefined, lo: undefined, hi: undefined }
    : BAND_BLEND[size];
  const usedCtvrt = ctvrt && MARKET_CTVRT[ctvrt]?.parents.includes(location as LocationKey) ? ctvrt : null;
  const baseCell = localCell(location, cfg.base, usedCtvrt);
  if (!baseCell) return { supported: false, band, guests };
  const nextCell = cfg.next ? localCell(location, cfg.next, usedCtvrt) : null;
  const w = nextCell && !observed ? bandWeight(size, area) : 0;

  const f = season === "year" ? { adr: 1, revpar: 1 } : SEASONS_BY_LOC[location][season];
  // cena za noc, kterou web ukazuje: pásmo, které výsledek popisuje
  const shownCell = w >= 0.5 && nextCell ? nextCell : baseCell;
  const adr = Math.round(shownCell.adr * f.adr);
  const marketRevpar = shownCell.revpar * f.revpar;
  const marketOcc = Math.round((marketRevpar / adr) * 1000) / 1000;

  // hrubé tržby: mezi pásmy podle plochy, jinak prezentační rozpětí
  const gBase = baseCell.revpar * f.revpar * DAYS;
  const gNext = nextCell ? nextCell.revpar * f.revpar * DAYS : gBase;
  let lowGross = nextCell ? gBase + LOW_BLEND * w * (gNext - gBase) : gBase * SPREAD.low;
  let highGross = nextCell ? gBase + w * (gNext - gBase) : gBase * SPREAD.high;
  const derived = baseCell.derived || (!!nextCell && nextCell.derived);
  if (derived) {
    const mid = (lowGross + highGross) / 2;
    lowGross = mid - (mid - lowGross) * SPREAD.derivedWiden;
    highGross = mid + (highGross - mid) * SPREAD.derivedWiden;
  }
  if (highGross - lowGross < SPREAD.minWidth * lowGross) {
    const mid = (lowGross + highGross) / 2;
    lowGross = mid * (1 - SPREAD.minWidth / 2);
    highGross = mid * (1 + SPREAD.minWidth / 2);
  }
  const k = operatorFactor(location, scope);
  const market = split(Math.round(lowGross * k * AVAILABILITY), marketOcc);
  const antam = split(Math.round(highGross * k * AVAILABILITY), marketOcc);
  return {
    supported: true, band, adr, derived, guests, market, antam,
    low: market.net, high: antam.net, mid: Math.round((market.net + antam.net) / 2),
    trace: { base: cfg.base, next: nextCell ? cfg.next ?? null : null, w, ctvrt: usedCtvrt, factor: k, availability: AVAILABILITY,
      config: observed ? { band: observed.band, evidence: observed.evidence } : null },
  };
}
