# 03 — APIs, queries and logic

The tailor module has no REST routes: the browser talks to Supabase directly
(PostgREST + RPC) with the anon key, gated by the app's cookie session and with
RLS off on tailor tables. “API” here therefore means the Postgres functions
(called with `supabase.rpc`), the table calls, and the typed query functions
that wrap them. Garment `<g>` ∈ `waistcoat | pant | coat | shirt`.

## 1. Postgres functions (RPC)

### Writes

**`create_<g>_order(...) → bigint`** (the new `order_id` = Record No.)

| Parameter | Type | Meaning |
|---|---|---|
| `p_client_no` | text | upper-cased, `A-1` format |
| `p_client_name`, `p_phone_no` | text | client is created or refreshed |
| `p_quantity` | int | ≥ 1 |
| `p_delivery_date` | date | |
| `p_tailoring_amount`, `p_cloth_amount`, `p_shilling_amt`, `p_others_amt`, `p_advance_amt` | numeric | ≥ 0; Others already includes a shirt's button price |
| `p_details` | jsonb | keys = `<g>_details` column names (see below) |
| `p_part_designs` | jsonb | **shirt only**: `[{part_type,size1,size2,design_no}]` |

`p_details` keys: waistcoat `lambai chaati kamar kandha collar hip note gala shoulder` ·
pant `kamar hip lambai pancha gidri goda note paloi pancha_style pocket back_pockets belt_width` ·
coat `lambai chaati kamar hip aasteen teera half_back note gala damn style buttons chaak shoulder` ·
shirt `lambai lambai_2 … daman daman_2 note bain_gala bain_design_no collar_type collar_design_no button_type style_flags`.

Behaviour: one transaction → `create_garment_order_shell` (client upsert + order
row, totals computed in SQL) → details insert (→ shirt part designs).
Errors: `Quantity must be at least 1`, `Amounts cannot be negative`,
invalid-enum / numeric-cast errors, FK errors for unknown design numbers.

**`create_garment_order_shell(garment, client_no, client_name, phone_no, qty, delivery_date, tailoring, cloth, shilling, others, advance) → bigint`** — shared building block, not called by the app directly.

### Reads

| Function | Returns |
|---|---|
| `get_<g>_order(p_order_id bigint)` | jsonb or `null` |
| `fetch_latest_<g>_order(p_client_no text)` | jsonb or `null` (client’s newest order of this garment) |
| `garment_order_header(order_id)` / `latest_garment_order_id(garment, client_no)` | helpers |

Returned JSON:

```json
{
  "order_id": 41, "client_no": "A-7", "client_name": "Usman", "phone_no": "0300…",
  "quantity": 1, "delivery_date": "2026-11-11", "created_at": "2026-10-27T09:15:00+00:00",
  "tailoring_amount": 3500, "cloth_amount": 0, "shilling_amt": 0, "others_amt": 0,
  "total_amt": 3500, "advance_amt": 500, "balance_amt": 3000,
  "details": { "kamar": 32.5, "paloi": "plain_pant", "belt_width": 1.75, "…": "…" },
  "part_designs": [ { "part_type": "bazu", "size1": "7", "size2": null, "design_no": 3 } ]
}
```
`part_designs` appears for shirt only.

## 2. Table calls used (PostgREST)

| Call | Used for |
|---|---|
| `garment_orders` `DELETE … WHERE order_id = ? AND garment_type = ? RETURNING order_id` | Delete (cascades to details); a 0-row result is reported as an error |
| `garment_base_prices` `SELECT` / `UPSERT ON CONFLICT garment_type` | Settings |
| `clients` search/insert/delete, `record_counter` select, `button_types`, `order_pricing_settings`, RPC `next_client_number` | existing, in `lib/queries/garment-orders.ts` (shared with Shalwar Kameez) |

## 3. Query functions — `lib/queries/garment-order-records.ts`

| Function | Calls | Returns |
|---|---|---|
| `createGarmentOrder(garment, input)` | RPC `create_<g>_order` (adds `p_part_designs` for shirt) | `Promise<number>` Record No. |
| `fetchGarmentOrder(garment, orderId)` | RPC `get_<g>_order` | `GarmentOrderRecord \| null` |
| `fetchLatestGarmentOrder(garment, clientNo)` | RPC `fetch_latest_<g>_order` | `GarmentOrderRecord \| null` |
| `deleteGarmentOrder(garment, orderId)` | table delete | `void` (throws if nothing deleted) |
| `fetchGarmentBasePrices()` | `garment_base_prices` select | `Record<GarmentKey, number>` |
| `updateGarmentBasePrices(prices)` | upsert | `void` |

Reused from `lib/queries/garment-orders.ts`: `searchClients`, `findMatchingClients`,
`addClient` (new optional `orderType`), `deleteClient`, `fetchNextClientNumber`,
`fetchNextRecordNo`, `fetchButtonTypePrices`, `fetchOrderPricingSettings`.

## 4. Query keys — `lib/queries/keys.ts`

New: `garmentBasePrices`, `garmentLatestOrder(garment, clientNo)`.
Reused: `clientByNo`, `nextRecordNo`, `pricingSettings`, `buttonPrices`.

## 5. Pure logic — `lib/garments/*`

| Module | Function | Behaviour |
|---|---|---|
| `registry.ts` | `GARMENTS`, `GARMENT_KEYS`, `isGarmentKey` | the only registration point |
| `form-values.ts` | `createInitialValues(def)` | blank measurements, radio defaults, empty flags/parts |
|  | `serializeDetails(def, values)` | form → details object (numbers/`null`, enum strings, int/decimal casts, flags array) |
|  | `serializePartDesigns(values)` | non-empty part rows → `PartDesignInput[]` |
|  | `valuesFromRecord(def, details, parts)` | saved row → form values; missing columns fall back to defaults |
| `billing.ts` | `computeBilling(def, order, ctx)` | the single billing formula (below) |

Billing formula: `quantity = trunc(qty) || 1`; `tailoring = typed ?? base × quantity`;
`cloth/shilling = typed ?? default`; `others = (showOthersAmt ? typed ?? default : 0) + buttonPrice`;
`total = tailoring + cloth + shilling + others`; `balance = total − advance`.
“typed” means a non-blank box (0 counts).

## 6. Hooks — `hooks/garment-order/*`

| Hook | Responsibility |
|---|---|
| `useGarmentOrderForm(def)` | form state; derived Record No. preview, delivery date, billing; field setters; Save, Search by Record No., Delete (+confirm), Clear, Print, Print Receipt; composes the hooks below |
| `useClientLookup(host)` | Client No. check, name/phone search, match picker, Add Client hand-offs, Prev/Next history with unsaved-change guard; talks to the form only through the `ClientLookupHost` interface |
| `useGarmentBasePrices()` / `useUpdateGarmentBasePrices()` | Settings read/write of `garment_base_prices` (cache written on success) |
| `useStatusMessage()` | toast message state with stable `flash`/`dismiss` |

Save flow: validate → `createMutation` (RPC) → set Record No. + enable Delete →
`registerClient` (history) → invalidate `garmentLatestOrder`, `clientByNo`,
`nextRecordNo`.
Open-by-record flow: `fetchGarmentOrder` → (shirt) subtract the record’s button
price from stored Others Amt so `computeBilling` does not add it twice → fill
every field → `registerClient`.
Delete flow: confirm → `deleteGarmentOrder` → drop the client’s latest-order
cache → `clearForm("Record N deleted.")`.

## 7. Printing — `lib/utils`

| Module | Function | Output |
|---|---|---|
| `garment-order-sheet.ts` | `buildGarmentOrderSheetHtml(data)` / `printGarmentOrderSheetHtml(html)` | generated A5 sheet from the garment definition (measurements incl. pairs, selected options + design #, flags, button type, part designs with images, note, amounts) |
| `receipt.ts` | `buildReceiptHtml(data)` (extended with optional `garmentLabel`, `quantityLabel`, `showOthersAmt`) | 80 mm receipt |
| `html.ts` | `escapeHtml` | shared escaping |
| `number-input.ts` | `toAmount`, `amountOrDefault`, `toNullable*`, `numberToInput` | string-input conversions |

## 8. Route

`app/tailor/orders/[garment]/page.tsx` — `generateStaticParams` over
`GARMENT_KEYS`; unknown values → `notFound()`; renders
`<GarmentOrderForm definition={GARMENTS[garment]} />`.
