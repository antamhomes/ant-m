# Nedodělané věci

Web se staví bez chyb a je funkční. Zůstalo ale 6 neúspěšných kontrol (testů), které hlídají texty a čísla. Každá znamená buď starý test, nebo skutečně chybějící text na webu.

## 1. Telefon v potvrzení po odeslání
Kontrola čeká starý telefon 727 952 459, na webu je nový +420 776 607 003.
Řešení: srovnat kontrolu na nové číslo.

## 2. Text tlačítka "Poslat byt k výpočtu"
Teď je verzálkami: POSLAT BYT K VÝPOČTU. Kontroly čekají normální psaní.
Rozhodnutí: buď necháme verzálky a upravíme kontroly, nebo se vrátíme k "Poslat byt k výpočtu".

## 3. Zmizelá věta o garanci u kalkulačky
Věta "Garance výnosu vzniká až…" byla vymazána (zbyl prázdný řádek). Kalkulačka tak nikde neříká, že výsledek není garance.
Řešení: vrátit krátkou větu, nebo kontrolu zrušit, pokud to tam už nechcete.

## 4. Vietnamský hero – chybí číslo 57 000
Vietnamská důvěryhodná řádka už neobsahuje částku, kterou kontrola porovnává s kartami portfolia.
Řešení: buď doplnit číslo, nebo kontrolu upravit na nový text.

## 5. Technická kontrola v kalkulačce
Kód byl kvůli kompatibilitě přepsán z `Object.hasOwn` na `Object.prototype.hasOwnProperty.call`. Kontrola stále hlídá starý zápis.
Řešení: upravit kontrolu, chování je stejné.

## 6. Ceník a DPH
Starší kontrola čeká zmínku o DPH z provize, která byla z ceníku odstraněna.
Řešení: potvrdit, že DPH zmiňovat nechceme, a kontrolu srovnat.

## Co udělám po schválení
Projdu body 1–6, u textových otázek (2, 3, 4, 6) se držím současného znění na webu a srovnám kontroly, pokud neřeknete jinak. Pak spustím všechny kontroly a build.
