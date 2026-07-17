-- Client added a 5th Kuf design image (kaf5.png, note the .png extension --
-- everything else in this catalog is .jpg) and replaced kaf3's image file
-- in place (same filename/path, so its existing design_catalog row needs no
-- change). order_part_designs.design_no has an FK to
-- design_catalog(part_type, design_no) (see
-- 20260714000000_fix_garment_orders_keys_and_access.sql), so saving an
-- order with the new Kuf design 5 would fail that constraint without this.
--
-- Bazu designs 1 and 6 were dropped from the picker in the same client
-- request (lib/constants/shalwar-kameez.ts) but are deliberately NOT
-- removed here: the picker is a hardcoded frontend list, not driven by this
-- table, so nothing depends on deleting these rows, and doing so would risk
-- an FK conflict against any order that was already saved referencing them.
insert into design_catalog (part_type, design_no, image_path) values
  ('kuf', 5, '/kameez-shalwar-assets/kuf/kaf5.png');
