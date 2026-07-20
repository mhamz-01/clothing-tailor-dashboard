-- style_flag_catalog is missing its '5_btn' row on the live DB (confirmed
-- via `select code from style_flag_catalog` returning only 8 of the 9
-- style_flag_code enum values -- 20260714000000_fix_garment_orders_keys_
-- and_access.sql's seed insert should have included it but didn't land).
-- create_shalwar_kameez_order looks up each checked style flag's id by
-- code (`select id from style_flag_catalog where code = v_flag_code`);
-- with no '5_btn' row, that lookup returns null for the Button Patti
-- modal's "5 Button" checkbox, and the order_style_flags insert fails its
-- not-null constraint on style_flag_id -- exactly the "works on the first
-- save, breaks once 5 Btn gets checked on an edit" bug reported.
insert into style_flag_catalog (code)
values ('5_btn')
on conflict (code) do nothing;
