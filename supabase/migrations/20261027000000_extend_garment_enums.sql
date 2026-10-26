-- Tailor module: Waistcoat / Pant / Coat / Shirt order entry (step 1 of 3).
-- See docs/tailor-garments/02-database-design.md for the full model.
--
-- Only enum extensions live here, on purpose: Postgres forbids *using* a
-- freshly added enum value in the same transaction that added it, and the
-- next migration (20261027010000) seeds rows with 'pant'/'coat'/'shirt'.
-- Each migration file is its own transaction, so splitting them keeps
-- `alter type ... add value` and its first use apart.
--
-- Nothing is dropped or recreated, so existing Shalwar Kameez rows, columns
-- and functions are untouched.

-- garment_orders.garment_type: the order shell is already garment-agnostic
-- (tailor-schema-supabase.md §1); 'waistcoat' already exists.
alter type garment_type_enum add value if not exists 'pant';
alter type garment_type_enum add value if not exists 'coat';
alter type garment_type_enum add value if not exists 'shirt';

-- clients.order_type mirrors the garment a client was first registered under.
alter type order_type_enum add value if not exists 'pant';
alter type order_type_enum add value if not exists 'coat';
alter type order_type_enum add value if not exists 'shirt';

-- Shirt reuses the Shalwar Kameez style-flag vocabulary (kaf_dboty = the
-- shirt design's "Kuf Dubble Kaj", large_buttons, kaj_patti, 5_btn, no_lbl,
-- 2_jeb) and adds the three flags that only exist on a shirt.
alter type style_flag_code add value if not exists 'nokdar_tera';
alter type style_flag_code add value if not exists 'chak_asten';
alter type style_flag_code add value if not exists 'dobat';
