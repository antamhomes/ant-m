## Kalkulačka — provize a energie

Soubor: `src/components/CalculatorSection.tsx` (+ klíče v `src/i18n/translations.ts`).

### 1. Konstanty

```ts
const MGMT_FEE = 0.22;            // 22 % z net (po platformě/úklidu/supplies) — střed pásma 20–25 %
// Energie (Kč/měs) — fixní dle dispozice
energy: 1kk=2500, 2kk=3500, 3kk=4500, 4kk=6000
```

`MGMT_FEE` necháme jako jednu konstantu nahoře (snadno přepneš na 0.20 / 0.25). `energy` přidáme do pole `sizes` vedle `supplies`.

### 2. Výpočet

Aktuálně:
```
net = gross − platforma − úklid − supplies
```

Nově (pro měsíc i pro roční průměr):
```
netBeforeMgmt = gross − platforma − úklid − supplies
mgmtFee       = round(netBeforeMgmt × 0.22)
netOwner      = netBeforeMgmt − mgmtFee        // hlavní číslo
// energie zůstávají STRANOU — jen v poznámce
energyMonth   = sizeData.energy
```

Roční průměr stejnou logikou ze sezóny `year` × 12.

Poměr vůči LTR (`ratio`) přepočítat z `netOwner` (poctivější srovnání).

### 3. UI změny v zelené kartě

Breakdown (rozbalovací sekce) — přidat řádek **nad** Net:

```
− Naše správa (22 %)        − X Kč
```

Hlavní velký řádek **„Výnos pro majitele"**:
- velké číslo = `netOwner` (po naší provizi)
- podtitulek upravit: *„po platformě, úklidu, drogerii a naší správě"*
- malá poznámka pod číslem nahradit za:
  *„Energie bytu (~{energyMonth} Kč/měs) hradí majitel zvlášť dle reálné spotřeby."*

Roční průměr pod tím — beze změny vizuálně, jen číslo je `netOwner_year × 12`.

LTR srovnání — text `ratio×` se počítá z nové (nižší, ale poctivé) hodnoty.

### 4. Texty

- `calc_net_sub` CS: „po platformě, úklidu, drogerii a naší správě" / VI: „sau phí nền tảng, dọn dẹp, vật tư và phí quản lý"
- nový klíč `calc_mgmt` CS: „Naše správa" / VI: „Phí quản lý"
- `calc_excluded_note` CS: „Energie bytu hradí majitel zvlášť — orientačně {X} Kč/měs dle dispozice a reálné spotřeby." / VI obdoba.
  (placeholder `{X}` nahradíme `energyMonth` přímo v komponentě, nikoli v překladu — překlad bude bez čísla a číslo doplníme inline.)

### Dopad

Pro Prahu 2, 2+kk, celý rok (orientačně):
- dnes net ≈ 38–42k Kč/měs
- nově po provizi 22 %: ~30–33k Kč/měs (poctivé „toto vám reálně chodí")
- pod tím poznámka o ~3 500 Kč/měs energií
- roční ~370–400k → vs LTR 28k (ratio ~1.1–1.2×) — pořád zisk, navíc bez rizik dlouhodobého nájmu

### Co se NEMĚNÍ

ADR tabulky, occupancy, sezónní koeficienty, platforma 15,5 %, úklidy, supplies, LTR tabulka.
