-- Credentials for the standalone customer-facing "tailor" module
-- (app/tailor/**). Entirely separate from admin_credentials — no signup
-- flow; rows are inserted manually via the Supabase table editor using a
-- bcrypt hash produced by `npm run hash-password`.
create table tailor_credentials (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- Only ever queried via the service-role client (app/api/auth/tailor-login),
-- same pattern as admin_credentials.
alter table tailor_credentials disable row level security;
