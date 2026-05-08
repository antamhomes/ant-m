## Úprava energií v kalkulačce

Aktuální hodnoty jsou nízké (Airbnb = vyšší spotřeba: AC, topení non-stop, časté praní, vysoká teplá voda). Reálnější čísla:

| Dispozice | Dnes | Nově |
|---|---|---|
| 1+kk | 2 500 Kč | **3 500 Kč** |
| 2+kk | 3 500 Kč | **5 000 Kč** |
| 3+kk | 4 500 Kč | **6 500 Kč** |
| 4+kk | 6 000 Kč | **8 500 Kč** |

### Změna
Jediná úprava — pole `energy` v poli `sizes` v `src/components/CalculatorSection.tsx`. Žádná jiná logika se nemění (energie zůstávají jen v poznámce pod hlavním číslem, nestrhávají se z výnosu).

### Dopad
Hlavní „výnos pro majitele" zůstává stejný. Změní se jen číslo v poznámce: *„Energie bytu hradí majitel zvlášť — orientačně 5 000 Kč/měs..."* — poctivější očekávání pro majitele.
