-- Fix-up for the garment-order schema (20260712000000) before wiring the API.
-- Three problems found while building the API against the live schema:
--
-- 1. RLS policies use `auth.role() = 'authenticated'`, but this app never
--    authenticates through Supabase Auth (tailor/admin sessions are custom
--    JWT cookies, see lib/auth/tailor.ts and lib/auth/superadmin.ts). That
--    check can never pass, so every browser-client select/insert would
--    silently return zero rows. Existing equivalent tables (tailors,
--    customers, orders in 001_initial.sql) simply disable RLS and rely on
--    the app's own session gating -- match that here instead.
--
-- 2. part_type_enum only had 3 values ('bazu','kuf_button_patti','jaib'),
--    conflating "kuf" and "button patti" into one value. But the UI
--    (components/shalwar-kameez/part-design-table.tsx, PART_DESIGNS in
--    lib/constants/shalwar-kameez.ts) has 4 fully independent rows with
--    4 independently-numbered image sets (kuf: 4 images, button patti: 7
--    images). order_part_designs has `unique (shalwar_kameez_detail_id,
--    part_type)`, so sharing one enum value would only ever allow one of
--    the two selections to be stored per order. Split into 4 values.
--
-- 3. design_catalog had a single global `design_no int primary key`, shared
--    by all part types. But bazu/kuf/button_patti/jaib each have their own
--    independently-numbered image folders (arm1-6, kaf1-4, bpatti1-7,
--    pocket1-11) -- design_no=1 means a different image per part type, so
--    a global PK can't represent that. Scope the key to (part_type, design_no).
--
-- All five new tables plus the six catalog tables were created by
-- 20260712000000 and have never been queried by the app (Save/Prev/Next
-- are still stubs) or received real writes, so these are safe in-place
-- structural changes rather than data migrations.

-- =========================
-- 1. Disable RLS (custom cookie/JWT auth, not Supabase Auth)
-- =========================
drop policy if exists "authenticated full access" on clients;
drop policy if exists "authenticated full access" on garment_orders;
drop policy if exists "authenticated full access" on shalwar_kameez_details;
drop policy if exists "authenticated full access" on order_part_designs;
drop policy if exists "authenticated full access" on order_style_flags;

drop policy if exists "authenticated read" on pocket_types;
drop policy if exists "authenticated read" on bain_gala_types;
drop policy if exists "authenticated read" on collar_types;
drop policy if exists "authenticated read" on daman_types;
drop policy if exists "authenticated read" on button_types;
drop policy if exists "authenticated read" on style_flag_catalog;
drop policy if exists "authenticated read" on design_catalog;

alter table clients disable row level security;
alter table garment_orders disable row level security;
alter table shalwar_kameez_details disable row level security;
alter table order_part_designs disable row level security;
alter table order_style_flags disable row level security;
alter table pocket_types disable row level security;
alter table bain_gala_types disable row level security;
alter table collar_types disable row level security;
alter table daman_types disable row level security;
alter table button_types disable row level security;
alter table style_flag_catalog disable row level security;
alter table design_catalog disable row level security;

-- =========================
-- 2. Fix part_type_enum (3 -> 4 values). Column is empty, so drop/recreate
--    is simpler and safer than ALTER TYPE ... RENAME VALUE gymnastics.
-- =========================
alter table order_part_designs alter column part_type type text using part_type::text;
drop type part_type_enum;
create type part_type_enum as enum ('bazu','kuf','button_patti','jaib');
alter table order_part_designs alter column part_type type part_type_enum using part_type::part_type_enum;

-- =========================
-- 3. Fix design_catalog: scope design_no per part_type
-- =========================
alter table order_part_designs drop constraint order_part_designs_design_no_fkey;

alter table design_catalog add column part_type part_type_enum;
alter table design_catalog alter column part_type set not null;
alter table design_catalog drop constraint design_catalog_pkey;
alter table design_catalog add constraint design_catalog_pkey primary key (part_type, design_no);

alter table order_part_designs
  add constraint order_part_designs_design_fkey
  foreign key (part_type, design_no) references design_catalog(part_type, design_no);

-- =========================
-- 4. Seed catalog lookup tables (id + code only -- these style-option groups
--    have no established, unambiguous code-to-image mapping yet: the current
--    UI (StyleOptionsPanel) renders them as plain radio buttons with no
--    thumbnails, and several asset folders use generic numbered filenames
--    that don't map 1:1 to a specific enum code without product input.
--    Fill in image_path later once that mapping is confirmed.)
-- =========================
insert into pocket_types (code) values
  ('1_side_pocket'), ('2_side_pocket'), ('none');

insert into bain_gala_types (code) values
  ('gool_bain'), ('sida_bain'), ('half_bain'), ('gol_gala'), ('none');

insert into collar_types (code) values
  ('american_cut'), ('english_cut'), ('french_cut'), ('none');

insert into daman_types (code) values
  ('qurta'), ('sida_daman');

insert into button_types (code) values
  ('metal_btn'), ('STDS'), ('ST3S'), ('DTSS'), ('DT3S'), ('DTDS'), ('RTSS'), ('RTDS'), ('EMD');

insert into style_flag_catalog (code) values
  ('kaf_dboty'), ('btn_dboty'), ('no_lbl'), ('kaj_patti'), ('5_btn'), ('2_jeb'), ('no_jeb'),
  ('shalwar_zip'), ('large_buttons');

-- =========================
-- 5. Seed design_catalog with real image paths (Option A: static files
--    under public/, never uploaded to Supabase Storage -- see the
--    PART_DESIGN_IMAGE_FOLDERS mapping in lib/constants/shalwar-kameez.ts,
--    which the current UI-only picker modal already uses and trusts).
-- =========================
insert into design_catalog (part_type, design_no, image_path)
select 'bazu', n, '/kameez-shalwar-assets/arm/arm' || n || '.jpg'
from generate_series(1, 6) as n;

insert into design_catalog (part_type, design_no, image_path)
select 'kuf', n, '/kameez-shalwar-assets/kuf/kaf' || n || '.jpg'
from generate_series(1, 4) as n;

-- bpatti7's source file is bpatti7.JPG (uppercase extension) -- handled
-- as an explicit override since static file URLs are case-sensitive.
insert into design_catalog (part_type, design_no, image_path)
select 'button_patti', n,
  case when n = 7 then '/kameez-shalwar-assets/bpatti/bpatti7.JPG'
       else '/kameez-shalwar-assets/bpatti/bpatti' || n || '.jpg'
  end
from generate_series(1, 7) as n;

insert into design_catalog (part_type, design_no, image_path)
select 'jaib', n, '/kameez-shalwar-assets/pockets/pocket' || n || '.jpg'
from generate_series(1, 11) as n;

-- =========================
-- 6. Atomic order-creation RPC (doc §9 item 5: "single transaction via a
--    Postgres function or sequential inserts in an API route"). Upserts the
--    client by client_no, inserts the garment_order + shalwar_kameez_details
--    row, then any style flags / part designs -- all or nothing.
-- =========================
create or replace function create_shalwar_kameez_order(
  p_client_no             text,
  p_client_name           text,
  p_phone_no              text,
  p_order_type            order_type_enum,
  p_quantity              int,
  p_delivery_date         date,
  p_tailoring_amount      numeric,
  p_cloth_amount          numeric,
  p_shilling_amt          numeric,
  p_others_amt            numeric,
  p_advance_amt           numeric,
  p_measurements          jsonb,
  p_note1                 text,
  p_note2                 text,
  p_pocket_type_code      pocket_type_code,
  p_bain_gala_type_code   bain_gala_type_code,
  p_collar_type_code      collar_type_code,
  p_daman_type_code       daman_type_code,
  p_button_type_code      button_type_code,
  p_style_flag_codes      style_flag_code[],
  p_part_designs          jsonb
) returns bigint
language plpgsql
as $$
declare
  v_client_id  bigint;
  v_order_id   bigint;
  v_skd_id     bigint;
  v_total      numeric(10,2);
  v_balance    numeric(10,2);
  v_flag_code  style_flag_code;
  v_part       jsonb;
begin
  insert into clients (client_no, client_name, phone_no, order_type)
  values (p_client_no, p_client_name, p_phone_no, p_order_type)
  on conflict (client_no) do update
    set client_name = excluded.client_name,
        phone_no    = excluded.phone_no,
        order_type  = excluded.order_type
  returning client_id into v_client_id;

  v_total := p_tailoring_amount + p_cloth_amount + p_shilling_amt + p_others_amt;
  v_balance := v_total - p_advance_amt;

  insert into garment_orders (
    client_id, garment_type, quantity, delivery_date,
    tailoring_amount, cloth_amount, shilling_amt, others_amt,
    total_amt, advance_amt, balance_amt
  ) values (
    v_client_id, 'kameez_shalwar', p_quantity, p_delivery_date,
    p_tailoring_amount, p_cloth_amount, p_shilling_amt, p_others_amt,
    v_total, p_advance_amt, v_balance
  ) returning order_id into v_order_id;

  insert into shalwar_kameez_details (
    order_id, lambai, chaati, bazu, teera, collar, kamar, daman,
    shalwar_lambai, pancha, note1, note2,
    pocket_type_id, bain_gala_type_id, collar_type_id, daman_type_id, button_type_id
  ) values (
    v_order_id,
    (p_measurements->>'lambai')::numeric,
    (p_measurements->>'chaati')::numeric,
    (p_measurements->>'bazu')::numeric,
    (p_measurements->>'teera')::numeric,
    (p_measurements->>'collar')::numeric,
    (p_measurements->>'kamar')::numeric,
    (p_measurements->>'daman')::numeric,
    (p_measurements->>'shalwar_lambai')::numeric,
    (p_measurements->>'pancha')::numeric,
    p_note1, p_note2,
    (select id from pocket_types where code = p_pocket_type_code),
    (select id from bain_gala_types where code = p_bain_gala_type_code),
    (select id from collar_types where code = p_collar_type_code),
    (select id from daman_types where code = p_daman_type_code),
    (select id from button_types where code = p_button_type_code)
  ) returning id into v_skd_id;

  if p_style_flag_codes is not null then
    foreach v_flag_code in array p_style_flag_codes loop
      insert into order_style_flags (shalwar_kameez_detail_id, style_flag_id)
      values (v_skd_id, (select id from style_flag_catalog where code = v_flag_code));
    end loop;
  end if;

  if p_part_designs is not null then
    for v_part in select * from jsonb_array_elements(p_part_designs) loop
      insert into order_part_designs (shalwar_kameez_detail_id, part_type, size1, size2, design_no)
      values (
        v_skd_id,
        (v_part->>'part_type')::part_type_enum,
        nullif(v_part->>'size1', '')::numeric,
        nullif(v_part->>'size2', '')::numeric,
        nullif(v_part->>'design_no', '')::int
      );
    end loop;
  end if;

  return v_order_id;
end;
$$;
