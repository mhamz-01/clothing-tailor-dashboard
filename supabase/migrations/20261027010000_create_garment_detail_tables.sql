-- Tailor module: Waistcoat / Pant / Coat / Shirt order entry (step 2 of 3).
-- Tables, enums, indexes, seed data. Functions are in 20261027020000.
--
-- Same model as Shalwar Kameez (20260712000000): the garment-agnostic
-- `garment_orders` shell (client, quantity, delivery date, amounts) is shared,
-- and each garment adds one 1:1 `<garment>_details` table with typed
-- measurement columns and its own style choices.
--
-- Style choices are stored as Postgres enum columns directly on the details
-- row (no lookup-table join): each group is small, fixed, and carries no
-- images for these garments, so an enum gives integrity + compact storage
-- + readable rows without a join. Labels live in the app
-- (lib/garments/*.ts). Shirt reuses the Shalwar Kameez enums/catalogs where
-- the vocabulary is identical (bain/gala, collar, button type, style flags,
-- part designs).
--
-- RLS stays OFF, like every other tailor-module table: this app has no
-- Supabase Auth session, access is gated by the tailor_token cookie + proxy.ts
-- (see 20260714000000 item 1).

-- =========================
-- ENUMS
-- =========================
create type garment_shoulder_code     as enum ('shoulder_down','none');                  -- waistcoat, coat
create type waistcoat_gala_code       as enum ('v_gala','ban_gala','u_gala');
create type pant_paloi_code           as enum ('plain_pant','single_paloi','double_paloi');
create type pant_pancha_style_code    as enum ('plain','turn','bell_bottom');
create type pant_pocket_code          as enum ('sedha','cross');
create type coat_gala_code            as enum ('ban_gala','shervani','gala_band_coat','none');
create type coat_damn_code            as enum ('gol_damn','sedha_damn');
create type coat_style_code           as enum ('single_breast','double_breast','none');
create type coat_chaak_code           as enum ('single_chaak','double_chaak');

-- =========================
-- WAISTCOAT
-- =========================
create table waistcoat_details (
  id          bigint generated always as identity primary key,
  order_id    bigint not null unique references garment_orders(order_id) on delete cascade,

  -- Measurements (لمبائی, چھاتی, کمر, کندھا, کالر, ہپ)
  lambai      numeric(5,2),
  chaati      numeric(5,2),
  kamar       numeric(5,2),
  kandha      numeric(5,2),
  collar      numeric(5,2),
  hip         numeric(5,2),
  note        text,

  gala        waistcoat_gala_code,
  shoulder    garment_shoulder_code,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =========================
-- PANT
-- =========================
create table pant_details (
  id            bigint generated always as identity primary key,
  order_id      bigint not null unique references garment_orders(order_id) on delete cascade,

  -- Measurements (کمر, ہپ, لمبائی, پانچہ, گیدری, گوڈا)
  kamar         numeric(5,2),
  hip           numeric(5,2),
  lambai        numeric(5,2),
  pancha        numeric(5,2),
  gidri         numeric(5,2),
  goda          numeric(5,2),
  note          text,

  paloi         pant_paloi_code,
  pancha_style  pant_pancha_style_code,
  pocket        pant_pocket_code,
  back_pockets  smallint      check (back_pockets in (1, 2)),
  belt_width    numeric(3,2)  check (belt_width in (1.00, 1.50, 1.75, 2.00, 2.25)),  -- inches

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =========================
-- COAT
-- =========================
create table coat_details (
  id          bigint generated always as identity primary key,
  order_id    bigint not null unique references garment_orders(order_id) on delete cascade,

  -- Measurements (لمبائی, چھاتی, کمر, ہپ, آستین, تیرا, بالف بیک)
  lambai      numeric(5,2),
  chaati      numeric(5,2),
  kamar       numeric(5,2),
  hip         numeric(5,2),
  aasteen     numeric(5,2),
  teera       numeric(5,2),
  half_back   numeric(5,2),
  note        text,

  gala        coat_gala_code,
  damn        coat_damn_code,
  style       coat_style_code,
  buttons     smallint      check (buttons between 1 and 3),
  chaak       coat_chaak_code,
  shoulder    garment_shoulder_code,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =========================
-- SHIRT
-- =========================
-- The shirt sheet has two value boxes per measurement row; `<name>_2` is the
-- second box. Like Shalwar Kameez's extra_no1/extra_no2, the sheet does not
-- fix what the second value means - the tailor decides per order.
create table shirt_details (
  id               bigint generated always as identity primary key,
  order_id         bigint not null unique references garment_orders(order_id) on delete cascade,

  lambai           numeric(5,2),  lambai_2   numeric(5,2),
  chaati           numeric(5,2),  chaati_2   numeric(5,2),
  bazu             numeric(5,2),  bazu_2     numeric(5,2),
  teera            numeric(5,2),  teera_2    numeric(5,2),
  collar           numeric(5,2),  collar_2   numeric(5,2),
  kamar            numeric(5,2),  kamar_2    numeric(5,2),
  daman            numeric(5,2),  daman_2    numeric(5,2),
  note             text,

  bain_gala        bain_gala_type_code,
  bain_design_no   smallint check (bain_design_no > 0),
  collar_type      collar_type_code,
  collar_design_no smallint check (collar_design_no > 0),
  button_type      button_type_code,

  -- Independent multi-select (Nokdar Tera, Chak Asten, Kuf Dubble Kaj, Large
  -- Buttons, Kaj Patti, Dobat, 5 Btn, No Lbl, 2 Jeb). An enum array instead of
  -- Shalwar Kameez's junction table: nothing else hangs off a flag here, so a
  -- junction row would only add joins to every read and write.
  style_flags      style_flag_code[] not null default '{}',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- bazu / kuf / button_patti / jaib: Design #, Size 1, Size 2 - the same shape
-- and the same design_catalog (images) as order_part_designs.
create table shirt_part_designs (
  id               bigint generated always as identity primary key,
  shirt_detail_id  bigint not null references shirt_details(id) on delete cascade,
  part_type        part_type_enum not null,
  size1            text,
  size2            text,
  design_no        int,

  unique (shirt_detail_id, part_type),
  foreign key (part_type, design_no) references design_catalog (part_type, design_no)
);

-- =========================
-- updated_at triggers (set_updated_at() from 20260712000000)
-- =========================
create trigger trg_waistcoat_details_updated_at before update on waistcoat_details
for each row execute function set_updated_at();
create trigger trg_pant_details_updated_at before update on pant_details
for each row execute function set_updated_at();
create trigger trg_coat_details_updated_at before update on coat_details
for each row execute function set_updated_at();
create trigger trg_shirt_details_updated_at before update on shirt_details
for each row execute function set_updated_at();

-- =========================
-- Shared-shell index: "this client's latest <garment> order" is the hot
-- lookup (prefill on Client No). The existing idx_garment_orders_client_id
-- can't serve a garment-filtered, newest-first LIMIT 1.
-- =========================
create index idx_garment_orders_client_garment_latest
  on garment_orders (client_id, garment_type, order_id desc);

-- =========================
-- Per-garment base tailoring price (Settings page).
-- Shalwar Kameez keeps using order_pricing_settings.base_tailoring_amount;
-- delivery turnaround and the default cloth/shilling/others amounts in that
-- singleton are shared by every garment.
-- =========================
create table garment_base_prices (
  garment_type            garment_type_enum primary key,
  base_tailoring_amount   numeric(10,2) not null default 0 check (base_tailoring_amount >= 0),
  updated_at              timestamptz not null default now()
);

create trigger trg_garment_base_prices_updated_at before update on garment_base_prices
for each row execute function set_updated_at();

-- Starting values taken from the approved designs; editable in Settings.
insert into garment_base_prices (garment_type, base_tailoring_amount) values
  ('waistcoat', 0),
  ('pant',      3500),
  ('coat',      11000),
  ('shirt',     1200);

-- =========================
-- RLS off - see header.
-- =========================
alter table waistcoat_details   disable row level security;
alter table pant_details        disable row level security;
alter table coat_details        disable row level security;
alter table shirt_details       disable row level security;
alter table shirt_part_designs  disable row level security;
alter table garment_base_prices disable row level security;
