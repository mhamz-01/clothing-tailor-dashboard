# 04 — Code structure: files and what is inside

Legend: **NEW** added · **MOVED** relocated with `git mv` (content unchanged
unless noted) · **CHANGED** existing file edited.

## Design principles applied

* **Single responsibility** — definitions (data) / conversion (pure functions) /
  data access (queries) / state (hooks) / presentation (components) are separate
  layers; the client-lookup flow is its own hook behind a small interface.
* **Open/closed** — a new garment is a definition file + a registry line + SQL;
  no component, hook or route changes.
* **Liskov / interface segregation** — panels take the slice of the definition
  they render (`measurements`, `options`, `billing`…), not the whole form;
  `useClientLookup` sees the form only through `ClientLookupHost`.
* **Dependency inversion** — hooks and components depend on `GarmentDefinition`
  and typed query functions, never on a specific garment or on Supabase calls.
* **DRY** — one billing function, one serializer, one sheet builder, one route.

## Layers

### Types
| File | Contents |
|---|---|
| `types/garment-form.ts` **NEW** | `GarmentKey`; `GarmentDefinition`, `GarmentMeasurement`, `RadioSection`/`FlagsSection`/`OptionSection`, `OptionChoice`; form shapes `GarmentFormValues`, `GarmentOrderFields`, `GarmentBilling`; persistence shapes `CreateGarmentOrderInput`, `GarmentOrderRecord`, `GarmentBasePrices` |

### Garment definitions (data only) — `lib/garments/`
| File | Contents |
|---|---|
| `waistcoat.ts`, `pant.ts`, `coat.ts`, `shirt.ts` **NEW** | One `GarmentDefinition` each: titles, quantity label, whether Others Amt exists, measurement rows (column + Urdu label [+ second column]), option sections (column, labels, stored values, default, value kind), shirt part-design flag and button-type group |
| `registry.ts` **NEW** | `GARMENTS`, `GARMENT_KEYS`, `isGarmentKey` — the only registration point |
| `form-values.ts` **NEW** | `createInitialValues`, `serializeDetails`, `serializePartDesigns`, `valuesFromRecord` |
| `billing.ts` **NEW** | `parseQuantity`, `computeBilling`, `BillingContext` |

### Data access — `lib/queries/`
| File | Contents |
|---|---|
| `garment-order-records.ts` **NEW** | create / get / fetch-latest / delete order, fetch/update base prices; maps snake_case JSON → `GarmentOrderRecord` |
| `garment-orders.ts` **CHANGED** | `addClient` takes optional `orderType` (default `kameez_shalwar`) |
| `keys.ts` **CHANGED** | + `garmentBasePrices`, `garmentLatestOrder` |

### Hooks — `hooks/garment-order/`
| File | Contents |
|---|---|
| `use-garment-order-form.ts` **NEW** | the orchestrator (state, derived billing/dates, save/search/delete/print) |
| `use-client-lookup.ts` **NEW** | client search/history/Add-Client flows + `ClientLookupHost` interface |
| `use-garment-base-prices.ts` **NEW** | Settings query + mutation |
| `use-status-message.ts` **NEW** | toast state |

### Components
| File | Contents |
|---|---|
| `components/garment-order/garment-order-form.tsx` **NEW** | the board: title bar, client strip, three columns, action bar, toast, receipt preview, match picker, discard and delete dialogs |
| `components/garment-order/garment-measurements-panel.tsx` **NEW** | measurement rows (1 or 2 boxes) + note |
| `components/garment-order/garment-options-panel.tsx` **NEW** | renders each option section (radio row with optional Design #, or checkbox row) |
| `components/garment-order/garment-billing-panel.tsx` **NEW** | quantity, delivery date, amount boxes, total/advance/balance, optional button-type list |
| `components/tailor-shared/` **NEW dir** | components used by Shalwar Kameez **and** the new forms, **MOVED** from `components/shalwar-kameez/`: `client-lookup-section`, `add-client-modal`, `client-no-input`, `client-match-picker-modal`, `status-toast`, `receipt-preview-dialog`, `action-bar`, `checkbox-group`, `radio-option-group`, `size-quick-pick`, `part-design-table`, `part-design-picker-modal`, `button-type-panel` |

Backward-compatible edits to the moved components (Shalwar Kameez passes none of
the new props, so its behaviour is unchanged):
`client-lookup-section` + `add-client-modal` (`orderType`, editable Record No. via
`onRecordNoChange`), `radio-option-group` (`titleUr`), `size-quick-pick`
(`label`), `action-bar` (`onDelete`, `deleteDisabled`).

### Utilities & constants
| File | Contents |
|---|---|
| `lib/constants/tailor-form.ts` **NEW** | `FIELD_CLASS`, `NO_SPINNER_CLASS`, `CLIENT_NO_PATTERN` (re-exported by `shalwar-kameez.ts`, which is **CHANGED** only for that) |
| `lib/utils/garment-order-sheet.ts` **NEW** | generated A5 order sheet |
| `lib/utils/html.ts` **NEW** | `escapeHtml` (extracted from `receipt.ts`) |
| `lib/utils/number-input.ts` **NEW** | string-input → number helpers |
| `lib/utils/receipt.ts` **CHANGED** | optional `garmentLabel`, `quantityLabel`, `showOthersAmt` |
| `lib/utils/date.ts` **CHANGED** | + `dateInputValueFromTimestamp` |

### Routes & pages
| File | Contents |
|---|---|
| `app/tailor/orders/[garment]/page.tsx` **NEW** | one route for all four garments |
| `app/tailor/(portal)/categories/page.tsx` **CHANGED** | the four cards now link |
| `app/tailor/(portal)/settings/page.tsx` **CHANGED** | + “Tailoring Amt” card for the four garments |

### Database — `supabase/migrations/`
`20261027000000_extend_garment_enums.sql`, `20261027010000_create_garment_detail_tables.sql`,
`20261027020000_create_garment_order_functions.sql` — all **NEW**; see
[02-database-design.md](02-database-design.md).

### Docs
`docs/tailor-garments/*` **NEW** (this folder); `ARCHITECTURE.md` **CHANGED** (summary + pointer).

## How a request flows (Pant, Save)

```
GarmentOrderForm  ──click Save──▶ useGarmentOrderForm.handleSave
   validate  ▶ computeBilling (lib/garments/billing)
   serializeDetails (lib/garments/form-values)  ▶ CreateGarmentOrderInput
   createGarmentOrder("pant", input) (lib/queries/garment-order-records)
        └─ supabase.rpc("create_pant_order")
              └─ create_garment_order_shell  ▶ clients upsert + garment_orders insert
              └─ insert pant_details  (jsonb_populate_record)
   ◀─ order_id  ▶ Record No. shown, Delete enabled, history updated
```

## Known follow-ups

1. **Shalwar Kameez still has its own 1,185-line hook** with a copy of the
   client-lookup/history logic. It can be moved onto `useClientLookup` and the
   shared billing helpers; deliberately not done here to avoid touching a
   working, untested-by-automation form. Worth doing next.
2. **No automated tests exist in the repo.** `lib/garments/*` are pure and ready
   for unit tests (a throw-away assertion script covering serialization
   round-trips and billing rules passed during development).
3. **Edit-in-place** for saved orders would add `update_<g>_order` functions;
   the definition-driven form already carries everything needed.
