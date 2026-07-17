-- Bain/Gala and Collar had a "Design #" quick-pick dropdown (1-12) that was
-- never actually wired to a column -- create_shalwar_kameez_order didn't
-- accept it and fetch_latest_order_for_client didn't return it, so anything
-- picked there was silently lost. Bain/Gala and Collar also have no real
-- numbered "design" the way Bazu/Kuf/Button Patti/Jaib do (those open a
-- picker modal with actual design images) -- per client request this is a
-- plain Size value instead, saved as free text (not an enum) so its option
-- list can change later without another schema migration.
alter table shalwar_kameez_details
  add column bain_size   text,
  add column collar_size text;

drop function if exists create_shalwar_kameez_order;

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
        nullif(v_part->>'size1', '')::numeric,
        nullif(v_part->>'size2', '')::numeric,
        nullif(v_part->>'design_no', '')::int
      );
    end loop;
  end if;

  return v_order_id;
end;
$$;

create or replace function fetch_latest_order_for_client(p_client_no text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'order_id', go.order_id,
    'client_name', c.client_name,
    'phone_no', c.phone_no,
    'measurements', jsonb_build_object(
      'lambai', skd.lambai,
      'chaati', skd.chaati,
      'bazu', skd.bazu,
      'teera', skd.teera,
      'collar', skd.collar,
      'kamar', skd.kamar,
      'daman', skd.daman,
      'shalwar_lambai', skd.shalwar_lambai,
      'pancha', skd.pancha
    ),
    'note1', skd.note1,
    'note2', skd.note2,
    'pocket_type_code', pt.code,
    'bain_gala_type_code', bg.code,
    'collar_type_code', ct.code,
    'daman_type_code', dt.code,
    'button_type_code', bt.code,
    'bain_size', skd.bain_size,
    'collar_size', skd.collar_size,
    'style_flag_codes', (
      select coalesce(jsonb_agg(sfc.code), '[]'::jsonb)
      from order_style_flags osf
      join style_flag_catalog sfc on sfc.id = osf.style_flag_id
      where osf.shalwar_kameez_detail_id = skd.id
    ),
    'part_designs', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'part_type', opd.part_type,
        'size1', opd.size1,
        'size2', opd.size2,
        'design_no', opd.design_no
      )), '[]'::jsonb)
      from order_part_designs opd
      where opd.shalwar_kameez_detail_id = skd.id
    )
  )
  from clients c
  join garment_orders go on go.client_id = c.client_id
  join shalwar_kameez_details skd on skd.order_id = go.order_id
  left join pocket_types pt on pt.id = skd.pocket_type_id
  left join bain_gala_types bg on bg.id = skd.bain_gala_type_id
  left join collar_types ct on ct.id = skd.collar_type_id
  left join daman_types dt on dt.id = skd.daman_type_id
  left join button_types bt on bt.id = skd.button_type_id
  where c.client_no = upper(p_client_no)
  order by go.order_id desc
  limit 1;
$$;
