-- Phone numbers are no longer required to be unique per client -- a phone
-- can be shared across multiple client records (e.g. a family booking under
-- separate Client Nos). Client No remains the only unique identity (see
-- 20260712000000_create_garment_orders_schema.sql). Order-sheet phone/name
-- search now shows a picker when more than one client matches instead of
-- assuming a single owner per phone number.
alter table clients
  drop constraint clients_phone_no_unique;
