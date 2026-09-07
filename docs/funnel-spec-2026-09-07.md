# Antam Homes: calculator-led funnel, final design spec

Date: 7. 9. 2026 · Builds on `docs/audit-funnel-2026-09-07.md` (audit approved in direction) · Repo `e4697fa` · Model `2026-09-07.1`
Status: **design only. No code, no model, no economics, no new claims.** Every number and sentence below is either already on the page, already in the repo, or marked as a proposal of copy.

The journey this optimises:

visitor → personalised market result → self-qualification → property submission → Antam underwriting → personalised pitch deck → sales conversation

Decisions taken by Vuong and locked into this spec: bands exist internally only (no visible A/B/C); public copy changes subtly by band; the `1kk · l` bucket is never treated as weak while the 1+kk capacity item is open; no result before a location is chosen; the card gets shorter; guarantee mechanics stay in Ceník, the card tests one subtle line; the form and the lead carry the result; the page compresses around Hero → proof → calculator → pricing/guarantee → how it works → form; repetition is removed, not replaced by more trust copy; deeper model data stays internal; tracking before traffic.

Copy rule applied throughout: no em dashes in site copy (the repo rule), so the C-band sentence Vuong wrote is rendered with a colon.

---

## 1. Final desktop order (1440)

Primary conversion path (everything a qualified owner needs before sending the flat):

| # | Section | id | What stays / what changes | Est. height |
|---|---|---|---|---|
| 1 | Navbar | – | links unchanged; CTA label „Poslat byt" (was „Napsat nám") | 87 |
| 2 | Hero | – | unchanged copy and single CTA „Zjistit potenciál bytu" → `#kalkulacka`; stats 11 · 520+ stay | 780 |
| 3 | Výsledky | `#portfolio` | unchanged (featured flat, „Zobrazit další výsledky", method drawer, `calcBridge` sentence) | 1 156 |
| 4 | Kalkulačka | `#kalkulacka` | empty initial state; band-aware card (§3); methodology drawer below with the data period added | ≈1 150 |
| 5 | Ceník + Garance | `#cenik` (keep `#garance` as an anchor alias inside) | one section: 70/30 headline, money flow, then „Garance výnosu" as an expanded row with the three steps, „Krytí menších škod" row, one-off drawer, foot; illustrative 28 000 / 31 500 and their note deleted; `pr1_note` deleted; one CTA at the end „Poslat byt k výpočtu" | ≈1 500 |
| 6 | Jak začít | `#jak-zacina` | four steps unchanged; the section CTA button deleted (the form is next); `process_season` line stays as the last line | ≈600 |
| 7 | Kontakt | `#kontakt` | form per §4, success per §5 | ≈1 250 |

Secondary reassurance (after the conversion opportunity):

| # | Section | id | Change | Est. height |
|---|---|---|---|---|
| 8 | Srovnání | `#srovnani` | 3 rows (Výnos, Flexibilita, Kontrola bytu); „Přehled plateb" row deleted; disqualifier paragraph (`faq13`) stays | ≈700 |
| 9 | Služby + recenze | `#sluzby` | 6 items and 3 reviews unchanged; vertical spacing reduced | ≈1 000 |
| 10 | Vyúčtování | `#vyuctovani` | real statement (byt 402) stays; portal reduced to `portal_title` + `portal_desc` + „Otevřít portál" link; `PortalDemo` and `portal_note` removed from the page | ≈700 |
| 11 | Kdo jsme | `#kdo-jsme` | quote + `about_p1` + `about_p4`; `about_p5` deleted | ≈500 |
| 12 | FAQ | `#faq` | 8 questions + `faq9` rendered first in „Peníze" | ≈600 |
| 13 | Final CTA | – | unchanged text; button label „Poslat byt k výpočtu" | 281 |
| 14 | Footer | – | unchanged | 474 |

Estimated result: page ≈10 800 px (from 13 030), form top ≈5 000 px (from 10 547), card top → form top ≈3 100 px (from ≈8 000), words on the primary path ≈650 (from ≈1 450 before the form today). Heights are estimates from the current section measurements minus the deleted blocks; verify after implementation with the same Playwright measurement.

Section order in `Index.tsx` becomes: Navbar, Hero, Portfolio, Calculator, Pricing (with Garance content), Process, Contact, Comparison, Services, OwnerReport, About, FAQ, FinalCta, Footer, StickyMobileCTA, CookieConsent. Nav links stay valid (`#kalkulacka`, `#portfolio`, `#cenik`, `#jak-zacina`, `#kdo-jsme`, `#faq`).

## 2. Final mobile order (390)

Same section order as desktop. Mobile-specific rules:

- Kalkulačka: inputs first, card after the inputs, **always** (no reordering when a result appears; today the card jumps above the inputs, which would move the select the visitor just used). After the first result appears, the page scrolls so the card headline sits at the top of the viewport; „Upravit" on the card scrolls back to the inputs (exists today).
- Sticky bottom bar becomes context-aware: outside the calculator it reads „Poslat byt" (as today, new label); while `#kalkulacka` is on screen and a result exists it shows the current result and the card CTA: „~63 000 Kč / měsíc · Chci výpočet pro svůj byt"; while `#kontakt` is on screen it is hidden (exists today). This removes the two-labels-one-destination conflict without adding an element.
- Výsledky: featured flat with the amount on the photo, as today.
- Srovnání: two-column ledger, 3 rows.
- Recenze: swipe row, as today.
- FAQ: 5 visible, „Zobrazit další otázky (4)" after `faq9` is added.
- Estimated form top ≈6 300 px (from 12 723), page ≈12 500 px (from 15 608).

## 3. Result card: states and exact copy

Band rule (internal, computed from the two numbers already in `calcPayload`):

```
ratio        = owner_high / ltr_month
annual_delta = (owner_high − ltr_month) × 12
strong  : ratio ≥ 1,7
viable  : 1,3 ≤ ratio < 1,7
          or ratio < 1,3 and annual_delta ≥ 100 000
          or (dispozice = 1kk and bucket = l)            ← capacity-limitation override, never weak
weak    : everything else (includes the 2 combinations where rounded ratio ≤ 1,0)
unsupported / oversized / none : as today
```

Thresholds are provisional (natural breaks of the 312-combination population + Vuong's anchors) and get re-set from observed contract rates after 60 days of data. They never change the number shown. The letters strong/viable/weak never appear on the page; they exist in the lead and in analytics.

Card skeleton (all supported bands), top to bottom. Nothing else on the card.

```
POTENCIÁL PŘÍJMU S ANTAM HOMES
měsíčně · po provizi platformy a odměně Antam 30 %          ← existing sub-line, the fee disclosure stays
~63 000 Kč / měsíc                                          ← headline, existing number (r.high)
+373 000 Kč ročně · přibližně 2× dlouhodobý nájem (32 000 Kč)   ← line 2, replaces the separate LTR block and the „→ přibližně 2× více" line
Praha 1 · Staré Město · 2+kk · kolem 63 m² · Upravit         ← line 3, selected property; „· Hlavní sezóna" appended only when season ≠ year
Realizované ceny v okolí (2 ložnice): 4 867 Kč/noc · 12 měsíců do 7/2026   ← line 4, market trust line with the data period
[band line, §3a]
[derived line, only when r.derived, §3b]
[CTA + promise, §3c]
[share link, strong/viable only]
```

Notes on the skeleton: „kolem 63 m²" is the representative area the model and the rent actually used (the same wording the LTR line uses today); the 2-ložnice label comes from `BAND_LABEL[r.band]` as today; the data period is one constant next to the data version and must be updated with every data refresh (the MCP note already states „12 closed months to 7/2026"; the public page currently states it nowhere). Line 2 for the two combinations with rounded ratio ≤ 1,0 keeps the existing sentence „U tohoto bytu vychází dlouhodobý nájem podobně nebo výše." and no delta.

### 3a. Band line (one sentence, small, under the trust line)

- strong: „Silný potenciál pro krátkodobý pronájem."
- viable: „Výsledek vypadá zajímavě. U tohoto bytu bude rozhodovat konkrétní stav, kapacita a patro."
- weak: „Rozdíl proti dlouhodobému nájmu je u tohoto typu bytu menší. Pokud má byt něco navíc: výhled, terasu, výjimečný stav nebo vyšší kapacitu, pošlete nám ho k posouzení."

Colour: line 2 is gold on strong and viable, neutral (same tone as line 3) on weak. The headline is identical in all three.

### 3b. Derived line (any band, only when `r.derived`)

„Pro tuhle velikost je v okolí málo nabídek, číslo vychází z menších bytů a pražského poměru mezi velikostmi."

Replaces today's `calc_derived_note`, which blames „čtvrť" even for district-level results. Appears on 126 of 312 combinations, so it must stay one line.

### 3c. CTA block

- strong and viable: primary button **„Chci výpočet pro svůj byt"**; promise line under it: „Do 24 hodin vám připravíme propočet podle adresy, stavu a půdorysu."; then the test line (strong and viable only, smaller): „U vhodných bytů umíme výsledek podložit minimem ve smlouvě." (facts: `g_step1`, `g_step2`, `faq18`); share link „Poslat výsledek na WhatsApp / Zalo" as today.
- weak: secondary-style button **„Poslat byt k posouzení"**; no promise line, no test line, no share link.
- On click (all bands): existing `antam:prefill-contact` event with `calcPayload` extended by `result_band`, `ratio`, `annual_delta`, `derived`, plus human-readable labels (`district_label`, `ctvrt_label`, `size_label`, `bucket_label`, `m2`), then scroll to `#kontakt`.

### 3d. Other states

- Empty (no location chosen yet; new default): card in the same dark style, no eyebrow: title „Začněte lokalitou." and one line „Číslo se objeví po první volbě, dispozice a velikost ho zpřesní." No button; a small text link „Raději rovnou poslat byt" → `#kontakt`. Desktop: right column as today. Mobile: below the inputs.
- Unsupported (jinde) and oversized: existing copy verbatim (`calc_unsupported_title/text`, `calc_oversized_title/text`); button label changes to „Poslat byt k výpočtu" (the text already promises the propočet within 24 hours). Lead gets `result_band = unsupported | oversized`.
- The season toggle stays behind „Zobrazit sezónní odhad"; a seasonal result only changes the headline and appends the season to line 3.

Methodology drawer under the section (`calc_disclaimer_toggle`) keeps the existing text plus one sentence at the start: „Tržní data: realizované ceny a obsazenost krátkodobých pronájmů za 12 měsíců do 7/2026, podle okresu, čtvrti a počtu ložnic." `calc_disclaimer_short` stays visible.

## 4. Form: fields and requirements

Header unchanged: „Podíváme se na váš byt." + „Pošlete adresu a dispozici. Do 24 hodin od nás máte propočet pro váš konkrétní byt."

Result echo (rendered only when a calculator snapshot exists; replaces today's raw-id line):
„Z kalkulačky: Praha 1 · Staré Město · 2+kk · kolem 63 m² · ~63 000 Kč / měsíc" + link „Upravit v kalkulačce" → `#kalkulacka`. Labels from `locLabel`, `ctvrtiOf(loc).label`, the dispozice label and the bucket's representative m²; the amount is `owner_high` rounded to thousands exactly as the card shows it. No band, no ratio.

Fields, in order:

| # | Field | Required | Notes |
|---|---|---|---|
| 1 | Jméno | yes | unchanged |
| 2 | Telefon | yes | helper under the field: „Na tohle číslo se ozveme s propočtem." (new, states the reason) |
| 3 | E-mail | no | unchanged; stays required only when the contact preference in the drawer is E-mail (existing rule) |
| 4 | Ulice a číslo bytu | no | helper: „Adresa zpřesní propočet." |
| 5 | Byt je teď | yes | moves out of the drawer as four chips in one row: „pronajatý dlouhodobě" · „na Airbnb / Booking (řeším sám/sama)" · „prázdný nebo v rekonstrukci" · „teprve ho kupuji" (existing options) |
| 6 | Zpráva / odkaz na byt | no | unchanged placeholder („Odkaz na inzerát, fotky nebo pár vět o bytě…"); the calculator no longer writes „Z kalkulačky: 2+kk 63 m²." into it (the echo line carries that) |
| 7 | Drawer „Doplnit další podrobnosti" | – | Jak vás máme kontaktovat (Zavolat / WhatsApp / Zalo / E-mail), Lokalita (prefilled), Dispozice (prefilled), Kolik bytů řešíte (1 / 2 až 4 / 5 až 9 / 10 a více). „Měsíční zálohy na energie" removed from the form; it is asked during underwriting (§9) |
| 8 | Souhlas se zpracováním osobních údajů | yes | unchanged |
| 9 | Submit | – | label „Poslat byt k výpočtu"; under it „Zdarma a nezávazně." and „Raději po telefonu? +420 727 952 459" (unchanged) |

Visible interactions for a calculator visitor: name, phone, one status tap, consent, submit. Everything the calculator already knows is shown, not asked.

Lead payload on submit (both destinations):

- E-mail (`templateData.message`, since the template has fixed fields): first line „Kalkulačka: Praha 1 · Staré Město · 2+kk · kolem 63 m² · ~63 000 Kč/měs · 2,0× nájem 32 000 Kč · +373 000 Kč/rok · pásmo: strong · model 2026-09-07.1", then the owner's message, then „Počet bytů: …" as today. Weak leads say „pásmo: weak", unsupported „pásmo: unsupported", no snapshot „pásmo: none".
- Portal (`web_inquiries`): existing `calc_model_version`, `calc_inputs`, `calc_result` plus `result_band`, `ratio`, `annual_delta`, `derived` inside `calc_result`, and the human-readable labels inside `calc_inputs`. (Adding top-level columns is portal work; putting them inside the existing JSON needs no migration.)

## 5. Post-submit state (exact)

Replaces the form body; one state for all bands (the band decides what the team does, §7):

Title: „Díky, byt máme."
Text: „Do 24 hodin se ozveme s propočtem pro váš byt: realizované ceny ve vaší čtvrti, odhad pro vaši dispozici a stav, a co by u vašeho bytu rozhodovalo. Pokud byt do správy vezmeme, dostanete i písemné roční minimum, ještě před podpisem."
Line: „Chcete termín hned? Zavolejte +420 727 952 459."
Under it the echo line from §4 stays visible („Z kalkulačky: …") so the visitor sees what was sent.

Facts used: `contact_success` (24 h), `step2_desc` (propočet z realizovaných cen), `faq18` and `g_step2` (minimum after assessment, before signing). Nothing new is promised.

## 6. Delete / compress / move

Delete (page and copy that no longer renders; keys may stay in `translations.ts`):

- Standalone Garance section: the two illustrative numbers (`g_num1_*`, `g_num2_*`), `g_num_note`, the section CTA. Its title, `g_desc` and the three steps move into Ceník (below).
- `PortalDemo` and `portal_note` from the main page (the demo stays in the repo for `/portal` and the VI page decision).
- `pr1_note` (restates `pricing_desc`).
- `about_p5`.
- Srovnání row `comp4` („Přehled plateb").
- Jak začít CTA button (`process_cta`); `process_season` stays.
- The calculator's separate LTR block and the „→ přibližně … více" line (folded into card line 2).
- The calculator-written sentence in the message field („Z kalkulačky: 2+kk 63 m²."), replaced by the echo line.
- Form field „Měsíční zálohy na energie".
- Sticky bar label „Napsat nám"; nav label „Napsat nám".

Compress:

- Ceník: headline `pricing_split1`, `pricing_split2`, `pricing_desc`, money flow, then the Garance row expanded to: `pr6_name` „Garance výnosu · v odměně", `g_desc` as the row text („Než byt převezmeme, písemně si stanovíme minimální roční výsledek pro majitele."), the three steps `g_step1..3` as three short lines, then `pr7` row, drawer, `pricing_foot`. Result: one section says price and guarantee once.
- Srovnání: `whyBetter_desc` lead, 3 rows, `faq13` paragraph.
- Služby: spacing only; copy unchanged.
- Vyúčtování: `report_*` statement block + `portal_title`, `portal_desc`, `portal_open`, `portal_open_note`.
- Kdo jsme: `about_title`, `about_p1`, `about_p4`, quote + signature.

Move:

- Srovnání, Služby+recenze, Vyúčtování, Kdo jsme go below the form (order in §1).
- `faq9` into FAQ group „Peníze", first position.
- „Zdarma a nezávazně" stays only under the submit button and in `final_desc`; the copies in the portfolio „Tady může být váš byt" card and the unsupported/oversized card texts are shortened to „Nezávazně." (the unsupported texts keep „Zdarma a nezávazně" if you prefer; it is the honest close state).
- „do 24 hodin" stays in `hero_extra`, `step2_desc`, form header, success state, `final_desc`, and the unsupported/oversized card texts.

CTA labels, final set (one verb family):

| Place | Label |
|---|---|
| Hero | „Zjistit potenciál bytu" (unchanged) |
| Card, strong/viable | „Chci výpočet pro svůj byt" |
| Card, weak | „Poslat byt k posouzení" |
| Card, unsupported/oversized | „Poslat byt k výpočtu" |
| Nav, sticky (outside calculator) | „Poslat byt" |
| Sticky inside calculator with a result | „~63 000 Kč / měsíc · Chci výpočet pro svůj byt" |
| Ceník end, Final CTA | „Poslat byt k výpočtu" |
| Form submit | „Poslat byt k výpočtu" |
| Portfolio expanded grid card | „Tady může být váš byt" (unchanged) |

Optional test, not default: `hero_extra` „Podílíme se na výsledku · nezávazně · ozveme se do 24 hodin" → „Podílíme se na výsledku · data pro 13 pražských čtvrtí" (13 = the čtvrti in `MARKET_CTVRT`). It swaps one repeated promise for the micro-market proof; it adds no words.

## 7. Internal lead scoring and sales action by band

Computed at submit and stored with the lead (§4): `result_band`, `ratio`, `annual_delta`, `owner_low`, `owner_high`, `ltr_month`, `derived`, `season`, `model_version`, plus the form's `status`, `units`, `contact_pref`, and whether a link or photos were included.

Priority adjustments (applied by the person reading the lead, not by the site):

- `units` ≥ „2 až 4 byty": one tier up (a viable multi-flat owner is handled as strong).
- `status` = „na Airbnb / Booking (řeším sám/sama)": one tier up for speed (already STR-ready, fastest onboarding).
- Weak lead whose message names a feature (terasa, výhled, kapacita, rekonstrukce, patro) or includes a listing link: handle as viable.
- `derived` = true: numbers are less certain in both directions; no tier change, but the underwriting sheet is mandatory before quoting anything.
- `status` = „teprve ho kupuji": no tier change; the deck adds a „which flat to buy" page only if asked.

Sales action:

| Band | First contact | Deadline | What is prepared before contact | Goal of the contact |
|---|---|---|---|---|
| strong | phone call | same working day (≤ 4 h in working hours) | underwriting sheet (§9) from the snapshot; deck pages 1–3 drafted | prohlídka date; missing inputs (m², stav, kapacita, patro, SVJ) |
| viable | e-mail with the propočet, then call | ≤ 24 h | underwriting sheet; propočet e-mail = deck pages 2–4 in short | confirm stav/kapacita; agree whether a deck is worth it |
| weak | e-mail only | ≤ 24 h | none | honest note: the result, the `faq13` sentence, invitation to send photos or a link if the flat has something extra; no call unless they reply |
| unsupported / oversized | e-mail with a manual propočet | ≤ 24 h (promised on the card) | manual comparables | treat as viable until numbers exist |
| none (no snapshot) | e-mail asking for lokalita and dispozice, or run the calculator internally from the form fields | ≤ 24 h | – | treat as viable |

Lead status lifecycle to record in the portal (one field, five values, moved by hand until it hurts): `new` → `contacted` → `analysis_sent` → `deck_sent` → `meeting` → `contract` / `declined`. The band never changes after submit; the status does.

## 8. Tracking events (mandatory before traffic)

Prerequisite: `GA_MEASUREMENT_ID` set (Consent Mode and the banner already exist). Because GA fires only after consent, the portal row is the source of truth for leads and band mix; GA measures the top of the funnel. Optional first-party addition (P1): an anon-insert `web_events` table for `calc_result` and `lead_submit` so band mix is measured regardless of consent.

| Event | When | Params |
|---|---|---|
| `calc_start` | first change of any input | – |
| `calc_location` | district or čtvrť chosen | `district`, `ctvrt` („-" = Ostatní, „?" = not chosen) |
| `calc_result` | every result change, debounced 500 ms | `district`, `ctvrt`, `size`, `bucket`, `season`, `band` (strong/viable/weak/unsupported/oversized), `derived`, `ratio_rounded` (0,1 steps), `model_version` |
| `cta_click` | existing | existing params + `band` |
| `form_start` | first focus in the form | `from_calc` (bool), `band` |
| `lead_submit` | existing, after a successful send | existing + `band`, `ratio_rounded`, `district`, `ctvrt`, `size`, `status`, `units`, `from_calc` |
| `lead_error` | on `sendError` | `band` |
| `calc_share` | existing | existing + `band` |

Offline stages (portal status field, §7): `contacted`, `analysis_sent`, `deck_sent`, `meeting`, `contract`, `declined`, each with the band.

KPIs, read weekly: visits → `calc_start` % → `calc_result` % → band mix of results → `cta_click` % by band → `form_start` → `lead_submit` % by band → contacted within SLA % by band → analysis_sent → deck_sent → meeting → contract, all by band. Data-quality KPIs: share of leads with a snapshot, share with `status` filled, weak leads that were called (target ≈ 0), median time to first contact.

## 9. Public calculator → underwriting → pitch deck handoff

Three layers, one source of numbers (`ownerMonthly` under the pinned `model_version`):

| Layer | Data | Where |
|---|---|---|
| Public card | `high` only, ADR + period, LTR, ratio, annual delta, season, derived flag, bucket, band line | site |
| Lead | everything in `calcPayload` + `result_band`, `ratio`, `annual_delta`, `derived`, human-readable labels, form fields | e-mail body + `web_inquiries` |
| Underwriting sheet | regenerated from the lead with the same `model_version`: `low / mid / high`, `grossMarket`, `grossAntam`, market occupancy, ADR, operator factor, blend weight `w`, base/next band, čtvrť used, `nMean`/`nMin`, seasonal factors, rent čtvrť factor; plus human inputs collected in the first contact: exact m², stav, kapacita (lůžka), patro / výtah, terasa / výhled, SVJ stance, current status, units, energie zálohy; derived: guarantee floor = LTR(exact m², čtvrť) + energie, setup 25 000 Kč, furnishing estimate (100 000 Kč per room if empty, at cost), 5-year view (existing `HorizonSection` logic, unmounted publicly) | internal script, P2 |
| Deck | 9 pages (audit §I): váš byt · co se ve vaší čtvrti prodává · kde v tom stojí váš byt · tři scénáře · písemné minimum · tok peněz na vašich číslech · prvních 90 dní · co zůstává vaše · další krok | sent to the owner |

Rules of the handoff: the deck states the model version and the data window; the deck's „high" scenario equals the number the owner saw on the card, and the deck explains that the public number was the top of the range; nothing public may show `low`/`mid`, occupancy split, capacity or another owner's non-public details; the energy question moves from the form to the underwriting call; a lead without a snapshot is run through the same model from its form fields before anything is quoted.

## 10. Minimal implementation plan, ranked by conversion impact

| # | Change | Why first | Size | Touches |
|---|---|---|---|---|
| 1 | Tracking on: GA ID, `calc_result` with band, `band` on `cta_click` / `lead_submit`, `form_start` | nothing below can be evaluated without it | S | `analytics.ts`, `CalculatorSection`, `ContactSection` |
| 2 | Lead carries the result: band + numbers in the e-mail body, in `calc_result`, and the human-readable echo line on the form | highest leverage per line of code; fixes the raw-id bug | S | `CalculatorSection` (payload), `ContactSection` |
| 3 | Empty initial state (no district preselected; empty card copy §3d) | removes the Praha 1 anchor for every visitor | S | `CalcContext` default, `CalculatorSection` |
| 4 | Result card rewrite: skeleton + three band lines + derived line + CTA/promise + weak variant + share visibility + data period in card and drawer | the qualification engine itself | M | `CalculatorSection`, `translations.ts` |
| 5 | Page compression and order (§1, §6): Garance into Ceník, PortalDemo out, Srovnání 3 rows, About compressed, sections moved below the form, CTA labels unified, `faq9` rendered, Jak začít button removed | cuts card→form distance by ≈60 % and the page by ≈17 % | M | `Index.tsx`, `PricingSection`, `GaranceSection` (retired), `OwnerReportSection`, `ComparisonSection`, `AboutSection`, `FAQSection`, `Navbar`, `FinalCtaSection`, `translations.ts` |
| 6 | Form: status chips out of the drawer, phone helper, energie removed, submit label, success state | lowers friction where the commitment happens | S | `ContactSection`, `translations.ts` |
| 7 | Mobile: card stays below inputs, scroll-to-card on first result, context-aware sticky bar | mobile is 18,5 screens today and shows two CTAs at once | M | `CalculatorSection`, `StickyMobileCTA`, `index.css` |
| 8 | Guarantee micro-line test on strong/viable cards | a test, measured by `cta_click` by band with/without | S | `CalculatorSection`, `translations.ts` |
| 9 | Portal lead status field; underwriting sheet script; deck template | internal; after the first leads exist | M | portal repo, `scripts/` |

Ordering note: 1–3 can ship together in one patch and are safe to ship before the redesign; 4–6 are the second patch; 7 is a third; 8 goes live only after 1 has data; 9 is not a site change.

What this plan does not touch: `src/lib/yield.ts`, `MARKET_STR`, `MARKET_CTVRT`, `SIZE_RATIO`, `BAND_BLEND`, `SEASONS_BY_LOC`, size buckets, `CALC_MODEL_VERSION`, PriceLabs data or artifacts, the DB `str_market` rows, the MCP tools' numbers. The band thresholds live outside the model (a presentation rule over two payload numbers) and are labelled provisional.

Checks at implementation time (repo rules): `tsc` and `vite build`; Playwright at 320/390/768/1440 in CZ and VI for widows, orphans, overflow, console; every changed fact grepped across `translations.ts`, MCP tools and `make_legal.py`; the same section-height measurement as the audit to confirm the estimates in §1–§2. The VI page inherits the structure; every new Czech sentence in §3–§5 needs a Vietnamese version written and checked in Vuong's voice before the VI page ships.
