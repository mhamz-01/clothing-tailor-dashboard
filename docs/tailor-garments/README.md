# Tailor module — Waistcoat, Pant, Coat & Shirt order entry

This folder documents the four garment order sheets added to the tailor module
(`app/tailor/**`), alongside the existing Shalwar Kameez sheet.

| Document | Read it for |
|---|---|
| [01-functional-requirements.md](01-functional-requirements.md) | What each sheet does, field by field, business rules, decisions and assumptions |
| [02-database-design.md](02-database-design.md) | Tables, enums, constraints, indexes, relationships, migrations, how to add a garment |
| [03-api-and-queries.md](03-api-and-queries.md) | Every Postgres function, query function, hook and query key, with inputs/outputs |
| [04-code-structure.md](04-code-structure.md) | Every file added or changed, and what is inside it |

## The idea in one paragraph

All four garments share **one engine**. A garment is described once, as data, in
`lib/garments/<garment>.ts` (its measurements and style options). One set of
components (`components/garment-order/*`), one form hook
(`hooks/garment-order/use-garment-order-form.ts`), one query module
(`lib/queries/garment-order-records.ts`) and one route
(`app/tailor/orders/[garment]`) render, validate, save, load, delete and print
any of them. The database mirrors that: the existing garment-agnostic
`garment_orders` shell is reused, and each garment adds a single 1:1 details
table (`waistcoat_details`, `pant_details`, `coat_details`, `shirt_details`) —
the same model Shalwar Kameez uses.

## Source designs

Claude Design project `e2b1300a-97d0-4192-b6d5-4f47cf6dc101`:
`Waistcoat Measurement Dashboard.dc.html`, `Pant Measurement Dashboard.dc.html`,
`Coat Measurement Dashboard.dc.html`, `Shirt Measurement Dashboard copy.dc.html`.

## Deployment checklist

1. Apply the three migrations **in order** (`supabase db push`, or run each file
   in the SQL editor):
   `20261027000000_extend_garment_enums.sql` →
   `20261027010000_create_garment_detail_tables.sql` →
   `20261027020000_create_garment_order_functions.sql`.
   They are additive: no existing table, column, enum value or function is
   altered or dropped, so Shalwar Kameez and the admin dashboard are unaffected.
   Each file must run as its own transaction (the first adds enum values the
   second uses).
2. Deploy the app. The four "Soon" cards on `/tailor/categories` are now links.
3. Open **Settings** (gear icon) and set each garment's base Tailoring Amt.
   Seeded defaults: Waistcoat 0, Pant 3500, Coat 11000, Shirt 1200.

> The migrations were written and reviewed but **not executed** against any
> database in the build session (no local Postgres was available). Run them on a
> staging copy or a Supabase branch first.
