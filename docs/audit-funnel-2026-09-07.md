# Antam Homes: calculator + website conversion audit (read-only)

Date: 7. 9. 2026 · Repo state: `5d70a2d` (HEAD, 7 commits ahead of `origin/main`) · Model: `CALC_MODEL_VERSION = "2026-09-07.1"`
Status: **audit only, nothing edited.** Every recommendation below waits for approval.

## 0. What was inspected and how

Evidence base (all read-only):

- Source: `src/pages/Index.tsx` (section order), every mounted section component, `src/i18n/translations.ts` (cs block), `src/contexts/CalcContext.tsx`, `src/lib/analytics.ts`, `src/lib/inquiry.ts`, `src/lib/portalLead.ts`, `src/lib/siteLock.ts`, `src/lib/mcp/tools/*.ts` (fact consistency only).
- Rendered page: the `dist/` build on the Mac (built 18:20 today from HEAD) served locally in the sandbox and rendered with Chromium at 1440×900 (desktop) and 390×844 (mobile, DPR 2). The lock was bypassed by setting the session key the site itself uses; no file was changed. Live antamhomes.com was not used (password-locked, `SITE_LOCK_ENABLED = true`).
- Calculator population: the regression baseline after Bubeneč (2 368 rows = every district × čtvrť × dispozice × size bucket × season). For the distribution below it is reduced to the **312 unique public year combinations** (supported, not oversized, the duplicate „Ostatní" rows removed). A throwaway vitest run listed which of them carry `derived: true` (temp test file created and removed, nothing committed).
- Lead pipeline: `web_inquiries` in the portal project holds **0 rows** (site is pre-launch), so there is no conversion data anywhere. `GA_MEASUREMENT_ID` is an empty string, so no event has ever fired. All funnel numbers in this audit are therefore structural measurements, not observed behaviour.
- Not audited separately: the Vietnamese page (same components, different copy) and the `/portal` app.

Measured page geometry (rendered, CZ):

| | Desktop 1440 | Mobile 390 |
|---|---|---|
| Page height | 13 030 px = 14,5 viewports | 15 608 px = 18,5 viewports |
| Rendered words (incl. closed FAQ answers, excl. `<details>` drawers) | ≈2 050 | ≈1 920 |
| Calculator section starts at | 1 936 px (2,2 viewports down) | 1 889 px (2,2 viewports) |
| Contact form starts at | 10 547 px (81 % of the page) | 12 723 px (82 %) |
| Distance result card → form | ≈8 000 px (card top → form top), 7 sections | ≈10 000 px, 7 sections |
| Links to `#kontakt` | 7 (nav, calc card, garance, jak začít, final, footer, + mobile sticky) | same |
| Distinct labels on those links | 5: „Napsat nám", „Chci přesnější propočet", „Poslat nám byt" (×3), „Chci propočet pro svůj byt" (submit), „Kontakt" (menu) | same |
| Horizontal overflow | none | none (390 px) |
| Console errors / failed requests | 0 | 0 |

Section heights (px, desktop / mobile): Hero 780/894 · Výsledky 1 156/994 · Kalkulačka 1 202/1 643 · Srovnání 951/1 156 · Ceník 1 303/1 332 · Garance 887/1 179 · Služby+recenze 1 115/1 625 · Vyúčtování+Portál 1 844/2 283 · Kdo jsme 595/722 · Jak začít 714/893 · Kontakt 1 177/1 121 · FAQ 553/599 · Final 281/289 · Footer 474/876.

---

## A. Current funnel map

```
Hero  „Nemovitost vám má přidávat příjem. Ne další práci."
  │   1 CTA: „Zjistit potenciál bytu" → #kalkulacka   (stats 11 · 520+)
  ▼
Výsledky (portfolio)  one featured real flat, 64 000 Kč, 96 % obsazenost vs trh 75 %
  │   no CTA; „Zobrazit další výsledky" + method drawer
  ▼
Kalkulačka  inputs: okres → (čtvrť) → dispozice → velikost → [sezóna]
  │   card: ~high Kč / měsíc · +Kč ročně · ADR line · inputs line · LTR · násobek
  │   CTA „Chci přesnější propočet" → #kontakt (jumps ≈8 000 px, prefills form)
  │   share link (WhatsApp / Zalo)
  ▼   ← the scroll path continues here; the CTA path skips everything until Kontakt
Srovnání  4-row ledger LTR vs Antam + honest disqualifier (faq13)
Ceník     70/30, money flow on 90 000 Kč, garance + krytí škod „v odměně", drawer with one-offs
Garance   illustrative 28 000 vs 31 500 Kč, 3 steps, CTA „Poslat nám byt"
Služby    6 items (dark) + 520 reviews + 3 guest quotes
Vyúčtování + Portál   portal hero + interactive demo + „Otevřít portál" + real statement (byt 402)
Kdo jsme  founder quote + 2 paragraphs
Jak začít 4 steps + CTA „Poslat nám byt" + December 1,5× line
  ▼
Kontakt   Jméno* · Telefon* · E-mail · Ulice · [Z kalkulačky: …] · drawer (pref, lokalita, dispozice, stav, počet bytů, energie) · Zpráva · souhlas* · „Chci propočet pro svůj byt"
  │   → e-mail to antamhomes@gmail.com (name, phone, email, address, size, status, pref, message)
  │   → portal mirror (same + calc_model_version, calc_inputs, calc_result)   ← the calc numbers reach ONLY the portal, not the e-mail
  ▼
FAQ (8 questions) → Final CTA „Poslat nám byt" → Footer
Mobile only: sticky „Napsat nám" bar from 60 % of the first viewport, hidden while #kontakt is on screen.
```

Three ways a visitor reaches the form: (1) calculator CTA with prefill (the intended path), (2) any „Poslat nám byt" / „Napsat nám" link (no prefill, no calc snapshot unless the calculator was used earlier), (3) scrolling. Off-site handoff after submit: e-mail inbox → manual reply within 24 h. No calendar, no auto-reply with content, no lead scoring.

---

## B. Biggest blockers, ranked

1. **Zero measurement.** `GA_MEASUREMENT_ID = ""` disables analytics and the cookie banner; `trackEvent` is a no-op. The events already coded (`cta_click` ×7 places, `lead_submit`, `calc_share`) never fire. There is also no `calc_result` event, so even with GA on you would not know which districts, čtvrti, sizes or result bands people look at. You cannot run any of the tests below without this.
2. **The calculator does not qualify.** The result card is identical at 1,2× and 2,0×: same gold „+61 000 Kč ročně navíc", same „→ přibližně 1,2× více", same CTA. Only 2 of the 312 unique supported year combinations (rounded ratio ≤ 1,0) get a different sentence. The lead payload carries `owner_high` and `ltr_month` but no band, and the **e-mail template never receives the calculator result at all** (only the message line „Z kalkulačky: 2+kk 63 m²"); the numbers go to the portal mirror only. So neither the visitor nor the person reading the inbox sees the flat's strength.
3. **The first number the visitor sees is Praha 1's.** Default state is `praha1 · 2kk · bucket l (63 m²)` → „~57 000 Kč / měsíc · +298 000 Kč ročně" renders before any click, on desktop and (card-first) on mobile. A Praha 6 owner then watches their number fall to about 30 000. The strongest district anchors every visitor and the number never feels earned.
4. **Result and commitment are ≈8 000 px apart, and the form forgets the number.** The card CTA jumps over 7 sections straight to Kontakt; the form shows „Z kalkulačky: praha1 · stare_mesto · Větší (56–80 m²)" (raw ids, a bug in `calcSummary`) and never restates the ~63 000 Kč the visitor just saw. The scroll path instead passes ≈1 100 words and the longest section on the page (Vyúčtování+Portál, 1 844 px) before the form.
5. **Page length and repetition.** 14,5 / 18,5 viewports. The same flat is shown three times with the same money (portfolio 64 000, portal demo 63 927, statement 63 927). „Do 24 hodin" lives in 8 copy keys (4 visible on a normal scroll), „Zdarma a nezávazně" in 5, the 30 % explanation in about 10 keys plus the portfolio and statement notes, „energie hradí majitel" in 7, „Poslat nám byt" is rendered 3×. Each is consistent, but together they read as insistence.
6. **The trust minimum is missing from the card itself.** The data window (12 closed months to 7/2026) is stated in the MCP tool and in the portfolio drawer but nowhere in the public calculator, not even in the methodology drawer. Sample size is only ever surfaced negatively (the derived note), and that note appears on 126 of 312 supported year combinations (40 %: 3kk in P3, P4, P6, P7, P8, P9, P10; 2kk in P9; 4kk everywhere except P1) with wording that blames „čtvrť" even when no čtvrť was chosen.
7. **CTA language undermines the number.** „Chci přesnější propočet" tells the visitor the number they just got is imprecise instead of naming the next problem (their specific flat). Nav and sticky say „Napsat nám", three sections say „Poslat nám byt", submit says „Chci propočet pro svůj byt". Five names for one action.
8. **After submit, nothing.** Success = one sentence. No description of what the propočet contains, who calls, when, or a way to pick a slot. The hottest lead of the day is left with an inbox.
9. **Guarantee is illustrated with someone else's numbers** (28 000 → 31 500 for „2+kk v centru") while the calculator already knows the visitor's LTR. The rule (minimum = nájem + energie) is the strongest sentence in the offer and is not on the card.
10. **No owner-side proof.** Guest reviews prove operations; nothing on the page is said by an owner. (Do not invent one; see H/Part 10.)

Smaller defects found on the way: sticky mobile bar and the card CTA are both visible while the result is on screen (two labels, one destination); `faq9` („Je částka v kalkulačce před, nebo po vaší provizi?") is written but not rendered anywhere; `calc_terms_note`, `calc_excluded_note`, `calc_method_note`, `calc_teaser_1` are dead keys; MCP `list-portfolio` says long-term rent comes from Deloitte while the site says Sreality median (cross-checked against Deloitte); the skill reference file still says 25 % and 6 months' notice while site, FAQ, MCP and Ceník all say 30 % and 4 months (the site is consistent; the reference is stale and should be corrected so a future patch does not reintroduce 25 %).

---

## C. Delete / compress list (Part 1 + Part 2)

Classification per section. „Needed before conversion" = a qualified owner needs it before sending the flat.

| Section | Question it answers | Works? | Needed before conversion | Verdict |
|---|---|---|---|---|
| Navbar | where am I, how do I contact | yes | – | KEEP; TEST CTA label (see G) |
| Hero | what is this, for whom | yes (one CTA, no adjectives) | yes | KEEP. TEST adding the micro-market proof to `hero_extra` („data pro 13 pražských čtvrtí") |
| Výsledky | do they actually deliver | yes, strongest proof on the page | yes | KEEP composition. COMPRESS nothing; it is already one flat + drawer |
| Kalkulačka | how much can MY flat make | partly (see E, H) | yes | KEEP, rework the card and default state |
| Srovnání | is the extra work worth it vs nájem | yes but long (951 px) | no | COMPRESS to 3 rows, keep the disqualifier paragraph (it is qualification copy) |
| Ceník | what do you take | yes, transparent | yes | KEEP; COMPRESS `pr1_note` (repeats `pricing_desc`) |
| Garance | what if it does not work | partly (illustrative numbers) | yes | COMPRESS: rule sentence + 3 steps; MOVE the two numbers out or TEST using the visitor's LTR |
| Služby + recenze | what do you do every day | yes | no | COMPRESS spacing (1 115 px for 6 sentences); KEEP reviews here |
| Vyúčtování + Portál | will I see my money / keep control | yes but 3× the same flat, 1 844 px | no | COMPRESS hard: keep the real statement, collapse the interactive demo behind „Ukázat portál" or a static screenshot; DELETE the second copy of the 63 927 story |
| Kdo jsme | who are you | yes | no | COMPRESS to quote + `about_p1` + `about_p4`; DELETE `about_p5` (says what Služby already showed) |
| Jak začít | what happens after I send the flat | yes, and it is placed right before the form | yes | KEEP; MOVE step 2's promise („do 24 hodin propočet z realizovaných cen srovnatelných bytů") into the form header and the success state |
| Kontakt | send the flat | yes with friction (see Part 7) | yes | KEEP, fix |
| FAQ | objections | yes | no | KEEP after the form; ADD `faq9` (the calculator-fee question) |
| Final CTA | last push | yes | – | KEEP |
| StickyMobileCTA | reach the form | competes with the card | – | TEST: hide while `.calc-result` is in view; align the label |
| HorizonSection (unmounted) | 5-year view | – | no | keep unmounted publicly, reuse in the deck (Part 9) |

Repeated claims to thin out: „do 24 hodin" keep in hero_extra, step 2, form header, success; „Zdarma a nezávazně" keep once near the form; 30 % explanation keep in card sub-line + Ceník + faq; „energie hradí majitel" keep in Ceník foot + faq6 + methodology.

Defensive copy that interrupts momentum: `calc_derived_note` under the headline (negative, 40 % of results); `g_num_note` under the guarantee numbers („Ilustrační příklad…"); `portal_note` („Ukázka s vymyšlenými byty a hosty…" next to real numbers, a mixed message); `pr1_note` restating the 90 000 example. Methodology drawers (calculator, portfolio) are correctly collapsed; the calculator drawer is missing the one fact that matters (data window).

Desktop vs mobile: desktop puts inputs left and the sticky card right, so the number is visible while editing; mobile puts the card above the inputs when a number exists, so the visitor edits blind below the card and scrolls back up to see the change (1 643 px section). Mobile also shows two CTAs at once (card + sticky). Mobile FAQ shows 5 of 8; Portfolio grid is hidden behind a link on both; the Vyúčtování section is 2 283 px on mobile, 2,7 screens of a document and a demo.

**The 2–3 minute question.** Understand the offer: yes (hero + card sub-line + Ceník headline). Trust it: partly; the proof is real but sits ≈8 000 px from the action, and the card carries no data window or sample. Calculate: yes, 3 taps; but the visitor sees a number before tapping anything. Take the next step: only via the card CTA jump; the form then does not show the number, asks for a phone with no stated reason, and after submit gives one sentence. A determined owner can do it in 2–3 minutes; a cautious one scrolls into 1 100 words first. The page is optimised for the reader who reads everything; the calculator path is optimised for nobody in particular.

---

## D. What is missing

- A result state that differs by strength (A/B/C) and a matching CTA.
- The data window and a positive sample signal on the card.
- The visitor's number on the form and in the e-mail the team reads.
- A stated reason for the phone field („zavoláme vám s propočtem") and a visible „byt je teď" status.
- A post-submit next step with content (what the propočet contains, when, who).
- A measurement layer (GA on, `calc_result` event, `result_band` in the lead).
- A public teaser of the guarantee rule tied to the visitor's LTR (sentence, not a number).
- Owner-voice proof (to be collected from a real owner, not written).
- A district tie-in on the card where it is true: measured results exist for Praha 1 and Praha 3 only; Praha 4 flats are in the portfolio without numbers yet; no other district has a managed flat on the page.
- An internal underwriting sheet generated from the same `ownerMonthly` trace as the public card (Part 8).

---

## E. Result card audit (Part 4), desktop + mobile

Current order on the card (supported state): eyebrow „Potenciál příjmu s Antam Homes" → sub-line „měsíčně · po provizi platformy a odměně Antam 30 %" → **~63 000 Kč / měsíc** → „+373 000 Kč ročně navíc oproti dlouhodobému pronájmu" → [derived note] → „Reálná cena za noc v okolí (2 ložnice): 4 867 Kč" → „Praha 1 · Staré Město · Celý rok · Upravit" → rule → „Dlouhodobý pronájem ~32 000 Kč pro 2+kk kolem 63 m² (medián nabídek Sreality)" → „→ přibližně 2× více" → CTA → share link. Methodology sits outside the card, 600 px lower.

The five instant questions:

| Question | Answered? | Where | Note |
|---|---|---|---|
| How much per month | yes | headline | good size on both viewports |
| More than my rent | yes, twice | +Kč/yr under headline, ratio under LTR block | the two facts are separated by the ADR line and the inputs line; the multiple is the stronger proof for this audience and sits last |
| Is this MY flat | half | inputs line | „kolem 63 m²" after choosing a bucket reads as an assumption; default state is not theirs at all |
| Can I trust it | weak | derived note (negative), ADR line | no period, no sample, no source on the card; methodology drawer has no period either |
| What now | weak | „Chci přesnější propočet" | says the number is imprecise, not what the visitor gets |

Hierarchy that the audit recommends (presentation only, same numbers):

Desktop (card right, sticky): 1 headline `~high Kč / měsíc`; 2 one line combining benefit and multiple: „+373 000 Kč ročně, přibližně 2× nájem 32 000 Kč"; 3 inputs line (okres · čtvrť · dispozice · velikost · sezóna · Upravit); 4 one trust line: „Realizované ceny Staré Město, 2 ložnice: 4 867 Kč/noc · 12 měsíců do 7/2026"; 5 CTA with a one-line promise under it („Do 24 hodin propočet pro vaši adresu a půdorys"); 6 share link; 7 derived note only when present, moved below the trust line, reworded (see below). The separate LTR block disappears into line 2.

Mobile (card first when a number exists): same order, headline one size smaller than now at 360 px, lines 2 and 4 wrap to two lines max. Hide the sticky bar while the card is on screen. Keep the inputs below the card (already so), but add a one-tap „Upravit" that scrolls to inputs (exists) and, after a change, scroll the card back into view (does not happen today).

Belongs on the primary card: monthly amount, annual delta + multiple, location/size/season line, one trust line with ADR and period, derived flag, CTA. Belongs in the drawer: sources (PriceLabs, Sreality, Deloitte), 17 % platform assumption, 70/30 mechanics, what changes the result, guarantee caveat. The ADR line stays on the card because it is the single line that proves micro-market knowledge; the period must join it.

Derived note: current text „Pro tuhle velikost má čtvrť málo nabídek. Číslo je odvozené z menších bytů ve čtvrti a celopražského poměru mezi velikostmi." is shown also for district-level results (P3 „Ostatní", P4, P6…). Proposed neutral wording (copy, not model): „Pro tuhle velikost je v okolí málo nabídek, číslo vychází z menších bytů a pražského poměru mezi velikostmi. Přesný propočet to zpřesní." One observation for you, not a recommendation: on derived cells the range is widened 1,6× and the public headline is the top of the range, so the shown number rises exactly where confidence is lowest (P3 4kk „Ostatní" high 72 318 vs low 55 905). Whether to headline `high` on derived cells is a presentation decision; this audit does not propose changing the model.

States: unsupported (jinde) and oversized cards are honest and well written; keep. The derived state needs the rewording. The A/B/C states do not exist yet (H).

---

## F. Ideal funnel sequence

Hero → Výsledky (one flat) → Kalkulačka (inputs first, number after the first choice, band-aware card) → Ceník (70/30 + guarantee rule + damages, one section) → Jak začít (four steps, ending in the form) → Kontakt → Srovnání + disqualifier (compressed) → Služby + reviews → Vyúčtování (statement + portal link) → Kdo jsme → FAQ → Final CTA.

Why: after the number the next questions are „what do you take" and „what happens if I send it"; both answers are short and belong before the form. Everything that explains daily work, the portal and the founder is reassurance for the reader who is not yet convinced, and reads better after the form than as a wall before it. Garance folds into Ceník: the rule is one sentence and already sits there as `pr6`. This ordering also shortens the calc→form distance from ≈8 000 px to ≈3 000 px (Ceník + Jak začít between) without deleting content.

If you prefer not to move sections: keep the order and cut Vyúčtování+Portál to one screen; that alone removes ≈1 200 px from the scroll path.

---

## G. Ideal CTA flow (Part 6)

- Hero: keep „Zjistit potenciál bytu" → #kalkulacka. It sends the right people to the calculator and keeps the form for people who already have a number.
- Card, band A and B: **„Chci přesný výpočet pro svůj byt"**. Of your three options this one names the next problem (exact, my flat) without calling the shown number wrong. „Připravit detailní analýzu" is in the agency's voice; „Spočítat přesný potenciál" reuses „potenciál", which is already the card's eyebrow, and reads as „recalculate". Under the button, one line: „Do 24 hodin propočet pro vaši adresu, půdorys a stav bytu."
- Card, band C: secondary style, „Přesto poslat byt k posouzení". No promise line.
- Nav and sticky: „Poslat byt" (short, matches Jak začít and Final). Drop „Napsat nám" as a label for the same action.
- Garance / Jak začít / Final: „Poslat byt k přesnému výpočtu".
- Submit: „Poslat byt k přesnému výpočtu" so the button says the same thing the visitor clicked on the card.
- After submit (replaces the single sentence): „Díky. Do 24 hodin vám zavoláme / napíšeme s propočtem pro váš byt: realizované ceny ve vaší čtvrti, odhad pro vaši dispozici a stav, a písemné minimum, které bychom vám dali do smlouvy. Chcete termín hned? +420 727 952 459." Only facts already promised elsewhere on the page; no new claims.

---

## H. Qualification strategy (Part 3, Part 5, Part 10, Part 11, Part 13)

### Result distribution in the current public population

Season = year, supported, not oversized, 312 unique okres/čtvrť × dispozice × bucket combinations, unweighted by traffic (there is no traffic data). Ratio = `high / ltr`, the same two numbers the card shows.

| | ratio high/ltr | annual delta (high − ltr) × 12 |
|---|---|---|
| p10 | 1,23× | 73 000 Kč |
| p25 | 1,35× | 111 000 Kč |
| median | 1,53× | 168 000 Kč |
| p75 | 1,75× | 278 000 Kč |
| p90 | 1,96× | 421 000 Kč |
| max | 2,54× | |

Only 1 combination is below 1,0× and 2 get the „nájem vychází podobně nebo výše" sentence. Everything else gets the gold benefit line.

By district (median, share ≥ 1,5×, share < 1,3×): P1 1,88× / 97 % / 0 % · P2 1,76× / 89 % / 3 % · P8 1,67× / 86 % / 0 % · P3 1,62× / 75 % / 0 % · P5 1,54× / 61 % / 6 % · P9 1,44× / 21 % / 17 % · P10 1,42× / 17 % / 17 % · P6 1,27× / 19 % / 64 % · P7 1,26× / 17 % / 71 % · P4 1,22× / 13 % / 71 %.
By size bucket: s 1,67× · m 1,54× · l 1,40× (larger flats in the same čtvrť multiply less because rent scales with m² faster than STR revenue).
By dispozice: 1kk 1,64× · 2kk 1,47× · 3kk 1,51× · 4kk 1,74×.

The default „běžný 2+kk" a visitor gets after choosing only the district: P1 1,86× (+279 k/yr) · P2 1,65× · P8 1,75× · P5 1,58× · P3 1,52× · P9 1,45× · P10 1,43× · P7 1,28× (+90 k) · P6 1,27× (+78 k) · P4 1,22× (+61 k).

### Proposed bands (thresholds are proposals for your decision; they come from the natural breaks above and your own anchors, 1,1× cold, 1,7–2,0× hot)

| Band | Rule (from the two numbers already in the lead payload) | Share of the 312 | Who lands here |
|---|---|---|---|
| A strong | ratio ≥ 1,7× | 29 % (92) | Praha 1 (Staré Město 12/12, Ostatní 11/12, Nové Město 7/12), P2 Nové Město 11/12, the smallest 1+kk in P2, P3, P5, P8, P9, P10 and Bubeneč, 4+kk in P2 and P5 in every bucket and the small 4+kk bucket almost everywhere, half of P8 Ostatní |
| B potential | 1,3× ≤ ratio < 1,7×, or ratio < 1,3× with delta ≥ 100 000 Kč/yr | 54 % (170, of which 18 rescued by the delta clause) | P3, P5, P9, P10, Vinohrady, Žižkov, Smíchov, Košíře, Karlín, Libeň, larger flats in P2/P8, big flats in P6/P7 |
| C weak | ratio < 1,3× and delta < 100 000 Kč/yr | 16 % (50) | P4 (Ostatní 9/12, Nusle 8/12), P6 (Ostatní 6, Dejvice 6, Bubeneč 3), P7 (Ostatní 5, Holešovice 6), plus the largest 1+kk bucket in 14 of 26 čtvrť rows |

The delta clause exists because 18 large flats in P6/P7 have a low multiple but 100–156 k/yr of absolute upside; they are not cold. One known edge: the „Větší" 1+kk bucket falls into C even in P2/P5/P9/P10 because rent grows with m² while the STR band stays 1BR; that is the open 1+kk capacity limitation in `docs/calculator-model.md`, not a signal about the flat, so treat `1kk · l` as B until that item is resolved. The guarantee rule (minimum = nájem + energie) makes the C band the band where your written floor sits closest to the potential, which is exactly the underwriting reason not to chase them.

Traffic will not mirror this table: Prague ownership is concentrated in P4–P10, so the real mix will be heavier in B and C than 29/54/16. Filtering matters more than the unweighted share suggests.

### Per band: card, CTA, ask, internal handling

| | A strong | B potential | C weak |
|---|---|---|---|
| Card emphasis | headline + delta + multiple, gold; trust line; guarantee rule sentence („Písemné minimum je nejméně váš nájem plus energie.") | headline + delta + multiple; one line naming what the exact analysis decides: „Rozhodne stav, kapacita a patro. To spočítáme na vašem bytě." | headline honest; benefit line in neutral colour; sentence: „Rozdíl proti nájmu je u tohoto bytu malý. Krátkodobý pronájem se vyplatí, jen když má byt něco navíc: terasu, výhled, kapacitu pro rodinu. Pokud ano, pošlete nám ho." |
| CTA | „Chci přesný výpočet pro svůj byt" + promise line | same | secondary „Přesto poslat byt k posouzení" |
| Ask for a call | yes, phone required, „zavoláme do 24 hodin" | phone required, „ozveme se do 24 hodin" | phone optional, e-mail enough |
| Offer exact analysis | yes, explicitly | yes | no promise beyond „posoudíme" |
| Share link | keep (owners forward these) | keep | hide |
| Internal | call the same day; deck prepared before the call | 24 h propočet by e-mail, call after | reply with the honest note and the disqualifier; no call unless the message shows a special feature |

Note on „do not flatter": the C card still shows the real number; the change is tone and CTA, not the number.

### Trust minimum (Part 5), present / missing

Present on the page: methodology drawers (calculator, portfolio), „orientační, nikoli nabídka" sentence, real case studies with money and occupancy, 520+ reviews (hero + Služby), guarantee (Ceník, Garance, faq18), 30 % fee stated four ways, exact-analysis promise (unsupported card, form header, step 2).
Missing where it counts (the card): data period, sample signal, guarantee rule, exact-analysis promise. Missing entirely: owner statement.
Fix without new facts: add the period to the card and to `calc_disclaimer`; put the guarantee rule sentence on A/B cards; put the promise line under the CTA; render `faq9`.

### Social proof (Part 10), using existing evidence only

- Owner/revenue proof: the 5 measured portfolio results (64 000 / 57 000 / 50 000 / 42 000 / 30 000 Kč) are the strongest asset on the page. Use one of them on the card when the visitor's district matches: Praha 1 (64 000, 12 months) and Praha 3 (50 000 from 2/2026, 42 000 from 4/2026) only; Praha 4 flats have no numbers yet („V naší správě od 7/2026" is still a true sentence); Mladá Boleslav does not match „jinde". Text: „V Praze 1 spravujeme byt, který majiteli vynáší 64 000 Kč měsíčně (12 měsíců do 7/2026)." Exact numbers from `PortfolioSection.items`, nothing else.
- Operational proof: 520+ reviews and the three quotes work where they are (Služby). Do not move them near the number.
- Local expertise proof: the čtvrť buttons, the ADR line and the season toggle are the proof; say so once in the hero (`hero_extra`: „data pro 13 pražských čtvrtí") and once on the card (period line).
- Owner statement: collect one from a current owner (Museum View or Modern AC). Until it exists, nothing goes on the page.
- The founder quote in Kdo jsme is the only human voice; keep it.

### Guarantee + 30 % positioning (Part 11)

The current Garance headline („Spodní hranice výnosu je daná dopředu.") is right; the illustrative 28 000 / 31 500 is not, because the visitor has just seen their own LTR two sections up. Proposed: keep the rule as the headline sentence, drop the two numbers, keep the three steps, and on A/B cards add the rule sentence. Incentive line in your words, in Czech, accurate to the fee structure (percentage, no monthly fee, guarantee paid from the fee; the one-off 25 000 Kč is disclosed in Ceník): „Naše odměna je podíl, ne paušál. Když byt vydělá málo, vyděláme málo i my, a rozdíl pod garancí jde z naší odměny." Suggested placement: under `pricing_split2` in Ceník, once.

### Hormozi lead-magnet check (Part 13), 0–10

| Principle | Score | Why |
|---|---|---|
| Solves a narrow problem completely | 7 | A number for okres + čtvrť + dispozice + velikost in three taps, no gate. Loses points for the Praha 1 default and for hiding the period. |
| Reveals the next problem naturally | 5 | The next problem (your address, stav, kapacita) is implied by „přesnější", not stated. |
| Makes the next step the obvious solution | 5 | One CTA for all results; the form does not carry the number; no post-submit content. |
| Delivers value before asking | 8 | Real market number, share link, methodology drawer, honest unsupported/oversized states. |
| Demonstrates expertise / differentiation | 6 | Čtvrť-level data, seasons, real ADR. Not said out loud; derived note reads as weakness. |
| Filters instead of flatters | 3 | 2 of 312 combinations get a different message. |

Average 5,7. The three low scores are the same defect: the calculator ends the same way for everyone.

---

## I. Pitch-deck handoff (Part 8 + Part 9)

Public (stays): `high` only, ADR, LTR, multiple, season toggle, derived flag, bucket label, unsupported/oversized close.
Internal only (already computed, never rendered): `low`, `mid`, `grossMarket`, `grossAntam`, occupancy, operator factor, `w` blend weight, `nMean`/`nMin`, capacity, exact m², rent čtvrť factor, the 5-year horizon (HorizonSection code), guarantee floor arithmetic, energy, setup and furnishing costs, comparable managed flats.

The lead already carries `model_version`, `district`, `ctvrt`, `dispozice`, `size_bucket_id`, `representative_m2`, `owner_low/high`, `ltr_month`. That is enough to regenerate the internal sheet deterministically from `ownerMonthly` with the same version. Recommended (P2): a script that takes a lead row (or the same inputs plus address, m², stav, kapacita) and prints the underwriting sheet, so the deck and the card can never disagree. This is tooling, not a model change.

Deck structure for the personalised propočet (one page each):

1. Váš byt: adresa, dispozice, m², čtvrť, stav, kapacita (from the call/photos).
2. Co se ve vaší čtvrti opravdu prodává: ADR and occupancy by season for the band, sample size, 12-month window, source. This is the page the public card teases.
3. Kde v tom stojí váš byt: band, capacity, why up or down (patro, výtah, terasa, stav), comparable managed flat in the district if one exists.
4. Tři scénáře: low / mid / high with what drives each (season, ramp-up, reviews, furnishing). Public sees only high.
5. Písemné minimum: your LTR + energie as a number, what happens below it, how blocked nights change it (2/365, 3/365).
6. Tok peněz na vašich číslech: platform payout → cleaning → 70/30, setup 25 000 Kč, furnishing estimate, energy.
7. Prvních 90 dní: the four steps with dates; December factor where relevant.
8. Co zůstává vaše: portál, blokace, 4 měsíce výpověď, kontrola po každém pobytu.
9. Další krok: contract, prohlídka, datum spuštění.

Public teasers that are safe to show now: the card number, the ADR line with period, „Písemné minimum je nejméně váš nájem plus energie", the four steps. Withhold: the range, occupancy split, capacity, the comparable flat's non-public details, the horizon chart.

---

## J. Tracking plan (Part 12)

Prerequisite: set `GA_MEASUREMENT_ID` (banner and Consent Mode are already implemented; nothing loads before consent). Because `trackEvent` is a no-op until consent is granted, GA will undercount; the portal `web_inquiries` table is the lead source of truth, GA is for the top of the funnel. Option for P1: a first-party, cookieless `web_events` insert (anon INSERT only, like `web_inquiries`) for `calc_result` and `lead_submit` so band mix is measured regardless of consent.

Events (name · params):

- `calc_start` · first change of any input (district/ctvrt/size/bucket/season).
- `calc_location` · district, ctvrt (or „-" / „?").
- `calc_result` · district, ctvrt, size, bucket, season, band (A/B/C/unsupported/oversized), derived, ratio rounded to 0,1, model_version. Fire on every result change, debounce 500 ms.
- `cta_click` · already exists (location, target, district, size); add band.
- `form_start` · first focus on a form field; params: from_calc (bool), band.
- `lead_submit` · already exists; add band, ratio, district, ctvrt, size, units, status.
- `lead_error` · on `sendError`.
- Offline (portal or a sheet, by hand until it hurts): `call_booked`, `analysis_created`, `proposal_sent`, `contract_signed`, each keyed to the lead id and band.

Data fields to add to the lead (portal row and e-mail body): `result_band`, `ratio`, `owner_high`, `ltr_month` (the last two already in `calc_result` JSON; surface them in the e-mail text).

Funnel KPIs: visits → calc_start (%) → calc_result (%) → band mix of results (A/B/C share) → cta_click by band (%) → form_start → lead_submit by band (%) → call_booked / lead (%) by band → analysis_created → proposal_sent → contract_signed. Secondary: share of leads with a calc snapshot; share of leads with status filled; median time from lead to first contact; C-band leads that were called anyway (should be near zero).

Qualified-lead economics: with 0 leads and no traffic history nothing can be quantified yet. The structural prior is that A-band combinations are 28 % of the calculator space but a smaller share of real Prague owners; the value of the bands is that a 1,9× P1 lead and a 1,2× P4 lead cost the same to acquire and are worth very different sales effort. Measure for 60 days after launch, then set thresholds from observed contract rates by band instead of the proposals above.

---

## K. Prioritised implementation plan

P0 (before launch, each is small):

1. Turn on measurement: `GA_MEASUREMENT_ID`, `calc_result` event with band, band on `cta_click` and `lead_submit`.
2. Put the calculator result into the lead the team reads: `result_band`, ratio, `owner_high`, `ltr_month` in the e-mail body and as columns/fields in the portal row.
3. Band-aware card (A/B/C) per H: copy, colour of the benefit line, CTA label and style, share link visibility. Thresholds from H, computed from `owner_high / ltr_month`.
4. Default state: no district preselected; card shows a quiet prompt until the first choice (desktop right column, mobile below inputs as the existing order logic already handles).
5. Card trust line with the data period; add the period to `calc_disclaimer`; reword `calc_derived_note`.
6. Form: fix the raw-id summary (`praha1 · stare_mesto` → „Praha 1 · Staré Město"), show the number the visitor saw next to it, move „Byt je teď" out of the drawer as chips, label the phone field with its reason, replace the success sentence with the next-step paragraph (G).
7. CTA labels unified (G).
8. Render `faq9`.

P1 (first two weeks after launch):

9. Compress Vyúčtování+Portál to one screen; compress Srovnání; fold Garance into Ceník with the rule sentence; incentive line in Ceník.
10. District tie-in on the card where a managed flat with a measured result exists (Praha 1, Praha 3).
11. Sticky mobile bar hidden while the card is visible; scroll the card into view after an input change on mobile.
12. Section order per F (or the no-move variant).
13. First-party `web_events` for consent-independent band mix.
14. Ask one current owner for a one-line statement; add only when it exists.

P2 (after 60 days of data):

15. Re-set A/B/C thresholds from observed contract rates by band.
16. Underwriting sheet script from the lead payload (I); deck template in the 9-page structure.
17. Decide on headline choice for derived cells (E, observation) and on `calc_derived_note` calibration items already open in `docs/calculator-model.md` §4; both are model decisions and stay out of this audit.
18. Correct the stale skill reference (25 % / 6 months) so future patches inherit the current facts.

Nothing in P0–P2 changes `yield.ts`, thresholds inside the model, seasons, buckets or data.

---

## Verdict

If 1 000 qualified Prague owners landed on this page tomorrow, the three biggest reasons they would not become a sales conversation:

1. **They would not know the number was theirs, and you would not know it either.** The page hands everyone Praha 1's 57 000 Kč first, treats a 1,2× Praha 4 flat exactly like a 2,0× Staré Město flat, and sends the team an e-mail without the result. The strong owners are not pulled harder, the weak ones are not let go, and nobody is measured.
2. **The distance between the number and the commitment.** The CTA jumps ≈8 000 px into a form that forgets the number, asks for a phone with no reason, and answers with one sentence. Everything that would make the next step obvious (what the propočet contains, the guarantee rule on their own rent, the four steps) is on the page, just not at that moment.
3. **Trust is proven far from where it is needed.** Real results, real statement, 520 reviews and a transparent 30 % all exist, but the card itself carries no data period, no sample, no guarantee sentence and a CTA that calls its own number imprecise. An owner who is „they actually know my micro-market" after the čtvrť button is „maybe" again ten seconds later.
