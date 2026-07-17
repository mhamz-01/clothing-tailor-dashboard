-- Adds "Half Bain Gol" as a selectable Bain/Gala style. The UI
-- (BAIN_GALA_OPTIONS in lib/constants/shalwar-kameez.ts) already offers it
-- with value 'half_bain_gol', but bain_gala_type_code had no such enum
-- value, so create_shalwar_kameez_order was rejecting the save outright
-- once a tailor picked it.
--
-- "none" was intentionally left alone here (dropped from the UI's options
-- list only, per prior conversation -- removing it from the DB risked a
-- foreign-key failure against any already-saved order and wasn't asked
-- for), so this only adds the one new value rather than recreating the
-- enum without "none".
--
-- Uses the drop/recreate pattern (like 20260714010000's collar_type_code
-- change) instead of `alter type ... add value` -- a plain ADD VALUE can't
-- be used in the same transaction it's added in (Postgres restriction), and
-- this migration needs to both add the value and insert a catalog row using
-- it in one shot.
drop function if exists create_shalwar_kameez_order;

alter table bain_gala_types alter column code type text using code::text;
drop type bain_gala_type_code;
create type bain_gala_type_code as enum ('gool_bain','sida_bain','half_bain','gol_gala','none','half_bain_gol');
alter table bain_gala_types alter column code type bain_gala_type_code using code::bain_gala_type_code;

insert into bain_gala_types (code, image_path) values
  ('half_bain_gol', '/kameez-shalwar-assets/bain/half-bain-gol.png');

-- Recreate the RPC (unchanged body -- bain_gala_type_code's new value flows
-- through automatically once the parameter type exists again).
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
