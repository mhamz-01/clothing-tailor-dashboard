-- Adds the missing "collar" collar_type_code value and seeds confirmed
-- image_path values for pocket/bain-gala/collar/daman catalogs.
--
-- collar_type_code only had 4 values (american_cut, english_cut, french_cut,
-- none), but the UI's COLLAR_OPTIONS (lib/constants/shalwar-kameez.ts) has a
-- 5th option "collar" that was assumed to be a stray/duplicate UI entry.
-- Confirmed while mapping real images (public/kameez-shalwar-assets/collar/
-- collor1-4.jpg) that it's a genuine 5th style with its own image
-- (collor3.jpg) -- not a UI bug. Adding it to the enum.
--
-- pocket_type_code and bain_gala_type_code/daman_type_code enums are
-- unchanged; only their catalog rows' image_path values are being filled in
-- now that the code<->file mapping has been confirmed (unlike button_types
-- and most style_flag_catalog codes, which still have no confirmed images).

-- =========================
-- Add "collar" to collar_type_code
-- =========================
-- collar_type_code is used by collar_types.code and by
-- create_shalwar_kameez_order()'s parameter list -- drop the function first
-- (no overloads exist, so no arg list needed), convert the column to text,
-- recreate the enum, convert back. Table has only 4 rows and nothing in the
-- app has ever queried it, so this is a safe in-place structural change.
drop function if exists create_shalwar_kameez_order;

alter table collar_types alter column code type text using code::text;
drop type collar_type_code;
create type collar_type_code as enum ('american_cut','english_cut','french_cut','collar','none');
alter table collar_types alter column code type collar_type_code using code::collar_type_code;

insert into collar_types (code) values ('collar');

-- =========================
-- Seed confirmed image paths (Option A: static files under public/, see
-- earlier conversation -- images never change, so no Supabase Storage needed)
-- =========================
update bain_gala_types set image_path = '/kameez-shalwar-assets/bain/gool_bain.jpg' where code = 'gool_bain';
update bain_gala_types set image_path = '/kameez-shalwar-assets/bain/sida_bain.jpg' where code = 'sida_bain';
update bain_gala_types set image_path = '/kameez-shalwar-assets/bain/half_bain.jpg' where code = 'half_bain';
update bain_gala_types set image_path = '/kameez-shalwar-assets/bain/gool_gala.jpg' where code = 'gol_gala';

update daman_types set image_path = '/kameez-shalwar-assets/daman/kurta.jpg' where code = 'qurta';
update daman_types set image_path = '/kameez-shalwar-assets/daman/sidadaman.jpg' where code = 'sida_daman';

update pocket_types set image_path = '/kameez-shalwar-assets/s-pocket/spocket1.jpg' where code = '1_side_pocket';
update pocket_types set image_path = '/kameez-shalwar-assets/s-pocket/spocket2.jpg' where code = '2_side_pocket';

update collar_types set image_path = '/kameez-shalwar-assets/collar/collor4.jpg' where code = 'american_cut';
update collar_types set image_path = '/kameez-shalwar-assets/collar/collor2.jpg' where code = 'english_cut';
update collar_types set image_path = '/kameez-shalwar-assets/collar/collor1.jpg' where code = 'french_cut';
update collar_types set image_path = '/kameez-shalwar-assets/collar/collor3.jpg' where code = 'collar';

-- =========================
-- Recreate the RPC (unchanged body, just re-created after the drop above --
-- collar_type_code's new "collar" value now flows through automatically).
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
