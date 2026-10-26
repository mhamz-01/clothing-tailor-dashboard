# 02 — Database design

Postgres on Supabase. Three additive migrations; nothing existing is altered
except by **adding** enum values.

| Order | File | Contents |
|---|---|---|
| 1 | `20261027000000_extend_garment_enums.sql` | `ALTER TYPE … ADD VALUE` on 3 existing enums (own file/transaction: a new enum value cannot be used in the transaction that adds it) |
| 2 | `20261027010000_create_garment_detail_tables.sql` | 9 new enums, 5 new tables, 1 index, triggers, seed prices |
| 3 | `20261027020000_create_garment_order_functions.sql` | 3 shared helpers + 4 × (create / get / fetch-latest) functions |

## 1. Model

The tailor module's model (`tailor-schema-supabase.md` §1) is garment-agnostic
at the top and garment-specific underneath. The four new garments follow it
exactly.

```
clients ──< garment_orders ──┬── 1:1 ── shalwar_kameez_details ──< order_part_designs
 (existing)   (existing shell)│                                 └─< order_style_flags      (existing)
                              ├── 1:1 ── waistcoat_details                                  (new)
                              ├── 1:1 ── pant_details                                       (new)
                              ├── 1:1 ── coat_details                                       (new)
                              └── 1:1 ── shirt_details ──< shirt_part_designs ──> design_catalog (new; catalog existing)

garment_base_prices (garment_type → base tailoring amount)                                   (new)
order_pricing_settings, button_types.price, record_counter                                   (existing, shared)
```

Why this shape

* **One shell, one details table per garment.** Client, quantity, delivery date
  and the seven money columns are identical for every garment, so they stay in
  `garment_orders` (already there for exactly this purpose). Measurements and
  styles differ per garment, so each gets typed columns — queryable, constrained,
  and with no sparse "every garment's columns on one table" row.
* **`ON DELETE CASCADE` from `garment_orders`** — deleting an order removes its
  details (and shirt part designs) in one statement; deleting a client already
  cascades to orders (migration `20260716000000`).
* **Style choices are enum columns on the details row**, not lookup-table FKs.
  The groups are small and fixed, carry no images for these garments, and an enum
  column is 4 bytes, self-validating, join-free and readable in the table editor.
  Labels live in the app (`lib/garments/*.ts`). Adding a choice is
  `ALTER TYPE … ADD VALUE` plus one line in the definition file.
* **Shirt reuses Shalwar Kameez vocabulary** where it is the same thing:
  `bain_gala_type_code`, `collar_type_code`, `button_type_code`,
  `style_flag_code`, `part_type_enum`, `design_catalog` (so part-design images
  and `button_types.price` are shared).
* **Shirt flags are an enum array** (`style_flags style_flag_code[]`), not a
  junction table: nothing else hangs off a flag, so a junction would only add a
  join to every read and an insert loop to every write. Shalwar Kameez keeps its
  `order_style_flags` table untouched.
* **Money** is `numeric(10,2)`, measurements `numeric(5,2)` (same as Shalwar
  Kameez). **No Supabase Auth**, so **RLS is disabled** on the new tables, like
  the rest of the tailor module (see `20260714000000`, item 1).

## 2. Changes to existing enums (migration 1)

| Enum | Added values | Why |
|---|---|---|
| `garment_type_enum` | `pant`, `coat`, `shirt` (`waistcoat` existed) | `garment_orders.garment_type` |
| `order_type_enum` | `pant`, `coat`, `shirt` | `clients.order_type` records the garment a client was first registered under |
| `style_flag_code` | `nokdar_tera`, `chak_asten`, `dobat` | shirt-only flags; the other six shirt flags reuse existing codes (`kaf_dboty` = “Kuf Dubble Kaj”, `large_buttons`, `kaj_patti`, `5_btn`, `no_lbl`, `2_jeb`) |

## 3. New enums (migration 2)

| Enum | Values |
|---|---|
| `garment_shoulder_code` | `shoulder_down`, `none` (waistcoat, coat) |
| `waistcoat_gala_code` | `v_gala`, `ban_gala`, `u_gala` |
| `pant_paloi_code` | `plain_pant`, `single_paloi`, `double_paloi` |
| `pant_pancha_style_code` | `plain`, `turn`, `bell_bottom` |
| `pant_pocket_code` | `sedha`, `cross` |
| `coat_gala_code` | `ban_gala`, `shervani`, `gala_band_coat`, `none` |
| `coat_damn_code` | `gol_damn`, `sedha_damn` |
| `coat_style_code` | `single_breast`, `double_breast`, `none` |
| `coat_chaak_code` | `single_chaak`, `double_chaak` |

Numeric choices (back pockets, belt width, coat buttons, design numbers) are
`CHECK`-constrained numbers instead of enums.

## 4. Tables

Common to every `<garment>_details`: `id bigint identity PK`,
`order_id bigint NOT NULL UNIQUE → garment_orders(order_id) ON DELETE CASCADE`
(the unique constraint is also the lookup index), `created_at`, `updated_at`
(maintained by the existing `set_updated_at()` trigger). All style and
measurement columns are nullable.

### 4.1 `waistcoat_details`
| Column | Type | Notes |
|---|---|---|
| `lambai`, `chaati`, `kamar`, `kandha`, `collar`, `hip` | numeric(5,2) | لمبائی, چھاتی, کمر, کندھا, کالر, ہپ |
| `note` | text | |
| `gala` | `waistcoat_gala_code` | |
| `shoulder` | `garment_shoulder_code` | |

### 4.2 `pant_details`
| Column | Type | Notes |
|---|---|---|
| `kamar`, `hip`, `lambai`, `pancha`, `gidri`, `goda` | numeric(5,2) | کمر, ہپ, لمبائی, پانچہ, گیدری, گوڈا |
| `note` | text | |
| `paloi` | `pant_paloi_code` | |
| `pancha_style` | `pant_pancha_style_code` | |
| `pocket` | `pant_pocket_code` | |
| `back_pockets` | smallint | `CHECK (back_pockets IN (1,2))` |
| `belt_width` | numeric(3,2) | inches; `CHECK (belt_width IN (1.00,1.50,1.75,2.00,2.25))` |

### 4.3 `coat_details`
| Column | Type | Notes |
|---|---|---|
| `lambai`, `chaati`, `kamar`, `hip`, `aasteen`, `teera`, `half_back` | numeric(5,2) | لمبائی, چھاتی, کمر, ہپ, آستین, تیرا, بالف بیک |
| `note` | text | |
| `gala` | `coat_gala_code` | |
| `damn` | `coat_damn_code` | |
| `style` | `coat_style_code` | |
| `buttons` | smallint | `CHECK (buttons BETWEEN 1 AND 3)` |
| `chaak` | `coat_chaak_code` | |
| `shoulder` | `garment_shoulder_code` | |

### 4.4 `shirt_details`
| Column | Type | Notes |
|---|---|---|
| `lambai`, `chaati`, `bazu`, `teera`, `collar`, `kamar`, `daman` | numeric(5,2) | first value box |
| `lambai_2` … `daman_2` | numeric(5,2) | second value box (meaning chosen by the tailor) |
| `note` | text | |
| `bain_gala` | `bain_gala_type_code` | existing enum |
| `bain_design_no` | smallint | `CHECK (> 0)` |
| `collar_type` | `collar_type_code` | existing enum |
| `collar_design_no` | smallint | `CHECK (> 0)` |
| `button_type` | `button_type_code` | existing enum; price from `button_types.price` |
| `style_flags` | `style_flag_code[]` NOT NULL DEFAULT `'{}'` | checked flags |

### 4.5 `shirt_part_designs`
Same shape as `order_part_designs`: `id`, `shirt_detail_id → shirt_details(id)
ON DELETE CASCADE`, `part_type part_type_enum`, `size1 text`, `size2 text`,
`design_no int`. `UNIQUE (shirt_detail_id, part_type)` and composite
`FOREIGN KEY (part_type, design_no) → design_catalog(part_type, design_no)` (a
null `design_no` is allowed; sizes are text because they hold fractions such as
`1 1/4` and `4x4 1/2`).

### 4.6 `garment_base_prices`
| Column | Type | Notes |
|---|---|---|
| `garment_type` | `garment_type_enum` PK | one row per garment |
| `base_tailoring_amount` | numeric(10,2) | `CHECK (>= 0)`; default Tailoring Amt per unit |
| `updated_at` | timestamptz | trigger |

Seeded: waistcoat 0, pant 3500, coat 11000, shirt 1200 (the design figures).
Shalwar Kameez is **not** here — it keeps `order_pricing_settings.base_tailoring_amount`.
Turnaround days and default cloth/shilling/others amounts in
`order_pricing_settings` are shared by all garments.

### 4.7 Reused, unchanged
`clients`, `garment_orders` (all money/qty/date columns), `record_counter`,
`order_pricing_settings`, `button_types`, `design_catalog`.

## 5. Indexes

| Index | Purpose |
|---|---|
| `<garment>_details.order_id` UNIQUE | 1:1 link and Record No. open |
| `idx_garment_orders_client_garment_latest (client_id, garment_type, order_id DESC)` | “newest order of this garment for this client” — the hot prefill lookup; the older `idx_garment_orders_client_id` cannot serve a garment-filtered, newest-first `LIMIT 1` |
| `clients.client_no` UNIQUE (existing) | Client No. lookup |

## 6. Functions

All are `search_path`-pinned to `public`. Signatures and JSON shapes are in
[03-api-and-queries.md](03-api-and-queries.md).

| Function | Kind | Role |
|---|---|---|
| `create_garment_order_shell(...)` | plpgsql | validates qty ≥ 1 and amounts ≥ 0; upserts the client (name/phone refreshed, `order_type` kept); inserts `garment_orders` with `total_amt` and `balance_amt` computed server-side; returns `order_id` |
| `garment_order_header(order_id)` | sql, stable | order shell + client as jsonb |
| `latest_garment_order_id(garment, client_no)` | sql, stable | newest order id (uses the composite index) |
| `create_<garment>_order(...)` ×4 | plpgsql | shell + details insert (+ shirt part designs) in one transaction |
| `get_<garment>_order(order_id)` ×4 | sql, stable | header + `details` jsonb (+ `part_designs` for shirt) |
| `fetch_latest_<garment>_order(client_no)` ×4 | sql, stable | `get_*` of `latest_garment_order_id(...)` |

Details arrive as one jsonb whose keys are the details-table column names and
are cast by `jsonb_populate_record(null::<table>, p_details)`. So adding a
column needs no change to argument lists, and a bad enum value or number aborts
the whole save.

## 7. Integrity rules at a glance

* Quantity ≥ 1 and all amounts ≥ 0 (function-level); totals are recomputed in
  SQL, never trusted from the client.
* `client_no` format `^[A-Za-z]-[0-9]+$` (existing check constraint).
* Choice columns are enums or `CHECK` lists — an invalid value cannot be stored.
* Deleting `garment_orders` cascades to details and shirt part designs.

## 8. Adding another garment (e.g. Waistcoat-2, Kids Suit)

1. Migration: add the value to `garment_type_enum` and `order_type_enum` (own
   file), then the `<g>_details` table, any new enums, a `garment_base_prices`
   row, and `create_<g>_order` / `get_<g>_order` / `fetch_latest_<g>_order`
   copied from a sibling.
2. App: add `lib/garments/<g>.ts` and one line in `lib/garments/registry.ts` and
   `types/garment-form.ts` (`GarmentKey`); add `GARMENT_KEYS`-driven pieces
   automatically (route, Settings card). Add the category card link.

## 9. Rollback

Reverse order: drop the 13 functions, then `shirt_part_designs`,
`shirt_details`, `coat_details`, `pant_details`, `waistcoat_details`,
`garment_base_prices`, the index, and the 9 new enums. The enum **values** added
in migration 1 cannot be removed without recreating the enum; they are harmless
if left. Orders already saved for the new garments are lost by the table drops —
export first.
