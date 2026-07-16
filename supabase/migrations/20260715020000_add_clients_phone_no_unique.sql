-- Every client's phone number must be unique (checked live data first --
-- no existing duplicates as of this migration, so this applies cleanly).
alter table clients
  add constraint clients_phone_no_unique unique (phone_no);
