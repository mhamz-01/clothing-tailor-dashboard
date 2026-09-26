-- Lock the admin-module tables down to server-side access only.
--
-- Until now RLS was disabled on these (tailors/customers/orders since
-- 001_initial.sql; admin_credentials was created by hand with RLS off), so
-- anyone holding the public anon key — which ships in the browser bundle —
-- could read/write them directly, including every admin's plaintext password.
--
-- The app no longer touches these tables with the anon key: the admin pages
-- go through the session-checked /api/admin/* routes, and login/logout/
-- superadmin already used the service-role key. The service role bypasses
-- RLS, so enabling it with NO policies denies anon/authenticated entirely
-- while leaving the app working.
--
-- Deploy the /api/admin/* code BEFORE running this, or the live dashboard
-- will fail to load until it's deployed.
--
-- Tailor-module (garment-order) tables are intentionally untouched.
alter table tailors enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table admin_credentials enable row level security;
