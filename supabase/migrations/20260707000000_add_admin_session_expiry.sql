-- Tracks the expiry of an admin's current login session (auth_token JWT),
-- separate from expires_at which tracks membership/account validity.
alter table admin_credentials
  add column if not exists session_expires_at timestamptz;
