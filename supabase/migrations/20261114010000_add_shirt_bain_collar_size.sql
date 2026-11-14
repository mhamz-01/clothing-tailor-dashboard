-- Shirt Bain/Gala + Collar sizes (same free-text scales as Shalwar Kameez). Written, not yet applied.
alter table shirt_details
  add column if not exists bain_size   text,
  add column if not exists collar_size text;

create or replace function create_shirt_order(
  p_client_no         text,
  p_client_name       text,
  p_phone_no          text,
  p_quantity          int,
  p_delivery_date     date,
  p_tailoring_amount  numeric,
  p_cloth_amount      numeric,
  p_shilling_amt      numeric,
  p_others_amt        numeric,
  p_advance_amt       numeric,
  p_details           jsonb,
  p_part_designs      jsonb
) returns bigint
language plpgsql
set search_path = public
as $$
declare
  v_order_id   bigint;
  v_detail_id  bigint;
begin
  v_order_id := create_garment_order_shell(
    'shirt', p_client_no, p_client_name, p_phone_no, p_quantity, p_delivery_date,
    p_tailoring_amount, p_cloth_amount, p_shilling_amt, p_others_amt, p_advance_amt
  );

  insert into shirt_details (
    order_id,
    lambai, lambai_2, chaati, chaati_2, bazu, bazu_2, teera, teera_2,
    collar, collar_2, kamar, kamar_2, daman, daman_2, note,
    bain_gala, bain_design_no, collar_type, collar_design_no, button_type, style_flags,
    bain_size, collar_size
  )
  select
    v_order_id,
    r.lambai, r.lambai_2, r.chaati, r.chaati_2, r.bazu, r.bazu_2, r.teera, r.teera_2,
    r.collar, r.collar_2, r.kamar, r.kamar_2, r.daman, r.daman_2, r.note,
    r.bain_gala, r.bain_design_no, r.collar_type, r.collar_design_no, r.button_type,
    coalesce(r.style_flags, '{}'),
    r.bain_size, r.collar_size
  from jsonb_populate_record(null::shirt_details, p_details) r
  returning id into v_detail_id;

  insert into shirt_part_designs (shirt_detail_id, part_type, size1, size2, design_no)
  select v_detail_id, p.part_type, nullif(p.size1, ''), nullif(p.size2, ''), p.design_no
  from jsonb_to_recordset(coalesce(p_part_designs, '[]'::jsonb))
    as p(part_type part_type_enum, size1 text, size2 text, design_no int);

  return v_order_id;
end;
$$;
