-- Seeds confirmed image_path values for the style_flag_catalog codes that
-- have real images (public/kameez-shalwar-assets/), per client confirmation.
-- kaf_dboty, btn_dboty, no_lbl, 5_btn, 2_jeb, no_jeb still have no confirmed

-- image and are left null.
update style_flag_catalog set image_path = '/kameez-shalwar-assets/kajpatti/kajpatti.jpg' where code = 'kaj_patti';
update style_flag_catalog set image_path = '/kameez-shalwar-assets/shalwar-zip/zip.jpg' where code = 'shalwar_zip';
update style_flag_catalog set image_path = '/kameez-shalwar-assets/largebuttons/largebtns.jpg' where code = 'large_buttons';
