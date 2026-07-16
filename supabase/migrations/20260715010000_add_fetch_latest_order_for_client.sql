-- Client Lookup "old client" prefill: typing an existing Client No. should
-- pull that client's most recent order (measurements, style options, style
-- flags, part designs) back into the form, not just flag it as a duplicate.
--
-- One RPC doing all the joins server-side (rather than 4-5 chained
-- PostgREST round trips from the browser: clients -> garment_orders ->
-- shalwar_kameez_details -> order_style_flags/order_part_designs) keeps this
-- a single request when a tailor tabs through an existing Client No.
create or replace function fetch_latest_order_for_client(p_client_no text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
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
