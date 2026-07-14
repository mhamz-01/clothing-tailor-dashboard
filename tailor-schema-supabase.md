# Tailor Shop — Database Schema (Supabase / Postgres)

This file is the implementation spec for the database layer of the tailor shop project (Next.js + Supabase). Read this fully before writing any migration or query code.

> This is a direct translation of the agreed schema (see `Tailor_Shop_Schema_Design_Document.docx` for full requirement mapping and design rationale) from generic SQL into Postgres/Supabase syntax. No fields were added or removed from the original requirement — only Postgres-specific additions are called out explicitly below in **"Supabase additions"**, and those should be treated as implementation recommendations, not requirement changes.

---

## 1. Design summary (read this first)

- **`orders`** is garment-agnostic (client, quantity, delivery date, amounts). **`shalwar_kameez_details`** holds only shalwar-kameez-specific measurements/styles, 1:1 with an order via `order_id`. This lets future garment types (waistcoat, coat) reuse `orders` without duplicating quantity/delivery/amount columns.
- **Single-select checkbox groups** (pocket type, bain/gala, collar type, daman type, button type) → one FK column on `shalwar_kameez_details` pointing at a lookup table.
- **Independent/multi-select checkbox group** (kaf dboty, btn dboty, no lbl, kaj patti, 5 btn, 2 jeb, no jeb, shalwar zip, large buttons) → junction table `order_style_flags`. `shalwar_zip` and `large_buttons` were previously plain booleans with no image; now that both have images, they were folded into this same flags pattern instead of getting one-off image columns.
- **`is_nokder_tera`, `is_chalk_asten`, `is_kuf_dbl_kaj`** have been removed — no longer part of the schema.
- **Measurement note** is now two optional fields, `note1` and `note2`, instead of a single `note`.
- **Every checkbox/option group has an image.** Images are stored once per option in a catalog table (not once per order) — see section 4.
- **Images live in Supabase Storage**, not as raw blobs in Postgres. Catalog tables store the **storage path**, not a URL, so the app can generate signed/public URLs at request time. See section 5.

---

## 2. Extensions & enum types

```sql
-- Enums (Postgres-native, cleaner than CHECK constraints for fixed option sets)
create type order_type_enum       as enum ('kameez_shalwar','waistcoat','both','other');
create type garment_type_enum     as enum ('kameez_shalwar','waistcoat','other');
create type part_type_enum        as enum ('bazu','kuf_button_patti','jaib');

create type pocket_type_code      as enum ('1_side_pocket','2_side_pocket','none');
create type bain_gala_type_code   as enum ('gool_bain','sida_bain','half_bain','gol_gala','none');
create type collar_type_code      as enum ('american_cut','english_cut','french_cut','none');
create type daman_type_code       as enum ('qurta','sida_daman');
create type button_type_code      as enum ('metal_btn','STDS','ST3S','DTSS','DT3S','DTDS','RTSS','RTDS','EMD');
create type style_flag_code       as enum ('kaf_dboty','btn_dboty','no_lbl','kaj_patti','5_btn','2_jeb','no_jeb','shalwar_zip','large_buttons');
```

---

## 3. Core tables

```sql
-- =========================
-- CLIENTS
-- =========================
create table clients (
  client_id     bigint generated always as identity primary key,
  client_no     text not null unique,
  client_name   text not null,
  phone_no      text not null,
  order_type    order_type_enum not null,
  created_at    timestamptz not null default now(),   -- Supabase addition, see §7
  updated_at    timestamptz not null default now()    -- Supabase addition, see §7
);

-- =========================
-- RECORD COUNTER
-- =========================
create table record_counter (
  id             int primary key default 1,
  total_records  int not null default 0,
  constraint single_row check (id = 1)
);
insert into record_counter (id, total_records) values (1, 0);

-- =========================
-- ORDERS (generic order shell)
-- =========================
create table orders (
  order_id           bigint generated always as identity primary key,
  client_id          bigint not null references clients(client_id) on delete restrict,
  garment_type       garment_type_enum not null,
  quantity           int not null,
  delivery_date      date not null,
  tailoring_amount   numeric(10,2) not null default 0,
  cloth_amount       numeric(10,2) not null default 0,
  shilling_amt       numeric(10,2) not null default 0,
  others_amt         numeric(10,2) not null default 0,
  total_amt          numeric(10,2) not null default 0,
  advance_amt        numeric(10,2) not null default 0,
  balance_amt        numeric(10,2) not null default 0,
  created_at         timestamptz not null default now(),  -- Supabase addition, see §7
  updated_at         timestamptz not null default now()   -- Supabase addition, see §7
);
create index idx_orders_client_id on orders(client_id);
```

---

## 4. Catalog / lookup tables (image stored once per option)

```sql
create table design_catalog (
  design_no    int primary key,
  image_path   text not null       -- Supabase Storage object path, see §5
);

create table pocket_types (
  id          smallint generated always as identity primary key,
  code        pocket_type_code not null unique,
  image_path  text
);

create table bain_gala_types (
  id          smallint generated always as identity primary key,
  code        bain_gala_type_code not null unique,
  image_path  text
);

create table collar_types (
  id          smallint generated always as identity primary key,
  code        collar_type_code not null unique,
  image_path  text
);

create table daman_types (
  id          smallint generated always as identity primary key,
  code        daman_type_code not null unique,
  image_path  text
);

create table button_types (
  id          smallint generated always as identity primary key,
  code        button_type_code not null unique,
  image_path  text
);

create table style_flag_catalog (
  id          smallint generated always as identity primary key,
  code        style_flag_code not null unique,
  image_path  text
);
```

---

## 5. Shalwar kameez details, part designs, and style flags

```sql
-- =========================
-- SHALWAR KAMEEZ DETAILS (1:1 with an order)
-- =========================
create table shalwar_kameez_details (
  id                   bigint generated always as identity primary key,
  order_id             bigint not null unique references orders(order_id) on delete cascade,

  -- Measurements
  lambai               numeric(5,2),
  chaati                numeric(5,2),
  bazu                  numeric(5,2),
  teera                 numeric(5,2),
  collar                numeric(5,2),
  kamar                 numeric(5,2),
  daman                 numeric(5,2),
  shalwar_lambai        numeric(5,2),
  pancha                numeric(5,2),
  note1                 text,          -- optional
  note2                 text,          -- optional

  -- Single-select groups
  pocket_type_id        smallint references pocket_types(id),
  bain_gala_type_id     smallint references bain_gala_types(id),
  collar_type_id        smallint references collar_types(id),
  daman_type_id         smallint references daman_types(id),
  button_type_id        smallint references button_types(id),

  created_at            timestamptz not null default now(),  -- Supabase addition, see §7
  updated_at            timestamptz not null default now()   -- Supabase addition, see §7
);

-- =========================
-- PART DESIGNS (bazu / kuf button patti / jaib)
-- =========================
create table order_part_designs (
  id                          bigint generated always as identity primary key,
  shalwar_kameez_detail_id    bigint not null references shalwar_kameez_details(id) on delete cascade,
  part_type                   part_type_enum not null,
  size1                       numeric(5,2),
  size2                       numeric(5,2),
  design_no                   int references design_catalog(design_no),

  unique (shalwar_kameez_detail_id, part_type)
);

-- =========================
-- STYLE FLAGS (independent multi-select junction table)
-- =========================
create table order_style_flags (
  id                          bigint generated always as identity primary key,
  shalwar_kameez_detail_id    bigint not null references shalwar_kameez_details(id) on delete cascade,
  style_flag_id               smallint not null references style_flag_catalog(id),

  unique (shalwar_kameez_detail_id, style_flag_id)
);
```

---

## 6. Images via Supabase Storage

Catalog tables store `image_path`, a path inside a Supabase Storage bucket (e.g. `design-images/12.png`), not a full URL.

- Create a bucket, e.g. `tailor-designs`, for all catalog option images (design catalog, pocket types, collar types, etc.).
- If the bucket is **public**: build the display URL client-side with `supabase.storage.from('tailor-designs').getPublicUrl(image_path)`.
- If the bucket is **private**: generate a signed URL server-side per request with `supabase.storage.from('tailor-designs').createSignedUrl(image_path, expiresIn)`.
- Since these are a small, fixed set of style/option reference images (not user uploads), a public bucket is simplest unless there's a reason to restrict access.

---

## 7. Supabase-specific additions (flagged separately from the original requirement)

These were not in the original field list — they're standard practice for a production Supabase/Postgres app and are called out here so nothing is silently different from what was agreed:

- `created_at` / `updated_at` timestamp columns on `clients`, `orders`, and `shalwar_kameez_details` — for auditing and sorting by recency.
- An `updated_at` trigger (below) to keep it current automatically.
- Row Level Security (RLS) — Supabase enables RLS-aware querying by default; since this is tailor-shop-internal data (not multi-tenant per end customer), the likely policy is "authenticated staff can read/write everything." Confirm the auth model before writing policies — do not enable RLS with no policies, or the app will silently get zero rows back.

```sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_clients_updated_at
before update on clients
for each row execute function set_updated_at();

create trigger trg_orders_updated_at
before update on orders
for each row execute function set_updated_at();

create trigger trg_skd_updated_at
before update on shalwar_kameez_details
for each row execute function set_updated_at();
```

```sql
-- Minimal RLS starting point — adjust once the auth model is confirmed.
alter table clients enable row level security;
alter table orders enable row level security;
alter table shalwar_kameez_details enable row level security;
alter table order_part_designs enable row level security;
alter table order_style_flags enable row level security;

create policy "authenticated full access" on clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on shalwar_kameez_details
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on order_part_designs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on order_style_flags
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Catalog tables are reference data — readable by any authenticated user, not writable from the app.
alter table pocket_types enable row level security;
alter table bain_gala_types enable row level security;
alter table collar_types enable row level security;
alter table daman_types enable row level security;
alter table button_types enable row level security;
alter table style_flag_catalog enable row level security;
alter table design_catalog enable row level security;

create policy "authenticated read" on pocket_types for select using (auth.role() = 'authenticated');
create policy "authenticated read" on bain_gala_types for select using (auth.role() = 'authenticated');
create policy "authenticated read" on collar_types for select using (auth.role() = 'authenticated');
create policy "authenticated read" on daman_types for select using (auth.role() = 'authenticated');
create policy "authenticated read" on button_types for select using (auth.role() = 'authenticated');
create policy "authenticated read" on style_flag_catalog for select using (auth.role() = 'authenticated');
create policy "authenticated read" on design_catalog for select using (auth.role() = 'authenticated');
```

---

## 8. Keeping `record_counter` in sync

`record_counter.total_records` was requested as a literal running total. Since it's derived data, the safest implementation is a trigger that increments it whenever a new order is inserted, rather than the app incrementing it manually (which risks drift if a write fails partway):

```sql
create or replace function increment_record_counter()
returns trigger as $$
begin
  update record_counter set total_records = total_records + 1 where id = 1;
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_increment_counter
after insert on orders
for each row execute function increment_record_counter();
```

---

## 9. Implementation checklist for Claude Code

1. Create a new Supabase migration (`supabase migration new init_tailor_schema`) and paste in sections 2 → 8 in order (enums → clients/orders/record_counter → catalog tables → details/part-designs/style-flags → storage/triggers/RLS).
2. Generate TypeScript types from the schema: `supabase gen types typescript --local > types/database.ts` (or `--project-id` for remote), and use these types for all Supabase client calls in the Next.js app.
3. Seed the catalog tables (`pocket_types`, `bain_gala_types`, `collar_types`, `daman_types`, `button_types`, `style_flag_catalog`, `design_catalog`) with their fixed option rows and image paths — these are reference data, not user-generated, so a seed script/migration is appropriate.
4. Upload the corresponding option images to the `tailor-designs` Storage bucket, matching the `image_path` values used in the seed data.
5. Build order creation as a single transaction (via a Postgres function or sequential inserts in an API route): insert into `orders`, then `shalwar_kameez_details`, then any `order_part_designs` and `order_style_flags` rows — all or nothing.
6. Confirm the auth model (single staff login vs. multiple tailor accounts vs. public client-facing views) before finalizing the RLS policies in section 7 — the policies above are a permissive starting point, not a final answer.