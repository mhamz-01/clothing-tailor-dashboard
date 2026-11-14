-- Waistcoat "Fancy Button" option (yes / no). Written, not yet applied.
alter table waistcoat_details
  add column if not exists fancy_button text
  check (fancy_button in ('yes', 'no'));

create or replace function create_waistcoat_order(
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
  p_details           jsonb
) returns bigint
language plpgsql
set search_path = public
as $$
declare
  v_order_id bigint;
begin
  v_order_id := create_garment_order_shell(
    'waistcoat', p_client_no, p_client_name, p_phone_no, p_quantity, p_delivery_date,
    p_tailoring_amount, p_cloth_amount, p_shilling_amt, p_others_amt, p_advance_amt
  );

  insert into waistcoat_details (order_id, lambai, chaati, kamar, kandha, collar, hip, note, gala, shoulder, fancy_button)
  select v_order_id, r.lambai, r.chaati, r.kamar, r.kandha, r.collar, r.hip, r.note, r.gala, r.shoulder, r.fancy_button
  from jsonb_populate_record(null::waistcoat_details, p_details) r;

  return v_order_id;
end;
$$;
