# 01 — Functional requirements

Scope: the Waistcoat, Pant, Coat and Shirt order sheets of the tailor module.
Users are shop tailors, logged in through `/tailor/login` (`tailor_token`
cookie). Labels are bilingual (Urdu measurement names, English option names) as
in the approved designs.

## 1. Entry points

| ID | Requirement |
|---|---|
| FR-1.1 | `/tailor/categories` shows Waistcoat, Pant, Shirt and Coat as enabled cards linking to `/tailor/orders/waistcoat`, `/pant`, `/shirt`, `/coat`. |
| FR-1.2 | The four routes are protected by the existing `proxy.ts` tailor guard (`/tailor/*`); an unauthenticated request redirects to `/tailor/login`. |
| FR-1.3 | An unknown garment (`/tailor/orders/foo`) returns the 404 page. `/tailor/orders/shalwar-kameez` is unchanged. |
| FR-1.4 | **Exit** returns to `/tailor/categories`. |

## 2. Common sheet layout

Every sheet is the same fixed 1610×770 board, scaled to fit the window, with:
title bar (Urdu name · "<Garment> Measurement & Order Sheet" · Record No.),
client strip, three columns (measurements · style options · part designs +
billing), and an action bar.

## 3. Client strip (all garments)

| ID | Requirement |
|---|---|
| FR-3.1 | **Client No.** has the fixed shape *letter-dash-digits* (`A-1`). Pressing Enter checks it. An existing client loads their name, phone and **their newest order of this garment** into the sheet (measurements, options, flags, part designs, note). A new client number starts a blank sheet. |
| FR-3.2 | **Add** opens the Add Client modal (shared with Shalwar Kameez): suggests the next free number for a chosen letter, warns about matching number/name/phone, can pick an existing client, and can delete a client. A client created here is recorded with `order_type` = the current garment. |
| FR-3.3 | **Client Name** search (magnifier / Enter): substring, case-insensitive. One hit fills the identity; several hits open a picker. Loads identity only. |
| FR-3.4 | **Phone No.** search: exact match. One hit fills identity **and** loads their latest order of this garment; several hits open a picker (a phone can be shared by family members). No hit seeds a blank sheet with that phone. |
| FR-3.5 | **Record No.** shows the next number to be issued until a record is saved or opened. Typing a number and pressing Enter / the magnifier opens that saved order of **this garment** (measurements, options, billing, client). A number belonging to another garment, or not existing, reports "No <garment> record N found." |
| FR-3.6 | **Book Date** defaults to today and is editable. |
| FR-3.7 | **P-Bal** (previous balance) is a free scratch box; it is not stored (same as Shalwar Kameez). |

## 4. Measurements

All values are decimal numbers (up to 999.99), optional.

| Garment | Rows (Urdu) | Boxes per row |
|---|---|---|
| Waistcoat | لمبائی, چھاتی, کمر, کندھا, کالر, ہپ | 1 |
| Pant | کمر, ہپ, لمبائی, پانچہ, گیدری, گوڈا | 1 |
| Coat | لمبائی, چھاتی, کمر, ہپ, آستین, تیرا, بالف بیک | 1 |
| Shirt | لمبائی, چھاتی, بازو, تیرہ, کالر, کمر, دامن | **2** |

A free-text **Note** sits under the measurements on every sheet.
Arrow keys move between boxes (shared keyboard navigation).

## 5. Style options

Single-select rows (one choice each). **Nothing is pre-selected** - every row
starts empty and the tailor fills it; an unanswered row is saved as empty (null).

**Waistcoat**

| Group | Choices |
|---|---|
| Gala | V Gala `v_gala`, Ban Gala `ban_gala`, U Gala `u_gala` |
| Shoulder | Shoulder Down `shoulder_down`, None `none` |

**Pant**

| Group | Choices |
|---|---|
| پلوی (Paloi) | Plain Pant, Single Paloi, Dubble Paloi |
| پانچہ سٹائل (Pancha style) | Plain, Turn, Bell Bottom |
| پاکٹ (Pocket) | Sedha, Cross |
| بیک پاکٹ (Back pocket) | 1, 2 |
| بیلٹ (Belt, inches) | 1", 1.5", 1.75", 2", 2.25" |

**Coat**

| Group | Choices |
|---|---|
| Gala | Ban Gala, Shervani, Gala Band Coat, None |
| Damn | Gol Damn, Sedha Damn |
| Style | Single Breast, Double Breast, None |
| Button | 1, 2, 3 |
| Chaak | Single Chaak, Double Chaak |
| Shoulder | Shoulder Down, None |

**Shirt**

| Group | Choices |
|---|---|
| Checkboxes (row 1) | Nokdar Tera, Chak Asten, Kuf Dubble Kaj, Large Buttons |
| Checkboxes (row 2) | Kaj Patti, Dobat, 5 Btn, No Lbl, 2 Jeb |
| Bain / Gala | Gool Bain, Sida Bain, Half Bain, Gol Gala, None — plus a **Design # (1–3)** dropdown |
| Collar / Cut | Collar, American Cut, English Cut, French Cut, None — plus a **Design # (1–3)** dropdown |
| Button Type | the 9 Shalwar Kameez button types (list beside the amounts) |
| Part designs | four rows — Bazu, Kuf, Button Patti, Jaib — each with Design #, Size 1, Size 2; clicking the Urdu name opens the same image picker as Shalwar Kameez |

## 6. Billing

| ID | Requirement |
|---|---|
| FR-6.1 | Boxes: Quantity (“Suit Qty” on Shirt), Delivery Date, Tailoring Amt, Cloth Amount, Shiling Amt, Others Amt, Total, Advance, Balance. **Pant has no Others Amt box.** |
| FR-6.2 | Quantity blank or invalid counts as 1. |
| FR-6.3 | **Delivery Date** follows *Book Date + turnaround days* (Settings) until the tailor edits it; clearing the box returns to automatic. |
| FR-6.4 | **Tailoring Amt** = the garment's base price (Settings) × quantity, unless the tailor types an amount (typed value, including 0, wins). The box shows the computed value as its placeholder. |
| FR-6.5 | **Cloth / Shiling / Others Amt**: a typed value (including 0) wins; a blank box uses the Settings default (0 = no default). |
| FR-6.6 | **Shirt only:** the picked Button Type's price (Settings) is added to Others Amt; the box shows a “+ Rs N button” hint. |
| FR-6.7 | **Total** = Tailoring + Cloth + Shiling + Others (read-only). **Balance** = Total − Advance (read-only). |
| FR-6.8 | Save is refused if Advance exceeds Total. |

## 7. Actions

| Button | Behaviour |
|---|---|
| **Save** | Requires Client No (valid), Client Name, Phone No; pricing settings must have loaded. Writes the client (created, or name/phone refreshed) + the order + its details in **one transaction**. On success the sheet shows the new Record No., the client joins Prev/Next history, and Delete becomes available. Save always creates a **new record** (it never edits an old one). |
| **Clear** | Resets the sheet to defaults and refreshes the Record No. preview. Prev/Next history is kept. |
| **Prev / Next** | Steps back/forward through clients loaded **this session** (browser-history style), loading each one's latest order. If the sheet has unsaved edits a "Discard unsaved changes?" dialog appears. |
| **Print** | Opens an A5 order sheet (logo, client block, measurements, selected options, part designs, note, amounts) in a print popup. |
| **Print Receipt** | Shows an 80 mm receipt preview (with garment name and quantity label), then prints on confirm. Pant's receipt omits Others Amt. |
| **Delete** | Enabled only while a saved record is on screen (just saved, or opened by Record No./client load). Asks for confirmation, deletes that order and its details, clears the sheet. |
| **Exit** | Back to categories. |

## 8. Settings page additions

A card **“Waistcoat, Pant, Coat & Shirt Tailoring Amt”** edits the four base
prices. Delivery turnaround days, default Cloth/Shiling/Others amounts and
Button Type prices are the existing shared settings and apply to these garments
as well. Saving writes all groups together.

## 9. Non-functional requirements

* **Atomicity** — one RPC per save; any invalid value (bad enum, malformed
  number) rolls the whole save back.
* **Speed** — one request per read (Record No. open, latest-order prefill);
  latest-order lookup is served by a composite index; client and latest-order lookups are cached
  for 5 minutes per session.
* **Consistency** — display, receipt, print and save use the same billing
  function, so they cannot disagree.
* **Isolation** — Shalwar Kameez code paths, tables and functions are untouched
  by the migrations; the shared UI components were only extended with optional
  props.
* **Security model** — unchanged from the tailor module: custom JWT cookie +
  `proxy.ts`, RLS disabled on tailor tables, anon-key browser client. New
  functions are `search_path`-pinned.

## 10. Decisions and assumptions (please confirm)

1. **Shirt Button Type is single-select.** The design draws checkboxes, but the
   Shalwar Kameez model (and per-button pricing) is one button type per order.
   It uses the existing nine button types and prices, not the placeholder labels
   in the design (F.D.S, D.D.S …).
2. **Shirt's second measurement box** has no fixed meaning in the design; it is
   stored as `<name>_2` and left to the tailor (like Shalwar Kameez's two extra
   number boxes).
3. **Total is read-only** on all sheets (the Shirt mock-up showed it editable).
4. **“Search” action button (Shirt mock-up)** is covered by the Record No.
   search in the client strip, which every sheet has.
5. **Design typos normalised:** “Single Bress/Dubble Brest” → Single/Double
   Breast. “Dubble Paloi” is kept as drawn.
6. **Save creates, never updates.** Re-saving an opened record makes a new
   record, exactly as Shalwar Kameez does. Editing a saved record in place is
   out of scope.
7. **Garment base prices** default to the figures in the designs; Waistcoat is 0
   until set in Settings.
8. **Delete** removes the order and details permanently; the global
   `record_counter` is not decremented (Record Nos. are never reused).

## 11. Out of scope

Editing saved orders, P-Bal calculation/persistence, an order list/report
screen, multi-garment (“suit”) orders under one Record No., image catalogs for
waistcoat/pant/coat options, refactoring the Shalwar Kameez hook onto the shared
engine (recommended follow-up — see 04-code-structure.md).
