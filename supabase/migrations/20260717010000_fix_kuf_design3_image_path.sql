-- Kuf design 3's image was swapped in place under the original kaf3.jpg
-- filename, but Next's image-optimizer cache is keyed by URL (not file
-- content) and kept serving the old render indefinitely -- even in
-- incognito, since that cache lives server-side, not in the browser. Fixed
-- by renaming the file to kaf3-v2.jpg (a URL the cache had never seen) and
-- updating the picker's frontend list (lib/constants/shalwar-kameez.ts) to
-- match. design_catalog isn't read by the picker today, but its row for
-- this design still pointed at the old filename -- left stale, it would
-- silently reintroduce this same bug the moment anything does start
-- reading this table.
update design_catalog
set image_path = '/kameez-shalwar-assets/kuf/kaf3-v2.jpg'
where part_type = 'kuf' and design_no = 3;
