-- Tailor module: Waistcoat / Pant / Coat / Shirt order entry (step 3 of 3).
-- Atomic create + read functions. See docs/tailor-garments/03-api-and-queries.md.
--
-- Layout, per garment <g> in (waistcoat, pant, coat, shirt):
--   create_<g>_order(...)            write  - one transaction: client upsert + order shell + details
--   get_<g>_order(order_id)          read   - one order by Record No.
--   fetch_latest_<g>_order(client)   read   - the client's newest <g> order (prefill)
-- Shared building blocks (so the four garments never repeat SQL):
--   create_garment_order_shell(...)  client upsert + garment_orders insert + totals
--   garment_order_header(order_id)   shell + client as jsonb
--   latest_garment_order_id(...)     newest order id for client + garment (index-only on
--                                    idx_garment_orders_client_garment_latest)
--
-- Details are passed as one jsonb whose keys are the details-table column
-- names; jsonb_populate_record casts each value to its column type (numeric,
-- enum, array), so an invalid enum value or malformed number fails the whole
-- transaction instead of being stored.

-- =========================
-- Shared: client upsert + order shell
-- =========================
create or replace function create_garment_order_shell(
  p_garment_type      garment_type_enum,
  p_client_no         text,
  p_client_name       text,
  p_phone_no          text,
  p_quantity          int,
  p_delivery_date     date,
  p_tailoring_amount  numeric,
  p_cloth_amount      numeric,
  p_shilling_amt      numeric,
  p_others_amt        numeric,
  p_advance_amt       numeric
) returns bigint
language plpgsql
set search_path = public
as $$
declare
  v_client_id  bigint;
  v_total      numeric(10,2);
  v_order_id   bigint;
begin
  if p_quantity is null or p_quantity < 1 then
    raise exception 'Quantity must be at least 1';
  end if;
  if least(p_tailoring_amount, p_cloth_amount, p_shilling_amt, p_others_amt, p_advance_amt) < 0 then
    raise exception 'Amounts cannot be negative';
  end if;

  -- order_type records the garment the client was first registered under; a
  -- returning client keeps it (only name/phone are refreshed).
  insert into clients (client_no, client_name, phone_no, order_type)
  values (upper(p_client_no), p_client_name, p_phone_no, p_garment_type::text::order_type_enum)
  on conflict (client_no) do update
    set client_name = excluded.client_name,
        phone_no    = excluded.phone_no
  returning client_id into v_client_id;

  v_total := p_tailoring_amount + p_cloth_amount + p_shilling_amt + p_others_amt;

  insert into garment_orders (
    client_id, garment_type, quantity, delivery_date,
    tailoring_amount, cloth_amount, shilling_amt, others_amt,
    total_amt, advance_amt, balance_amt
  ) values (
    v_client_id, p_garment_type, p_quantity, p_delivery_date,
    p_tailoring_amount, p_cloth_amount, p_shilling_amt, p_others_amt,
    v_total, p_advance_amt, v_total - p_advance_amt
  ) returning order_id into v_order_id;

  return v_order_id;
end;
$$;

-- =========================
-- Shared: read helpers
-- =========================
create or replace function garment_order_header(p_order_id bigint)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'order_id',         go.order_id,
    'client_no',        c.client_no,
    'client_name',      c.client_name,
    'phone_no',         c.phone_no,
    'quantity',         go.quantity,
    'delivery_date',    go.delivery_date,
    'created_at',       go.created_at,
    'tailoring_amount', go.tailoring_amount,
    'cloth_amount',     go.cloth_amount,
    'shilling_amt',     go.shilling_amt,
    'others_amt',       go.others_amt,
    'total_amt',        go.total_amt,
    'advance_amt',      go.advance_amt,
    'balance_amt',      go.balance_amt
  )
  from garment_orders go
  join clients c on c.client_id = go.client_id
  where go.order_id = p_order_id;
$$;

create or replace function latest_garment_order_id(p_garment_type garment_type_enum, p_client_no text)
returns bigint
language sql
stable
set search_path = public
as $$
  select go.order_id
  from clients c
  join garment_orders go on go.client_id = c.client_id
  where c.client_no = upper(p_client_no)
    and go.garment_type = p_garment_type
  order by go.order_id desc
  limit 1;
$$;

-- =========================
-- WAISTCOAT
-- =========================
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

  insert into waistcoat_details (order_id, lambai, chaati, kamar, kandha, collar, hip, note, gala, shoulder)
  select v_order_id, r.lambai, r.chaati, r.kamar, r.kandha, r.collar, r.hip, r.note, r.gala, r.shoulder
  from jsonb_populate_record(null::waistcoat_details, p_details) r;

  return v_order_id;
end;
$$;

create or replace function get_waistcoat_order(p_order_id bigint)
returns jsonb
language sql
stable
set search_path = public
as $$
  select garment_order_header(d.order_id)
    || jsonb_build_object('details', to_jsonb(d) - 'id' - 'order_id' - 'created_at' - 'updated_at')
  from waistcoat_details d
  where d.order_id = p_order_id;
$$;

create or replace function fetch_latest_waistcoat_order(p_client_no text)
returns jsonb
language sql
stable
set search_path = public
as $$
  select get_waistcoat_order(latest_garment_order_id('waistcoat', p_client_no));
$$;

-- =========================
-- PANT
-- =========================
create or replace function create_pant_order(
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
    'pant', p_client_no, p_client_name, p_phone_no, p_quantity, p_delivery_date,
    p_tailoring_amount, p_cloth_amount, p_shilling_amt, p_others_amt, p_advance_amt
  );

  insert into pant_details (
    order_id, kamar, hip, lambai, pancha, gidri, goda, note,
    paloi, pancha_style, pocket, back_pockets, belt_width
  )
  select
    v_order_id, r.kamar, r.hip, r.lambai, r.pancha, r.gidri, r.goda, r.note,
    r.paloi, r.pancha_style, r.pocket, r.back_pockets, r.belt_width
  from jsonb_populate_record(null::pant_details, p_details) r;

  return v_order_id;
end;
$$;

create or replace function get_pant_order(p_order_id bigint)
returns jsonb
language sql
stable
set search_path = public
as $$
  select garment_order_header(d.order_id)
    || jsonb_build_object('details', to_jsonb(d) - 'id' - 'order_id' - 'created_at' - 'updated_at')
  from pant_details d
  where d.order_id = p_order_id;
$$;

create or replace function fetch_latest_pant_order(p_client_no text)
returns jsonb
language sql
stable
set search_path = public
as $$
  select get_pant_order(latest_garment_order_id('pant', p_client_no));
$$;

-- =========================
-- COAT
-- =========================
create or replace function create_coat_order(
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
    'coat', p_client_no, p_client_name, p_phone_no, p_quantity, p_delivery_date,
    p_tailoring_amount, p_cloth_amount, p_shilling_amt, p_others_amt, p_advance_amt
  );

  insert into coat_details (
    order_id, lambai, chaati, kamar, hip, aasteen, teera, half_back, note,
    gala, damn, style, buttons, chaak, shoulder
  )
  select
    v_order_id, r.lambai, r.chaati, r.kamar, r.hip, r.aasteen, r.teera, r.half_back, r.note,
    r.gala, r.damn, r.style, r.buttons, r.chaak, r.shoulder
  from jsonb_populate_record(null::coat_details, p_details) r;

  return v_order_id;
end;
$$;

create or replace function get_coat_order(p_order_id bigint)
returns jsonb
language sql
stable
set search_path = public
as $$
  select garment_order_header(d.order_id)
    || jsonb_build_object('details', to_jsonb(d) - 'id' - 'order_id' - 'created_at' - 'updated_at')
  from coat_details d
  where d.order_id = p_order_id;
$$;

create or replace function fetch_latest_coat_order(p_client_no text)
returns jsonb
language sql
stable
set search_path = public
as $$
  select get_coat_order(latest_garment_order_id('coat', p_client_no));
$$;

-- =========================
-- SHIRT (adds part designs)
-- =========================
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
    bain_gala, bain_design_no, collar_type, collar_design_no, button_type, style_flags
  )
  select
    v_order_id,
    r.lambai, r.lambai_2, r.chaati, r.chaati_2, r.bazu, r.bazu_2, r.teera, r.teera_2,
    r.collar, r.collar_2, r.kamar, r.kamar_2, r.daman, r.daman_2, r.note,
    r.bain_gala, r.bain_design_no, r.collar_type, r.collar_design_no, r.button_type,
    coalesce(r.style_flags, '{}')
  from jsonb_populate_record(null::shirt_details, p_details) r
  returning id into v_detail_id;

  insert into shirt_part_designs (shirt_detail_id, part_type, size1, size2, design_no)
  select v_detail_id, p.part_type, nullif(p.size1, ''), nullif(p.size2, ''), p.design_no
  from jsonb_to_recordset(coalesce(p_part_designs, '[]'::jsonb))
    as p(part_type part_type_enum, size1 text, size2 text, design_no int);

  return v_order_id;
end;
$$;

create or replace function get_shirt_order(p_order_id bigint)
returns jsonb
language sql
stable
set search_path = public
as $$
  select garment_order_header(d.order_id)
    || jsonb_build_object('details', to_jsonb(d) - 'id' - 'order_id' - 'created_at' - 'updated_at')
    || jsonb_build_object('part_designs', (
         select coalesce(jsonb_agg(jsonb_build_object(
                  'part_type', p.part_type,
                  'size1',     p.size1,
                  'size2',     p.size2,
                  'design_no', p.design_no
                )), '[]'::jsonb)
         from shirt_part_designs p
         where p.shirt_detail_id = d.id
       ))
  from shirt_details d
  where d.order_id = p_order_id;
$$;

create or replace function fetch_latest_shirt_order(p_client_no text)
returns jsonb
language sql
stable
set search_path = public
as $$
  select get_shirt_order(latest_garment_order_id('shirt', p_client_no));
$$;
