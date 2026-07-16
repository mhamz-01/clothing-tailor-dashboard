-- Pricing/settings page (gear icon on /tailor/categories, see
-- app/tailor/(portal)/settings/page.tsx) lets the tailor configure:
-- per-button-type prices, a base Tailoring Amt, and a default delivery
-- turnaround (days from Book Date). The Shalwar Kameez order form reads
-- these to compute Tailoring Amt -- (base + selected button's price) *
-- Suit Qty, read-only there -- and to default Delivery Date, while still
-- letting the tailor hand-edit Delivery Date per order (see
-- use-shalwar-kameez-form.ts). Shilling Amt is NOT here -- it's a plain
-- tailor-entered field on the order form itself, same as Cloth/Others Amt.

alter table button_types add column price numeric(10,2) not null default 0;

-- Single-row settings table, same pattern as record_counter above.
create table order_pricing_settings (
  id                        smallint primary key default 1,
  base_tailoring_amount     numeric(10,2) not null default 0,
  delivery_turnaround_days  int not null default 15,
  updated_at                timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into order_pricing_settings (id) values (1);

create trigger trg_order_pricing_settings_updated_at
before update on order_pricing_settings
for each row execute function set_updated_at();

-- Matches the rest of this schema: no Supabase Auth session exists in this
-- app (custom cookie/JWT, see 20260714000000_fix_garment_orders_keys_and_access.sql
-- item 1), so RLS stays off and the app's own session gating protects writes.
alter table order_pricing_settings disable row level security;
