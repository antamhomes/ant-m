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
export const MARKET_STR: Record<MeasuredLocation, Partial<Record<Band, { adr: number; revpar: number; listings: number }>>> = {
  praha1: { "1BR": { adr: 2917, revpar: 2207.5, listings: 1675 }, "2BR": { adr: 4507, revpar: 3399.3, listings: 904 }, "3BR": { adr: 6576, revpar: 4924.8, listings: 320 } },
  praha2: { "1BR": { adr: 2419, revpar: 1739.9, listings: 920 },  "2BR": { adr: 3748, revpar: 2831.4, listings: 361 }, "3BR": { adr: 5874, revpar: 4278.2, listings: 128 } },
  praha3: { "1BR": { adr: 2130, revpar: 1568.9, listings: 626 },  "2BR": { adr: 3085, revpar: 2303.5, listings: 179 } },
  praha4: { "1BR": { adr: 1810, revpar: 1254.0, listings: 184 },  "2BR": { adr: 2539, revpar: 1697.0, listings: 69 } },
  praha5: { "1BR": { adr: 2259, revpar: 1579.7, listings: 452 },  "2BR": { adr: 3378, revpar: 2363.4, listings: 183 }, "3BR": { adr: 5599, revpar: 3710.5, listings: 74 } },
  praha6: { "1BR": { adr: 1873, revpar: 1286.6, listings: 154 },  "2BR": { adr: 2913, revpar: 1878.9, listings: 83 } },
  praha7: { "1BR": { adr: 2105, revpar: 1507.0, listings: 215 },  "2BR": { adr: 3336, revpar: 2087.1, listings: 98 } },
  praha8: { "1BR": { adr: 2532, revpar: 1902.3, listings: 350 },  "2BR": { adr: 3654, revpar: 2508.0, listings: 92 } },
  praha9: { "1BR": { adr: 2065, revpar: 1363.9, listings: 76 } },
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
export type MarketCell = { adr: number; revpar: number; listings: number; derived: boolean };
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
      return da !== db ? da - db : MARKET_STR[loc][b]!.listings - MARKET_STR[loc][a]!.listings;
    });
  for (const from of donors) {
    const up = BAND_ORDER.indexOf(from) < BAND_ORDER.indexOf(band);
    const k = RATIO_OF[up ? `${from}>${band}` : `${band}>${from}`];
    if (!k) continue;
    const src = MARKET_STR[loc][from]!;
    return {
      adr: Math.round(up ? src.adr * k.adr : src.adr / k.adr),
      revpar: up ? src.revpar * k.revpar : src.revpar / k.revpar,
      listings: src.listings,
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
 * Veřejný faktor 0,95 v centru je ZÁMĚRNÝ konzervativní výhled dopředu proti
 * naměřenému poměru ~0,99. NENÍ kalibrovaný na historii a NENÍ to pravidlo,
 * že každý náš byt musí veřejný odhad překonat — to pravidlo bylo 31. 8. 2026
 * opuštěno. Interní podklad pro nabídku majiteli počítá s naměřenou 1,00.
 */
export const OPERATOR_FACTOR_PUBLIC: Partial<Record<LocationKey, number>> = {
  praha1: 0.95, praha2: 0.95,
};
export const OPERATOR_FACTOR_INTERNAL: Partial<Record<LocationKey, number>> = {
  praha1: 1.0, praha2: 1.0,
};
/** Mimo centrum: naměřeno 1,21 (Praha 3, hlavně Modern AC 1,31) a 1,08
 *  (Mozart). Veřejně i interně 1,10. */
export const OPERATOR_FACTOR_DEFAULT_PUBLIC = 1.1;
export const OPERATOR_FACTOR_DEFAULT = 1.1;

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
/** Rozsah posuvníku plochy podle dispozice. Výchozí hodnota není tady: bere se
 *  typicalArea(čtvrť, dispozice), tedy medián Sreality pro danou lokalitu. */
export const SIZE_SLIDER: Record<SizeKey, [number, number]> = {
  "1kk": [20, 55], "2kk": [35, 85], "3kk": [50, 115], "4kk": [70, 140],
};

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
export type CtvrtCell = { adr: number; revpar: number; listings: number };
export const MARKET_CTVRT: Record<string, { label: string; parents: LocationKey[]; bands: Partial<Record<Band, CtvrtCell>> }> = {
  stare_mesto: {
    label: "Staré Město", parents: ["praha1"],
    bands: {
      "1BR": { adr: 3206, revpar: 2467.4, listings: 533 },
      "2BR": { adr: 4886, revpar: 3733.7, listings: 297 },
      "3BR": { adr: 6353, revpar: 4809.4, listings: 110 },
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
  if (!own || !district) return district;
  const w = ctvrtWeight(own.listings);
  if (w === 0) return district;
  return {
    adr: Math.round(own.adr * w + district.adr * (1 - w)),
    revpar: own.revpar * w + district.revpar * (1 - w),
    listings: own.listings,
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
/** Nájem konkrétní plochy v dané lokalitě. JEDINÁ funkce na nájem na webu.
 *  Dispozice jen dodá výchozí plochu, když m² chybí. */
export const rentFor = (loc: LocationKey, size: SizeKey, m2 = MEDIAN_AREA[size], furn: FurnRent = "mix") =>
  Math.round(m2 * Math.exp(RENT_INTERCEPT[loc]) * Math.pow(m2, RENT_SLOPE) * FURN_RENT[furn]);

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
 * Roční růst pro pětiletý horizont. Schválně proti nám: nájmy v Praze rostou
 * rychleji než krátkodobý pronájem (CEMAP, Sreality, RealityMIX, ČSÚ, Deloitte
 * vs pražské hotely v korunách).
 */
export const RENT_GROWTH = 0.05;
export const STR_GROWTH = 0.03;
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
  trace: { base: Band; next: Band | null; w: number; ctvrt: string | null; factor: number; availability: number };
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
  { season = "year" as SeasonKey, m2, ctvrt = null, scope = "public" as "public" | "internal" } = {} as
    { season?: SeasonKey; m2?: number; ctvrt?: string | null; scope?: "public" | "internal" },
): OwnerMonthly {
  const guests = guestsFor(size);
  const area = m2 ?? typicalArea(location, size);
  const band = bandForSize(size, area);
  if (!isMeasured(location)) return { supported: false, band, guests };

  const cfg = BAND_BLEND[size];
  const usedCtvrt = ctvrt && MARKET_CTVRT[ctvrt]?.parents.includes(location as LocationKey) ? ctvrt : null;
  const baseCell = localCell(location, cfg.base, usedCtvrt);
  if (!baseCell) return { supported: false, band, guests };
  const nextCell = cfg.next ? localCell(location, cfg.next, usedCtvrt) : null;
  const w = nextCell ? bandWeight(size, area) : 0;

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
    trace: { base: cfg.base, next: nextCell ? cfg.next ?? null : null, w, ctvrt: usedCtvrt, factor: k, availability: AVAILABILITY },
  };
}
