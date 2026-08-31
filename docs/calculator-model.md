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

## 2. HEURISTIC

Vědomá volba, ne měření. Smí se změnit, ale musí se u toho říct proč.

**3+kk překlopení 65 až 95 m².** OPRAVA KONZISTENCE, ne kalibrace. Pro 3+kk
nemáme ani jeden vlastní byt s historií (Secret Garden Loft jede od 7/2026,
Klement je Mladá Boleslav). Důvodem byl vnitřní rozpor: typický 2+kk okresu
ležel na váze 0,87 až 1,00, typický 3+kk na 0,20 až 0,64 a v Praze 9 na 0,00,
přestože 3+kk má o samostatný pokoj a o 25 až 30 m² víc. Střed 80 m² je medián
typické plochy 3+kk přes okresy. Zůstává HEURISTIC, dokud nebude vlastní historie.

**Že zlomy leží zrovna na 40/55 a 65/95.** Že rozhoduje kapacita, je změřené.
Že hranice jsou přesně tam, změřené není.

**Asymetrické pravidlo pro veřejný faktor.** Měření, které veřejné číslo
snižuje, se bere celé; měření, které ho zvyšuje, se krátí k výchozí 1,10 podle
váhy vzorku. Praha 3 tak vychází na 1,155 místo naměřených 1,21. Je to ZÁMĚRNÁ
veřejná opatrnost, ne statistika. Na počet provozních dní má Praha 3 dokonce víc
dat než Praha 5; čistě vzorkové pravidlo by krátilo Prahu 5, ne Prahu 3.

**Praha 2 = 0,95.** Žádný vlastní byt. Nedědí 0,99 z Prahy 1.

**Výchozí 1,10 mimo změřené okresy** (Praha 4, 6, 7, 8, 9).

**Prezentační konstanty.** `LOW_BLEND 0.5` · `SPREAD` 0,92 / 1,08, minimální
šířka 8 %, rozšíření odvozeného pásma ×1,6 · `YEAR_ONE_RAMP 0.85` ·
`LAUNCH_FEE 25 000` · `ENERGY` a `RENEW_PER_ROOM_YEAR`.

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

**`RENT_GROWTH = 0` a `STR_GROWTH = 0`.** Není to tvrzení, že trh poroste nulou.
Je to odmítnutí hádat, kterým směrem se rozejdou dva trhy, když pro to nemáme
data. Pětiletka drží dnešní podmínky a web to říká nahlas.

---

## 3. CURRENT PRODUCT RULES

**Veřejné vstupy:** Praha X → čtvrť (jen kde jsou data) → dispozice → velikost.
Jen klikání a posuvník, žádné psaní. Kapacita ani kvalita se neptají.

**Headline je dosažitelný VRŠEK už spočítaného rozpětí,** označený jako
POTENCIÁL, s rozpětím hned pod ním. Nemění to žádný předpoklad modelu, jen se
featuruje jiný bod téhož rozpětí.

**Násobek proti nájmu jen když je po zaokrouhlení nad 1×.** Jinak se řekne
rovnou, že dlouhodobý nájem vychází podobně nebo výš. Vedle násobku stojí
benefit v korunách za rok, a jen když je kladný.

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
a Libeň se dají pouštět bez nafouknutého násobku. Staré Město
zvedne STR o 10 %, ale nájem zůstane okresní, takže násobek vyskočí z 1,62 na
1,78 jen tím, že jsme zpřesnili jednu stranu zlomku. Sreality dataset nemá
sloupec čtvrti. Řešení: re-scrape s čtvrtí a lokální intercepty se shrinkage
k okresu. **Tohle má přednost před dalšími čtvrťovými STR pully.**

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

---

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
| **Klíč `calc_basis`** | Nic ho nerenderovalo, ale nesl zrušený uplift i opuštěný invariant a pořád se dostával do bundlu. Smazán. |
| **Závěry sešitu v5 až v7 k Booking.com** | Vycházely z domněnky, že Hospitable posílá Booking jako jednu částku. 307 z 312 rezervací je rozepsaných. Nahradila je itemizovaná rekonciliace v8. |
