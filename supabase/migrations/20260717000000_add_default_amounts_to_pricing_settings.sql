-- Settings page can now also configure default Cloth / Shilling / Others
-- amounts. On the Shalwar Kameez order form, a typed value in one of those
-- boxes always wins; a blank box falls back to the default stored here
-- (0 = no default, behaves exactly as before).

alter table order_pricing_settings
  add column default_cloth_amount    numeric(10,2) not null default 0,
  add column default_shilling_amount numeric(10,2) not null default 0,
  add column default_others_amount   numeric(10,2) not null default 0;
