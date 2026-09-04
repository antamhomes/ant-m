# Model kalkulačky: co je změřené, co odhadnuté a co se nesmí vrátit

Stav k 31. 8. 2026. Jediný zdroj pravdy pro čísla je `src/lib/yield.ts`; tenhle
soubor jen říká, čemu se dá věřit a proč. Když se rozejde s kódem, platí kód a
tenhle soubor je potřeba opravit.

Vzniklo po dni, kdy se model přestavoval a spousta mezizávěrů se cestou zahodila.
Největší riziko teď není chyba ve vzorci, ale že někdo za týden v dobré víře
vrátí pravidlo, které jsme vědomě zrušili. Proto je poslední sekce nejdůležitější.

---

## 1. MEASURED

Podložené daty. Změnit jen když se změní data, a pak i s testem.

**Trh krátkodobých pronájmů.** `MARKET_STR`, PriceLabs STR index, 12 uzavřených
měsíců 8/2025 až 7/2026, oficiální hranice okresů z OSM. Buňka se ukazuje jen
při průměrně ≥ 50 aktivních nabídkách. Surová data v `data/pricelabs-2026-08/`,
`facts.test.ts` je z nich přepočítává.

**`AVAILABILITY = 0.92`.** PriceLabs počítá RevPAR z DOSTUPNÝCH nocí, kdežto
`avg_revenue` je za celý kalendářní měsíc. Rozklad všech 27 segmentů dal 0,92
(rozptyl 0,88 až 0,98). Aplikuje se právě jednou; hlídá to test.

**Co PriceLabs vlastně měří** (ověřeno přímo u dodavatele 2. 9. 2026, ne odhad
z paměti). `ADR`, `RevPAR` i `avg_revenue` jsou **hrubé ubytovací tržby PŘED
provizemi platforem**. Nezahrnují úklid, poplatky za osobu navíc ani daně.
A jsou to **odhady** z pozorovaných cen a obsazených dat v kalendáři, **ne
vyúčtované výplaty**.

Z toho plynou tři věci a ani jedna se nesmí zaokrouhlit na „to je v pohodě":

1. **Odečítat provizi od tohoto základu je správně.** Není to dvojí odečet —
   PriceLabs provizi ještě neodečetl.

2. **`PLATFORM_FEE = 0.17` je EFEKTIVNÍ zjednodušení, ne reprodukce smluvního
   základu.** Skutečná provize se u části kanálů počítá i z úklidu, tedy
   z ŠIRŠÍHO základu, než na jaký ji model aplikuje. Model přesný poplatkový
   základ nereprodukuje a netvrdíme to. Naměřeno na 7 bytech za 12 měsíců:
   efektivně 17,3 až 20,6 % z ceny pokoje. **0,170 leží těsně POD tím pásmem**,
   tedy na optimistické straně majitele. Nepiš, že to kalibrace „už řeší" —
   neřeší, je to vědomě opatrné číslo směrem k vyššímu výsledku.

3. **Operátorský faktor je REALIZOVANÁ tržba Antamu proti ODHADOVANÉMU trhu.**
   Není to výplata proti výplatě. Je to nejlepší srovnání, které v současnosti
   držíme; přímé settled-payout benchmarky trhu nemáme. Že se případná
   systematická chyba odhadu vykrátí, protože týž odhadce stojí v čitateli
   i jmenovateli každého čtvrťového indexu, je **věrohodné, ale nedoložené**.
   Kdo na tom bude stavět další vrstvu, musí to ověřit, ne převzít.

**Poměry mezi pásmy.** ADR i RevPAR: 1BR→2BR 1,525 / 1,517 · 2BR→3BR 1,514 /
1,481 · 1BR→3BR 2,329 / 2,304. Vážené počtem nabídek přes čtvrti, kde jsou obě
pásma solidní. Poměr 1BR→3BR je změřený přímo, ne součin sousedních.

**Operátorský faktor.** Rekonciliace vlastních bytů proti PriceLabs:
Praha 1 = 0,99 (3 byty, 402 1,08 · 405 0,95 · 302 0,94, ~318 dní každý),
Praha 3 = 1,21 (2 byty, Modern AC 1,31 / 139 dní · Garden APT 1,21 / 54 dní),
Praha 5 = 1,08 (1 byt, Mozart, 113 dní). Je to poměr TRŽBY proti průměru trhu,
ne zvednutá obsazenost.

**Pásmo se řídí kapacitou, ne dispozicí.** Mozart 40 m² pro 4 vydělává jako 1BR;
Čelakovského 52 m² pro 8 jako 2BR; Modern AC 55 m² pro 6 jako 2BR. Z toho je
kalibrované překlopení 2+kk mezi 40 a 55 m².

**Pásmo PriceLabs není počet fyzických pokojů.** Je to počet ložnic, které host
deklaruje na Airbnb. Důkaz: v každém comp setu je pásmo Studio o 10 až 27
nabídkách vedle 1BR o 200 až 280, tedy pražští hostitelé listují 1+kk jako 1BR.

**Čtvrťový efekt na nájem.** Průměrné REZIDUUM čtvrti proti okresní křivce
(surový export téhož scrapu, katastr u 3 350 z 3 429 inzerátů, stejné filtry).
Kontrola: reziduum stávajícího modelu po okresech vychází −0,029 až +0,028,
takže okresní vrstva sedí a nepřefitovávala se. Po shrinkage: Karlín +12 %,
Smíchov +8 %, Nusle +4 %, Vinohrady v Praze 3 +4 %, Žižkov −4 %, Stodůlky −4 %,
Kobylisy −3 %, Libeň −2 %. Sdílená čtvrť má pro každý okres vlastní hodnotu
(Vinohrady +1 % v Praze 2, +4 % v Praze 3).

**Dlouhodobý nájem.** 1 354 vyčištěných inzerátů Sreality (scrape 30. 8. 2026).
`base_rent(m2, okres) = m2 * exp(a) * m2^-0,2565`, intercepty po okresech,
kotva Deloitte Rent Index Q2/2026 v testu ±12 %. Faktor vybavenosti
furnished 1,114 · partly 0,99 · none 0,938 · **mix 1,0 = fit celého vzorku**.

**Provize platforem.** Změřeno na 7 bytech za 12 měsíců: 17,3 až 20,6 %.
`PLATFORM_FEE = 0.17` je dolní okraj měřeného pásma.

**Naše obsazenost.** 85 až 97 % proti tržním 68 až 77 %, ale za 63 až 77 %
tržního ADR. Proto je efekt Antam vidět na tržbě, ne na obsazenosti.

**Sezónní násobky** po okresech z týchž měsíčních řad; 7× léto + 4× zima +
1× prosinec dává přesně rok.

---

## 1b. STAV DAT VE ČTYŘECH VRSTVÁCH

Čtyři různé vrstvy, které se nesmí slévat do „máme data o Praze". Každá má jiné
pokrytí, jiný zdroj a jinou spolehlivost.

| vrstva | zdroj | pokrytí dnes |
|---|---|---|
| **Okresní STR** | PriceLabs, `data/pricelabs-2026-08/praha1..9.json` | 9 okresů, 20 buněk pásem z 27 možných. Praha 10 nemá NIC. |
| **Čtvrťové STR** | PriceLabs | **prakticky chybí.** Staré Město = rekonstruované, Nové Město = `partial`. Žádný jiný čtvrťový artefakt v repu není. |
| **Okresní LTR** | Sreality 8/2026, 1 354 vyčištěných inzerátů | všech 10 okresů, `RENT_INTERCEPT`. |
| **Čtvrťové LTR** | týž scrape, reziduum proti okresní křivce | 34 kontextů nad 31 geometriemi, 33 s vlastním efektem, 1 deklarovaný fallback. |

Asymetrie mezi řádky 2 a 4 je celý důvod, proč existuje plán pullů z PriceLabs
po čtvrtích: na nájemní straně čtvrť rozlišit umíme (Karlín +12 % proti Kobylisy
−3 % v jednom okrese), na STR straně ne, takže se čtvrťový rozdíl v STR dnes
tiše nahrazuje okresním průměrem. **Plán pullů je návrh, ne stav** — k dnešnímu
dni neproběhl žádný nový pull a nesmí proběhnout před hotovým a otestovaným
Step 0 (idempotence prokázaná na opakovaném běhu / dry-run).

Dvě buňky, které nejsou plnohodnotná data a musí se tak i chovat:
`stare_mesto` je REKONSTRUOVANÁ (pull přes `market_research`, měsíční řada se
neuložila, `nMin` neznámé, takže bránou spolehlivosti neprojde a reprodukovat
ji ze surového artefaktu nejde), `praha1_nove_mesto` je `partial` (ne všechna
pásma). Ani jedna nesmí být použita jako důkaz, že čtvrťová vrstva funguje.

**Poměr 1,35× → 1,51× není zjištění o Praze.** Medián poměru STR/LTR, který
kalkulačka vydává, se posunul kvůli NAŠIM rozhodnutím o prezentaci a faktorech
(headline z prostředku rozpětí na horní okraj označený jako potenciál, revize
operátorských faktorů, sjednocení nájemního benchmarku na `mix`). Vstupní tržní
data se přitom nezměnila. Je to tedy vlastnost VÝSTUPU kalkulačky, ne empirický
nález o ekonomice pražského STR, a takhle se o tom musí mluvit i navenek.

---

## 2. HEURISTIC

Vědomá volba, ne měření. Smí se změnit, ale musí se u toho říct proč.

**3+kk překlopení 65 až 95 m².** OPRAVA KONZISTENCE, ne kalibrace. Pro 3+kk
nemáme ani jeden vlastní byt s historií (Secret Garden Loft jede od 7/2026,
Klement je Mladá Boleslav). Důvodem byl vnitřní rozpor: typický 2+kk okresu
ležel na váze 0,87 až 1,00, typický 3+kk na 0,20 až 0,64 a v Praze 9 na 0,00,
přestože 3+kk má o samostatný pokoj a o 25 až 30 m² víc. Střed 80 m² je medián
typické plochy 3+kk přes okresy. Zůstává HEURISTIC, dokud nebude vlastní historie.

Nezkracovat na „oprava konzistence". Ta věta sama o sobě neříká nic a příště
svede k tomu hranice posunout znovu „pro konzistenci". Konkrétní důvod byl ten
nepoměr blend vah výše: 3+kk sedělo skoro celé na 2BR baseline, přestože má
o pokoj a o 25 až 30 m² víc než 2+kk, které na téže škále leželo nahoře.
Posun 75–100 → 65–95 ten nepoměr srovnal. Nezměřil ho.

**Že zlomy leží zrovna na 40/55 a 65/95.** Že rozhoduje kapacita, je změřené.
Že hranice jsou přesně tam, změřené není.

**Asymetrické pravidlo pro veřejný faktor.** Měření, které veřejné číslo
snižuje, se bere celé; měření, které ho zvyšuje, se krátí k výchozí 1,10 podle
váhy vzorku. Praha 3 tak vychází na 1,155 místo naměřených 1,21. Je to ZÁMĚRNÁ
veřejná opatrnost, ne statistika. Na počet provozních dní má Praha 3 dokonce víc
dat než Praha 5; čistě vzorkové pravidlo by krátilo Prahu 5, ne Prahu 3.

NIKDY z toho nedělej odhad podle velikosti vzorku. `publicFactorFrom` se tak
tváří, ale není to estimátor: `weight` není statistická váha, je to míra
ochoty ukázat naměřený upside veřejně. Kdyby to byl vzorkový estimátor, musel
by být symetrický — a symetrický vědomě není. Kdo ho zesymetrizuje „pro
konzistenci", zvedne veřejná čísla, aniž by přibyl jediný den měření.

**Praha 2 = 0,95.** Žádné vlastní provozní měření v okrese. Drží se pod
výchozí 1,10, protože nemáme čím doložit, že tam umíme nadprůměr.
Nedědí 0,99 z Prahy 1 a dědit ho nesmí: Praha 1 a Praha 2 spolu sousedí a mají
podobný bytový fond, ale geografická podobnost není měření. Operátorský faktor
je poměr NAŠÍ tržby k trhu, a ten se přenáší jen s vlastním provozem, ne
s polohou. Až v Praze 2 pojede vlastní byt, nahradí 0,95 měření — do té doby
je to volba, ne odhad.

**Výchozí 1,10 mimo změřené okresy** (Praha 4, 6, 7, 8, 9).

**Prezentační konstanty.** `LOW_BLEND 0.5` · `SPREAD` 0,92 / 1,08, minimální
šířka 8 %, rozšíření odvozeného pásma ×1,6 · `YEAR_ONE_RAMP 0.85` ·
`LAUNCH_FEE 25 000` · `ENERGY` a `RENEW_PER_ROOM_YEAR`.

**Rozšíření odvozeného pásma ×1,6.** Buňka, která se nepullovala, ale odvodila
jedním krokem z nejbližšího spolehlivého pásma, nese navíc chybu toho poměru —
rozptyl 2BR→3BR je 3,4 %, 1BR→3BR 7,2 %, a to je rozptyl PŘES OKRESY, ne
nejistota jednoho okresu. Široké rozpětí je tedy přiznání „tohle číslo jsme
neviděli, dopočítali jsme ho", ne tvrzení o volatilitě trhu. Násobek 1,6 sám
změřený není; má jen řád odpovídat tomu, o kolik je odvozená buňka horší než
pullnutá. Až se pásmo pullne, rozšíření musí zmizet — ne zůstat „pro jistotu".
Test hlídá, že se aplikuje; test neříká, že 1,6 je správně.

**Meze kalibrační pojistky** 0,70 a 1,00. Smoke test proti tomu, aby se model
tiše rozbil, ne důkaz správnosti.

**Schody shrinkage u čtvrťového nájmu 100 / 50 / 25 / 12.** NENÍ to změřený
zákon, je to volba. Směr je správný (tenký vzorek se stahuje k okresu), ta
konkrétní čísla ne. První tři stupně jsou převzaté z `ctvrtWeight` u STR,
čtvrtý je přidaný, protože nájemní vzorky jsou o řád menší. Čtvrti pod
12 inzerátů se do tabulky vůbec nedostanou, proto tam není Staré Město (n=11).

**Že se nepřidal člen za dispozici.** Reziduum po dispozicích je u „+kk" bytů
do ±5 %, ale u „+1" variant −10 až −12 %. Ten signál není o dispozici, ale
o starším bytovém fondu, a přidání členu by hnulo VŠEMI dnešními nájmy. Zvlášť,
ne v téhle vrstvě.

**`RENT_GROWTH = 0` a `STR_GROWTH = 0`.** NENÍ to předpověď, že nájmy ani STR
neporostou. Nula neznamená „očekáváme 0 %", znamená „nehádáme". Rozhodující
veličina totiž není růst jednoho trhu, ale ROZDÍL v růstu obou; ten neumíme
doložit a dřív jsme si ho tiše vymysleli (3 % proti 5 %) a nechali rozhodovat
výsledek. Pětiletka proto drží dnešní tržní podmínky konstantní a porovnává
dnešní STR proti dnešnímu nájmu. Web to říká nahlas.
Kdyby se růst někdy vracel, musí se vrátit oběma stranám a s doloženým zdrojem,
ne jako dvě různá čísla.

**`RELIABLE_MIN_N = 50` je nekalibrovaná hranice.** Prohledali jsme repo, docs
i historii: pro hodnotu 50 není nikde zaznamenaný empirický důvod. Nejstarší
stopa je POPISNÁ, ne zvolená — komentář u `MARKET_STR` říká „chybějící pásmo =
vzorek pod ~50 nabídek nebo anomálie v řadě", tedy 50 s vlnovkou jako
pozorování, kdy pásmo nemá smysl ukazovat (P9 2BR n=24), ne jako práh
odvozený z rozptylu. Totéž číslo se objevuje i ve schodech `ctvrtWeight`
(100/50/25); že je to tentýž práh, nikde doloženo není.
Co doloženo JE: přesun prahu z `nMean` na `nMin` (31. 8. 2026) byl na dnešních
okresních buňkách číselně neutrální — nepřeklopil ani jednu (viz sekce 5). To
ověřuje ten PŘESUN, ne tu HODNOTU. 50 zůstává beze změny a schválně se k němu
nedopisuje hezky znějící statistické zdůvodnění; kalibruje se, až budou nové pully
z čtvrtí, kde se dá porovnat rozptyl tenkých a tlustých buněk.

---

## 3. CURRENT PRODUCT RULES

**Veřejné vstupy:** Praha X → čtvrť (jen kde jsou data) → dispozice → velikost
→ volitelně sezóna. Samé klikání, žádné psaní; posuvník na m² je pryč od
31. 8. 2026 (viz sekce 5). Kapacita ani kvalita se neptají.

**Headline je dosažitelný VRŠEK už spočítaného rozpětí,** označený jako
POTENCIÁL. Nemění to žádný předpoklad modelu, jen se featuruje jiný bod téhož
rozpětí.

**Veřejně je to JEDNO číslo (1. 9. 2026).** Řádek „odhadované rozpětí X až Y"
se přestal renderovat. Není to změna modelu ani zaokrouhlení: `low`, `high`
i `mid` se počítají dál a jdou beze změny do stopy, do leadu (`owner_low`,
`owner_high`), do pětiletého grafu i do MCP nástroje. Ověřeno na všech
832 veřejných kombinacích (okres × čtvrť × dispozice × kbelík × sezóna):
před i po je výstup `ownerMonthly`, `rentFor` i `fiveYear` bajt po bajtu týž.

Rozpětí se NENAHRAZUJE jinou formou nejistoty. Žádné „od X", „až X", žádný
interval spolehlivosti, žádný odznak kvality dat ani skóre. Kdo by to chtěl
vrátit, mění produktové rozhodnutí, ne formátování.

**Násobek i benefit v Kč/rok mají JEDNU podmínku.** Do 1. 9. 2026 měl každý
svou (`ratio` po zaokrouhlení nad 1× proti `high > ltr`), takže mezi 1,00×
a 1,05× — 8 z 832 kombinací, typicky zimní sezóna — stránka psala „dlouhodobý
nájem vychází podobně nebo výše" a hned pod tím zlatě „+9 000 Kč ročně navíc".
Obojí teď visí na `betterThanLtr`; ani `ratio`, ani roční rozdíl se nepočítá
jinak.

**Násobek proti nájmu jen když je po zaokrouhlení nad 1×.** Jinak se řekne
rovnou, že dlouhodobý nájem vychází podobně nebo výš. Benefit v korunách za
rok stojí pod headline jako druhý nejsilnější prvek karty a řídí se TOUŽ
podmínkou jako násobek.

**Pořadí v kartě výsledku:** měsíční potenciál (dominantní) → rozdíl v Kč za
rok → měsíční nájem pro srovnání → tichá metodika → CTA.

**Jeden nájemní benchmark na celé stránce: `mix`.** Kalkulačka i graf. `mix` je
fit celého vzorku, tedy skutečná alternativa majitele. Porovnávají se dvě
strategie využití bytu, ne dva stejně provozované produkty.

**Pětiletý graf je oddělený scénář PO NÁKLADECH.** Odečítá energie, obnovu
vybavení, uvedení do provozu a rozjezd prvního roku. V kartě výsledku pro něj
NENÍ teaser: roční rozdíl je hrubý rozdíl měsíčních příjmů a vedle pětiletky by
to vypadalo, že jedno je pětina druhého. Hlavní křivka jede na stejném základu
jako headline (`HorizonBasis = "potential"`).

**Kapacita není veřejné tvrzení.** Nikde: ani v kalkulačce, ani v grafu, ani
v textu do poptávky, ani ve výstupu MCP nástroje. Kolik lůžek se vejde, závisí
na proporcích pokojů, ne na celkových m².

**Veřejné a interní se liší MNOŽSTVÍM INFORMACÍ, ne násobitelem.** Interní
faktory jsou totožné s veřejnými. Prohlídka odstraní nejistotu o konkrétním
bytě, ale nezvětší vzorek, ze kterého je změřený okresní faktor.

**INVARIANT: přepnutí na `scope: "internal"` samo o sobě číslo nezvedne.**
Interní bez pozorování se musí rovnat veřejnému do koruny. Číslem hne jen
`ObservedConfig` s povinným polem `evidence`, a to OBĚMA směry: špatný půdorys
musí umět srazit pod veřejný odhad. Hlídají dva testy.

**Jeden engine.** `src/lib/yield.ts` počítá kalkulačku, pětiletý graf, karty
portfolia i MCP nástroj. Druhý engine se nezakládá.

**Velikost se vybírá tlačítky, ne posuvníkem** (`SIZE_BUCKETS`). Tři velikosti
plus „ještě větší", které vede na individuální posouzení místo extrapolace.
Kbelík je jen vstupní rozhraní: pošle reprezentativní plochu do TÉHOŽ enginu,
ekonomika se nemění a žádný kbelík nekóduje počet osob.

Hranice jsou odvozené, ne vymyšlené. Kde dispozice překlápí pásmo, dělí se
přesně na `lo` a `hi` z `BAND_BLEND`, protože tam se mění komerční produkt.
Kde překlopení není (1+kk, 4+kk), ekonomický zlom neexistuje a dělí se podle
rozložení stocku (p25 a p75, Sreality n=1354). Poslední uzavřená hranice je
vždy p95 a `m2` v kbelíku je medián inzerátů, které do něj spadají.

| | menší | běžný | větší | individuálně |
|---|---|---|---|---|
| 1+kk | do 30 (28) | 31–40 (35) | 41–49 (45) | nad 49, 4 % |
| 2+kk | do 40 (38) | 41–55 (50) | 56–80 (63) | nad 80, 4 % |
| 3+kk | do 65 (63) | 66–95 (78) | 96–120 (106) | nad 120, 5 % |
| 4+kk | do 93 (85) | 94–132 (116) | 133–151 (142) | nad 151, 3 % |

V závorce reprezentativní plocha. U 2+kk a 3+kk dávají tlačítka rozlišitelná
čísla (test to hlídá); u 1+kk a 4+kk se mění jen nájem, protože pásmo se nemá
kam překlopit, což je jedna z otevřených věcí v sekci 4.

**Konfigurace je VERZOVANÁ** (`CALC_MODEL_VERSION`, `SIZE_BUCKETS_BY_VERSION`).
Historická verze se nepřepisuje: u každého leadu je uložené `calc_model_version`,
`calc_inputs` (okres, čtvrť, dispozice, `size_bucket_id`, `representative_m2`,
`bucket_label`, `oversized`) a `calc_result`, takže jde zpětně zrekonstruovat,
co přesně majitel viděl. **Nová hranice = nová verze, ne editace staré.**
`facts.test.ts` obsah verze `2026-08-31.1` zamyká snapshotem; kdo ho změní,
shodí test a ten mu připomene, že má přidat verzi.

Komponenta nesmí obsahovat žádnou hranici natvrdo, renderuje se z
`bucketsFor(size)`. Hlídá to test, který skenuje kód komponenty (bez komentářů
a Tailwind tříd) na všechna čísla použitá v konfiguraci.

**Hranice se přepočítají**, až se dořeší ploché zóny a přibude pásmo 4BR.

---

## 4. OPEN / WAITING FOR DATA

**Čtvrťový nájem: HOTOVO 31. 8. 2026** (`CTVRT_RENT`, `rentFor(..., ctvrt?)`).
Viz sekce 1 a 2. Obě strany porovnání jsou tím geograficky sladěné a Karlín
a Libeň se dají pouštět bez nafouknutého násobku.

**OPRAVA 2. 9. 2026: věta o re-scrapu je PŘEKONANÁ, nepiš ji sem znovu.**
Původně tu stálo, že Sreality dataset nemá sloupec čtvrti a že re-scrape má
přednost před dalšími čtvrťovými STR pully. Obojí padlo ještě 31. 8.: katastr
v datech JE (3 350 z 3 429 inzerátů v `ltr-source.csv`) a `CTVRT_RENT`
i registr `GEO` jsou z něj postavené — 33 čtvrťových kontextů s vlastním
nájemním efektem. Čtvrťový nájem tedy k dispozici je a žádný nový scrape se
na nic nečeká.

Co zbylo je ÚZKÁ mezera, ne chybějící vrstva: **Staré Město** má 11 nájemních
inzerátů, tedy pod prahem 12, a do `GEO` se nedostalo. Jeho STR je čtvrťové,
ale nájem okresní, takže násobek vyskočí z 1,62 na 1,78 jen tím, že je jedna
strana zlomku ostřejší. Re-scrape by to nespravil: Staré Město je malá čtvrť,
kde se dlouhodobě pronajímá málo, takže inzerátů tam víc nebude. Buď se čtvrť
z nájemní strany vynechá, nebo se přizná, že tenhle jeden násobek je nahoře.

Dnes je tenčí strana STR, ne nájem: čtvrťový nájem má 33 kontextů, čtvrťové
STR jeden (Staré Město, rekonstruovaný) a jeden nedokončený (Nové Město).

**OPRAVA ranního tvrzení o Starém Městě.** Ráno tu stálo, že skok násobku
z 1,62 na 1,78 při výběru Starého Města je „z velké části umělý, protože
skutečný nájem ve Starém Městě je nad mediánem Prahy 1". **Data to
nepodporují.** Surové reziduum Starého Města je −1 %, tedy nájem zhruba na
úrovni průměru Prahy 1. Vzorek je ale jen n=11, takže správný závěr je
„nevíme dost", ne „nájem je určitě vyšší" a ani ne „ten uplift je falešný".
Případ, který tu vrstvu obhajuje, je Karlín (+12 %), ne Staré Město.

**Až přijde první čtvrť s STR daty, ve STEJNÉM patchi přidat párovací guard.**
Obě vrstvy se klíčují slugem a nic je dnes nedrží pohromadě, takže se dá tiše
spadnout zpět na `Karlín STR / Praha 8 nájem` jen tím, že se v `MARKET_CTVRT`
napíše jiný slug než v `CTVRT_RENT`. Test má hlídat obojí:

1. každá čtvrť v `MARKET_CTVRT` má buď odpovídající klíč v `CTVRT_RENT` pod
   TÝMŽ okresem, nebo výslovně deklarovaný fallback na okres i s důvodem;
2. kde čtvrť má obě vrstvy, musí kalkulačka použít OBĚ naráz — tedy
   `rentFor(..., ctvrt)` se nesmí lišit od okresního nájmu, pokud
   `ctvrtRentFactor` pro tu čtvrť není 1.

Dnes je jediný takový případ Staré Město: má STR data, ale nájemní vzorek
n=11 je pod prahem, takže na nájmu spadne na okres. To je ZÁMĚRNÝ fallback
a v guardu musí být deklarovaný, ne jen tolerovaný.

**Karlín a Libeň.** Praha 8 vychází na 1,71 až 2,08× a není to divný datapoint:
uvnitř okresu je Karlín, který okresní STR benchmark legitimně táhne nahoru,
zatímco nájemní medián sráží Libeň a Kobylisy. Praha 8 se za to NESRÁŽÍ.
Pull ukáže, jestli je to Karlín effect. Do doby, než bude čtvrťový nájem, se
ale ten poměr nesmí číst jako sladěné lokální srovnání.

**4BR a 5BR pásmo.** 4+kk je dnes zastropené na 3BR, takže celý rozsah 70 až
140 m² vrací totéž. Bez 4BR dat se to poctivě spravit nedá.

**Ploché zóny m².** Jakmile dispozice dosáhne nejvyššího dostupného pásma, STR
přestane na plochu reagovat, zatímco nájem roste dál. Týká se to zhruba 53 %
realistického pražského stocku: 1+kk celý rozsah (STR +0 % proti nájmu +112 %),
2+kk nad 55 m² (39 % z nich), 3+kk nad 95 m² (24 %), 4+kk celý rozsah.
Uvažovaný směr: jednostranná omezená prémie AŽ ZA vyčerpaným pásmem, s klesajícím
přírůstkem, kolem β 0,25 a stropem +15 %. Nikde v datech, která držíme, se ale
vnitropásmová elasticita změřit nedá (Airbnb nezveřejňuje plochu), takže by to
bylo HEURISTIC. Horní mez: mezipásmová elasticita vychází na 0,94 až 0,95,
elasticita nájmu na plochu je 0,74, vnitropásmová musí být výrazně pod oběma.

**1+kk potřebuje vlastní pravidlo.** Nemá kam blendovat. Otestovat nejdřív
1BR→2BR u velkých 1+kk, teprve pak prémii.

**Praha 10** nemá STR data, vrací „posoudíme individuálně".

**Drobnosti:** `ratioFor` má natvrdo `"2kk"` · nevysvětlený rozdíl 5,5 až 6,8 %
na kartách portfolia · odvozené `ltr_rent` pro Prahu 4, 6 a 8 v DB.

**Z integrace Žižkova 4. 9. 2026 — dva otevřené body, ZÁMĚRNĚ nevyřešené
v témž commitu, aby pipeline zůstala čistá:**

1. **Kalibrace odvozeného okresního 3BR v Praze 3.** `MARKET_STR.praha3`
   pásmo 3BR nemá (tenké měření n≈46 potlačené v srpnu) a `marketCell` ho
   odvozuje z 2BR celopražským poměrem: RevPAR 2303,5 × 1,481 = **3411,5**.
   Proti tomu stojí dvě nezávislá přímá měření téže geografie: potlačený
   okresní vzorek **4210,7** (n≈46) a Žižkov **4333,9** (n 44; Žižkov je
   ~95 % okresní nabídky 3BR). Odvozená buňka leží ~20 % pod oběma. Není
   to důkaz proti poměru obecně (Nové Město i Vinohrady sedí na ±4 %), ale
   v Praze 3 poměr 3BR/2BR zjevně neplatí: vlastní okresní `3BR/1BR` je
   2,654 a Žižkov 2,805, kdežto celopražský 2,304. Prověřit jako otázku
   kalibrace okresního pásma — např. jestli má okres s vlastním tenkým
   měřením dostat donora jinak než čistě celopražským poměrem. **Nic
   z toho se nemění bez samostatné analýzy a předregistrace.** Dnes
   Žižkov 3BR ve veřejném výsledku = 50 % naměřeného + 50 % odvozeného
   = 3872,7, s `derived` a rozšířeným rozpětím; přesně to shrinkage má
   dělat.

2. **`calc_derived_note` je pro částečně měřené čtvrťové blendy
   sémanticky nepřesná.** Text říká „číslo je odvozené z menších bytů ve
   čtvrti a celopražského poměru". U Žižkova 3BR je polovina čísla přímé
   měření 3BR té čtvrti a druhá polovina okresní 2BR × poměr — „menší byty
   ve čtvrti" tam nejsou vůbec. Příznak `derived` je správně (`district.derived
   && w < 1`), špatná je jen kopie. Projít text zvlášť; není to změna modelu.

**Evidence pro čtvrťový selektor v Praze 3 (rozhodnutí 4. 9. 2026).** Žižkov
proti okresu: 1BR/2BR −1,0 až −1,5 %, ale 3+kk/l +5,4 / +14,9 % a 4+kk
+13,5 %. Selektor v Praze 3 tedy není kosmetická geografie — u větších
dispozic hýbe číslem podstatně, i když u malých bytů skoro ne.

---

## 4b. DATOVÁ PIPELINE (úklid 31. 8. 2026)

**Hierarchie zdrojů, tři patra, nezaměňovat:**

1. **Autorita = surový verzovaný artefakt v repu.** `data/pricelabs-2026-08/*.json`
   a `data/sreality-2026-08/ltr-source.csv` (+ `.meta.json` se sha256
   a provenience). Jen tohle je zdroj pravdy. Číslo, které z něčeho takového
   nejde přepočítat, se do modelu nedostane — to byla chyba, kterou jsme
   u čtvrťových nájmů udělali a opravili až dodatečným commitem extraktu.
2. **Odvozený, reprodukovatelný stav modelu = `yield.ts`.** Konstanty tam musí
   jít z patra 1 přepočítat a `facts.test.ts` to vynucuje. Je to jediný engine;
   druhý (edge `public-calculator`) byl proto retirován.
3. **Downstream mirror = Supabase `str_market`.** NENÍ autorita modelu, slouží
   MCP a reportingu. Má to napsané v komentáři tabulky. Když se rozejde s repem,
   platí repo a opravuje se mirror — nikdy naopak.

**Dvě identity geografie** (`GEO`, `geoContext`):
`id` = model, čtvrť v kontextu okresu (`praha3/vinohrady`), protože sdílené
čtvrti mají v každém okresu jinou hodnotu. `sourceGeometry` = fyzický polygon
u dodavatele, sdílený kontexty, aby se kvóta neutratila dvakrát za totéž.
Dnes 34 kontextů nad 31 geometriemi. **Join jde přes registr, ne přes shodu
řetězců**, a `ltr` je vždycky vyplněné (efekt, nebo deklarovaný fallback
s důvodem), takže test rozliší schválený fallback od zapomenutého napojení.

**Dvě čísla vzorku.** `nMean` (průměr přes měsíce) k vážení, protože adr
i revpar jsou taky průměry. `nMin` (nejtenčí měsíc) **výhradně** jako brána
spolehlivosti. Do úklidu bylo jedno pole `listings` a Supabase pod týmž názvem
drželo minimum, takže dvě úložiště hlásila pro tentýž pull jiné n.

**Step 0 je HOTOVÝ a vynucený v databázi** (migrace `20260831212202`,
`20260831212255`, `20260831212841`). Záruky neleží ve skriptu, který jde
obejít, ale ve schématu:

- **Přirozený klíč pullu** je primární klíč: `(geo_id, source, months_from,
  months_to, band)`. Období nesou existující sloupce `months_from`/`months_to`,
  druhou reprezentaci téhož nezavádíme. Pull jiného období = jiný klíč = INSERT.
- **Opakovaný pull téhož klíče se změněným číslem SE ZASTAVÍ.** Trigger
  `str_market_no_history_rewrite` vyjmenuje, co se mění, a odmítne zápis.
  Identický rerun projde a nechá řádek bajt po bajtu stejný. Vědomý přepis jen
  přes `set local antam.allow_history_rewrite = 'on'`.
- **`reliable` se nebere od volajícího.** Trigger `str_market_set_reliable` ho
  vždy přepočítá z `n_min`, check `reliable = (n_min >= 50)` je pojistka.
  Ověřeno: zápis `reliable = true` při `n_min = 42` skončí uloženým `false`.
- **Řádek z importní cesty musí nést měsíční řadu** (`import_version is null or
  monthly is not null`), takže `n_mean` i `n_min` jdou z databáze přepočítat.
  Staré ruční řádky mají `import_version` NULL a zůstávají, jak jsou.
- **`pull_state`** je NOT NULL, jen `partial`/`complete`, default `partial`.
  Na `complete` se přepíná až po všech požadovaných pásmech.
- **Skutečná spotřeba kvóty** se zapisuje do `pl_pull_log` po pullu.
  Neodhaduje se dopředu; bez `--requests` importér hlásí varování.
- **Kontrola překryvu čtvrtí proti okresu zůstává DIAGNOSTIKA**, ne invariant.

**OPRAVA MIRRORU, NE ZMĚNA MODELU: praha3 / 2BR `annual_revpar` 2304 → 2303.**
Při ověřování Step 0 (31. 8. 2026) se ukázalo, že Supabase drželo 2304, zatímco
ze surového artefaktu `data/pricelabs-2026-08/praha3.json` vychází 2303. Příčina
je dvojí zaokrouhlení staré ruční cesty: skutečný průměr ~2303,46 → v repu
zapsáno 2303,5 → při vkládání do integer sloupce zaokrouhleno podruhé na 2304.
Artefakt je autorita, mirror byl vedle, tak se srovnal mirror.

Co se tím NEZMĚNILO: `yield.ts` má u praha3 2BR pořád `revpar: 2303.5`, model
z `str_market` nečte a žádné číslo na webu se nehnulo. Byla to jediná odchylka
z 27 buněk okresního STR; ostatní seděly na jednotku přesně. Step 0 tedy
ekonomiku kalkulačky nezměnil — jen srovnal downstream kopii se zdrojem
a mimochodem ukázal, že staré dvojí zaokrouhlení existovalo.
Nová cesta zaokrouhluje jen jednou, ze surové řady.

Odvození artefakt → řádky je v `scripts/pl-derive.mjs` (čisté, bez IO),
CLI je `scripts/pl-import.mjs` (default dry-run, SQL až s `--emit-sql`).
Importér odmítne artefakt mimo `data/` a artefakt, který není v gitu — surový
artefakt se ukládá PŘED odvozeným zápisem. `src/test/import.test.ts` hlídá, že
odvození z artefaktů dává přesně `nMean`/`nMin`, které jsou v `yield.ts`.

**Idempotence.** Přirozený klíč `(geo_id, source, period_start, period_end,
band)`. Opakovaný pull téhož klíče přepisuje, nikdy nepřidává; `n` se nikdy
nesčítá napříč pully. Před zápisem se hlásí `raw → unique → usable` a existující
řádek s jinými hodnotami je zastavení, ne tichý přepis.
Kontrola překryvu čtvrtí proti okresu je **diagnostika, ne invariant**:
geometrie se můžou překrývat a zasahovat víc okresů a PriceLabs vrací agregát
bez listing ID, takže součet čtvrtí okres legitimně přerůst může.

## 5. SUPERSEDED / DO NOT REINTRODUCE

Tohle bylo vědomě zrušeno. Když to někde uvidíš, je to relikt, ne rozhodnutí.

| co | proč je to pryč |
|---|---|
| **Obsazenost trhu ×1,15, strop 85 %** | Popisovalo kombinaci, která u nás nenastává: jedeme 92 až 96 % obsazenosti, ale za 63 až 77 % tržního ADR. Nahrazeno naměřeným operátorským faktorem. |
| **Řetězení poměrů mezi pásmy** | 1BR→2BR→3BR zesiluje chybu. Jen jeden krok, z nejbližšího spolehlivého pásma; 1BR→3BR má vlastní změřený poměr. |
| **„Každý byt Antamu musí překonat veřejný odhad"** | Byla to optimalizace na cíl, ne model. Kalibrační test je regresní pojistka, ne důkaz správnosti. |
| **Počet hostů na veřejném povrchu** | Falešná přesnost: z celkových m² se počet lůžek tvrdit nedá. Platí i pro výstup MCP nástroje. |
| **Dva nezávislé enginy** | Edge funkce `public-calculator` byla druhá kopie modelu a rozešla se (0,15 vs 0,17, centrum 1,00 vs 0,95, 2+kk 45–70 vs 40–55, chybějící 0,92). Retirováno na HTTP 410 (v6), `calc-debug` taky (v3). Kdyby se serverová kalkulačka měla vrátit, musí se GENEROVAT z `yield.ts`. |
| **Posuvník na přesné m² jako finální veřejné UX** | Předstírá, že rozdíl mezi 79 a 81 m² se dá veřejně underwritovat. Nahradí kategorie, viz sekce 3. |
| **Různý růst 3 % proti 5 % v pětiletém grafu** | Nepodložená makro předpověď, která rozhodovala o výsledku: u typického 3+kk v Praze 9 brala za 5 let ~80 000 Kč a překlápěla dobrý dnešní případ do záporu. Navíc si odporovala s vlastním textem na webu. |
| **Donor „nejvíc nabídek"** | Odvozuje se z NEJBLIŽŠÍHO spolehlivého pásma, vzorek rozhoduje až při shodě. Poměr 2BR→3BR má rozptyl 3,4 %, 1BR→3BR 7,2 %. |
| **Střed rozpětí jako veřejný headline** | Headline je vršek označený jako potenciál, rozpětí zůstává pod ním. |
| **`furnished` jako nájemní benchmark v grafu** | Stránka tím pro tentýž byt uváděla dva různé nájmy. Všude `mix`. |
| **`reliable` uložené jako hodnota** | Odporovalo si: praha8/3BR n=41 `true`, praha3/3BR n=42 `false`. Odvozuje se pravidlem `n_min >= 50`. |
| **Práh spolehlivosti na PRŮMĚRU** | NOVÉ PRAVIDLO: práh 50 se aplikuje na `nMin`, ne na `nMean`. Není to přejmenování. Ověřeno, že se tím nepřeklopí ani jedna z 27 buněk, takže změna byla číselně neutrální — ale při dalším pullu rozhodne jinak. |
| **Dvě zaokrouhlení `nMean` v jednom souboru** | praha4 1BR 183,5 → 184, ale praha6 1BR 154,5 → 154. Sjednoceno nahoru; praha6 1BR šlo 154 → 155 bez vlivu na jakékoli zobrazené číslo. |
| **Čtvrť jako holý řetězec** | `vinohrady` neidentifikuje nic, protože má v Praze 2 a 3 jinou hodnotu. Identita je dvojice okres + geometrie. |
| **Klíč `calc_basis`** | Nic ho nerenderovalo, ale nesl zrušený uplift i opuštěný invariant a pořád se dostával do bundlu. Smazán. |
| **Závěry sešitu v5 až v7 k Booking.com** | Vycházely z domněnky, že Hospitable posílá Booking jako jednu částku. 307 z 312 rezervací je rozepsaných. Nahradila je itemizovaná rekonciliace v8. |

---

## Plochá zóna 1+kk a 4+kk: NENÍ to chyba, je to přiznaná mezera

Zapsáno 2. 9. 2026. **Než to někdo „opraví", ať si přečte tohle.**

### Co se děje

`BAND_BLEND` má pro `1kk` jen `{ base: "1BR" }` a pro `4kk` jen
`{ base: "3BR" }` — ani jedna dispozice nemá `next`. `bandWeight` je proto
vždycky 0 a **plocha nemůže u těchto dvou dispozic zvednout STR vůbec**.
Nájem přitom s m² roste (mocninná křivka v `rentFor`), takže:

- absolutní příjem majitele je napříč kbelíky **stejný**,
- roční výhoda proti nájmu i násobek **klesají**.

`2kk` a `3kk` tímhle netrpí: mají `next` a `lo`/`hi`, takže STR s plochou
roste. Někdy roste pomaleji než nájem, ale to už je ekonomika, ne mezera.

### Co audit skutečně ukázal (272 sekvencí stav × dispozice × sezóna)

| | výsledek |
|---|---|
| absolutní příjem majitele KLESÁ s větším kbelíkem | **0 případů** |
| roční výhoda proti nájmu klesá | 360 |
| příjem plochý | 272 (1kk 136 + 4kk 136) |

**Kalkulačka nikdy neřekne „větší byt vydělá míň".** To je ta obava, která
se nepotvrdila. Klesá jen srovnání, ne výplata.

### Diagnostika, NE návrh

Aby si větší kbelík udržel násobek toho malého, musel by STR vzrůst
zhruba o **+18 % u „Běžný" a +42 % u „Větší"** (shodně ve všech devíti
měřených okresech, protože jde o čistou geometrii nájemní křivky).

**Tahle čísla nejsou navrhovaná přirážka.** Jsou to měřítka velikosti
nesouladu. Kdo je použije jako koeficient, vymyslel si ekonomiku.

### Proč to PriceLabs nerozhodne

Pásma PriceLabs jsou po počtu ložnic, ne po ploše. Pásmo 1BR už v sobě
**průměruje malé i velké garsonky dohromady**, takže tržní ADR ten efekt
částečně obsahuje. Přidat k němu prémii za plochu znamená připočítat
podruhé něco, co v základu možná už je. Přímý důkaz z trhu tedy chybí
a z `market_research` ho nedostaneme.

### Co se s reálnými případy dělá dnes

Velký 1+kk, který díky dispozici opravdu funguje jako silnější produkt
(postel + rozkládací gauč, spí 4), se řeší **interně přes `ObservedConfig`**:
underwriting předá `{ band: "2BR", evidence }` a model počítá na pásmu 2BR.
Na 45 m² to dává +47 až +54 % proti veřejnému číslu, tedy víc než těch
+42 %. Veřejně se `ObservedConfig` ignoruje záměrně (`scope !== "internal"`),
aby se přes něj nedalo do webu propašovat číslo bez prohlídky.

**Veřejná logika kapacity ani přirážky uvnitř pásma ZÁMĚRNĚ neexistuje**
a čeká na důkazy. Rozhodující proměnná je konfigurace a kapacita, ne m².
Pravidlo typu „velký 1+kk = 6 hostů" je přesně to, co se sem psát nemá.

### Známý důsledek, ne chyba

U velkého 1+kk v Praze 4 a Praze 6 klesá násobek k ~1,05–1,07×. Jakmile
`ratioRounded > 1` přestane platit, karta obě zlaté řádky (Kč/rok
i násobek) schová a napíše, že dlouhodobý nájem vychází podobně nebo výš.
Vizuálně je to zlom, obsahově je to pravda: na taková data model nemá čím
tvrdit víc.

### 4+kk má tutéž mezeru na druhém konci

`4kk` sedí na `3BR`, nad kterým už žádné pásmo není. Velký 4+kk tedy nemá
kam překlopit — a je to horší případ než 1+kk, protože chybí i teoretický
cíl. Až se to bude řešit, řeší se **obě dispozice dohromady**, ne studia
zvlášť.

### Čím to bylo změřeno

Vším tímhle je vinen až **opravený harness z `ede92be`**. Předchozí
baseline měla překlep `presetM2` místo `representativeM2`, takže model
dostával `m2 = undefined`, padal na `typicalArea` a **všechny čtyři kbelíky
vracely totéž číslo** — 912 dvojic identických, 0 rozdílných. Tehdejší
baseline tuhle otázku prostě neuměla položit. Kdo bude čísla ověřovat,
ať cituje `ede92be` nebo novější, nikdy starší běh.

### PŘEDREGISTRACE: co by muselo vyjít, aby velký 1+kk dostal veřejnou přirážku

Zapsáno **2. 9. 2026, PŘED tím, než takový byt vůbec máme.** Důvod je
prostý: až jednou nějaký změříme, bude svůdné hranice posunout tak, aby
výsledek vyšel příznivě. Proto tady stojí předem.

#### Hledaný vzorek

**Velký 1+kk / garsonka, která OPRAVDU spí 5–6**, a je provozovaná
pořádně. Ne „prostě velký byt". Kapacita a dispozice jsou ta proměnná,
o kterou jde; metry čtvereční ji nenesou.

#### Mozart 414 je NEGATIVNÍ KONTROLA, ne protidůkaz

| | |
|---|---|
| proti Praha 5 **1BR** | **1,080×** |
| proti Praha 5 **2BR** | **0,732×** |

Mozart je fyzicky 2+kk, listovaný jako 1BR, ale **spí jen 4**. Vydělává
jako 1BR. Z toho plyne přesně jedna věc: **samotná plocha ekonomiku 2BR
nedělá.** Kdyby se přirážka spustila podle m², Mozart by byl nadsazený
zhruba o 37 %.

**POZOR NA ZÁMĚNU.** Mozartových 0,732 proti 2BR **není důkaz, že
kapacita výnos nezvedá.** Je to důkaz, že plocha bez kapacity ho nezvedá.
To jsou dvě různá tvrzení a Mozart odpovídá jen na první. Kdo tímhle
číslem argumentuje proti kapacitní přirážce, cituje ho špatně.

#### Předregistrované pásmo výkladu

| naměřeno u kvalifikovaného 5–6lůžkového bytu | výklad |
|---|---|
| ~1,2× proti 1BR | důkaz pro **mírnou** přirážku |
| ~1,4× proti 1BR | důkaz pro **silnější částečný blend** |
| ~1,0× proti 2BR | komerčně se chová **jako 2BR produkt** |

**Tohle jsou výkladové prahy pro diagnostiku, NE automatické spouštěče
veřejného pravidla.** Že číslo padne do pásma, neznamená, že se pravidlo
nasadí.

#### Kolik důkazů je potřeba

**Jeden vyhovující byt nestačí — ať vyjde jakkoli.** Veřejnou váhu blendu
smí nastavit až **víc změřených případů 5–6lůžkových bytů**, každý
se shodným obdobím a proti správnému pásmu PriceLabs (tedy metodikou
z auditu 2. 9. 2026: tržba po slevách, Booking přepočtený měsíčním kurzem
ČNB, benchmark ze stejných měsíců).

Do té doby platí to, co je popsané výš: veřejně beze změny, reálné
případy přes interní `ObservedConfig` po prohlídce.
