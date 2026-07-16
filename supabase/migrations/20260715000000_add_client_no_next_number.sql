-- Client No. auto-numbering (client-lookup-section.tsx): the tailor picks the
-- letter, the number should auto-suggest the next unused one for that letter
-- (A-1, A-2, A-3 taken -> A-4 suggested; B-1, B-2 taken -> B-3 suggested).
--
-- client_no has always been enforced as `<letter>-<digits>` at the app layer
-- (CLIENT_NO_PATTERN in lib/constants/shalwar-kameez.ts), but never at the DB
-- layer. No rows have ever violated that shape (clients has only ever been
-- written through create_shalwar_kameez_order, which takes app-validated
-- input), so adding the constraint here is safe.
alter table clients
  add constraint clients_client_no_format check (client_no ~ '^[A-Za-z]-[0-9]+$');

-- Generated columns split the letter/number once at write time instead of
-- parsing client_no on every lookup, so the index below can be an index-only
-- scan.
alter table clients
  add column client_no_letter text generated always as (upper(split_part(client_no, '-', 1))) stored,
  add column client_no_number integer generated always as (split_part(client_no, '-', 2)::integer) stored;

-- Descending on the number so "highest number for this letter" is the first
-- row under the matching letter -- O(log n) index-only scan via the LIMIT 1
-- below, regardless of table size.
create index idx_clients_letter_number on clients (client_no_letter, client_no_number desc);

create or replace function next_client_number(p_letter text)
returns integer
language sql
stable
as $$
  select coalesce(
    (select client_no_number
     from clients
     where client_no_letter = upper(p_letter)
     order by client_no_number desc
     limit 1),
    0
  ) + 1;
$$;
