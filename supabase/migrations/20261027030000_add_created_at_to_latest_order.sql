-- Client Lookup now shows the client's last order date ("Last Order" in the
-- client strip), so fetch_latest_order_for_client also returns the order's
-- created_at -- the order's Book Date. Same body as
-- 20260726000000_add_extra_measurement_numbers.sql plus that one key. The
-- Waistcoat/Pant/Coat/Shirt fetch_latest_<g>_order functions already return
-- created_at through garment_order_header.

create or replace function fetch_latest_order_for_client(p_client_no text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'order_id', go.order_id,
    'created_at', go.created_at,
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
    'extra_no1', skd.extra_no1,
    'extra_no2', skd.extra_no2,
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
