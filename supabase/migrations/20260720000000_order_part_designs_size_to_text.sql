-- order_part_designs.size1/size2 were numeric(5,2), which can only ever
-- hold a single plain number -- but Bazu/Kuf/Button Patti's size pickers
-- offer fraction values like "1 1/4", and Jaib's size1 picker offers
-- dimension-pair values like "4x4 1/2" or "4 1/2 x 5" (see
-- JAIB_SIZE1_OPTIONS in lib/constants/shalwar-kameez.ts). Saving one of
-- those truncated it down to whatever plain leading number the ::numeric
-- cast could parse (e.g. "1 1/4" -> 1), and that truncated value is all
-- that came back on re-fetch. shalwar_kameez_details.bain_size/collar_size
-- hit this same class of problem already and were made `text` for exactly
-- this reason (see 20260716040000_add_bain_collar_size.sql) -- doing the
-- same here. Nothing in the app ever sums/averages/range-filters these
-- values, so there's no numeric-column benefit being given up.
alter table order_part_designs
  alter column size1 type text using size1::text,
  alter column size2 type text using size2::text;

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
  p_bain_size             text,
  p_collar_size           text,
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
    pocket_type_id, bain_gala_type_id, collar_type_id, daman_type_id, button_type_id,
    bain_size, collar_size
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
    (select id from button_types where code = p_button_type_code),
    p_bain_size, p_collar_size
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
        nullif(v_part->>'size1', ''),
        nullif(v_part->>'size2', ''),
        nullif(v_part->>'design_no', '')::int
      );
    end loop;
  end if;

  return v_order_id;
end;
$$;
