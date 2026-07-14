-- Garment order-entry schema for the tailor module (app/tailor/**), as specified in
-- tailor-schema-supabase.md. This migration only creates the schema — nothing in the
-- app queries these tables yet (see components/shalwar-kameez/* for the UI-only form).
--
-- Naming note: the source doc calls this table `orders`, but that name is already
-- taken by the admin dashboard's order-assignment table (see 001_initial.sql, used by
-- lib/queries/orders.ts, dashboard.ts, history.ts, tailors.ts, keepalive.ts). To avoid
-- colliding with that unrelated table, this one is named `garment_orders` instead.
-- Everything else follows the doc as written.

-- =========================
-- ENUMS
-- =========================
create type order_type_enum     as enum ('kameez_shalwar','waistcoat','both','other');
create type garment_type_enum   as enum ('kameez_shalwar','waistcoat','other');
create type part_type_enum      as enum ('bazu','kuf_button_patti','jaib');

create type pocket_type_code    as enum ('1_side_pocket','2_side_pocket','none');
create type bain_gala_type_code as enum ('gool_bain','sida_bain','half_bain','gol_gala','none');
create type collar_type_code    as enum ('american_cut','english_cut','french_cut','none');
create type daman_type_code     as enum ('qurta','sida_daman');
create type button_type_code    as enum ('metal_btn','STDS','ST3S','DTSS','DT3S','DTDS','RTSS','RTDS','EMD');
-- shalwar_zip and large_buttons were plain booleans with no image; now that both have
-- images, they're folded into this same independent multi-select flags pattern instead
-- of getting one-off image columns (tailor-schema-supabase.md §2).
create type style_flag_code     as enum ('kaf_dboty','btn_dboty','no_lbl','kaj_patti','5_btn','2_jeb','no_jeb','shalwar_zip','large_buttons');

-- =========================
-- CLIENTS
-- =========================
-- Separate from the admin dashboard's `customers` table (different shape/purpose) --
-- see the "Clients vs customers" decision recorded when this migration was written.
create table clients (
  client_id     bigint generated always as identity primary key,
  client_no     text not null unique,
  client_name   text not null,
  phone_no      text not null,
  order_type    order_type_enum not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
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
-- GARMENT ORDERS (generic order shell; named `orders` in tailor-schema-supabase.md)
-- =========================
create table garment_orders (
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
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_garment_orders_client_id on garment_orders(client_id);

-- =========================
-- CATALOG / LOOKUP TABLES (image stored once per option)
-- =========================
create table design_catalog (
  design_no    int primary key,
  image_path   text not null
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

-- =========================
-- SHALWAR KAMEEZ DETAILS (1:1 with a garment_orders row)
-- =========================
create table shalwar_kameez_details (
  id                   bigint generated always as identity primary key,
  order_id             bigint not null unique references garment_orders(order_id) on delete cascade,

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
  note1                 text,
  note2                 text,

  -- Single-select groups
  pocket_type_id        smallint references pocket_types(id),
  bain_gala_type_id     smallint references bain_gala_types(id),
  collar_type_id        smallint references collar_types(id),
  daman_type_id         smallint references daman_types(id),
  button_type_id        smallint references button_types(id),

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
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

-- =========================
-- updated_at trigger
-- =========================
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

create trigger trg_garment_orders_updated_at
before update on garment_orders
for each row execute function set_updated_at();

create trigger trg_skd_updated_at
before update on shalwar_kameez_details
for each row execute function set_updated_at();

-- =========================
-- record_counter trigger
-- =========================
create or replace function increment_record_counter()
returns trigger as $$
begin
  update record_counter set total_records = total_records + 1 where id = 1;
  return new;
end;
$$ language plpgsql;

create trigger trg_garment_orders_increment_counter
after insert on garment_orders
for each row execute function increment_record_counter();

-- =========================
-- Row Level Security — permissive starting point, see tailor-schema-supabase.md §7.
-- Confirm the tailor auth model before tightening these policies.
-- =========================
alter table clients enable row level security;
alter table garment_orders enable row level security;
alter table shalwar_kameez_details enable row level security;
alter table order_part_designs enable row level security;
alter table order_style_flags enable row level security;

create policy "authenticated full access" on clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on garment_orders
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
