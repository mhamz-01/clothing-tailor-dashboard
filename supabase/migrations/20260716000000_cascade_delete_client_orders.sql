-- Deleting a client (see Add Client modal's per-row Delete, add-client-modal.tsx)
-- previously failed outright once they had any order on file, because
-- garment_orders.client_id was `on delete restrict`
-- (20260712000000_create_garment_orders_schema.sql). Switched to cascade so
-- deleting a client also removes their garment_orders rows -- which in turn
-- already cascade down to shalwar_kameez_details, order_part_designs, and
-- order_style_flags -- instead of blocking the delete.
alter table garment_orders
  drop constraint garment_orders_client_id_fkey,
  add constraint garment_orders_client_id_fkey
    foreign key (client_id) references clients(client_id) on delete cascade;
