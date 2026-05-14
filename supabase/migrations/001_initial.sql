create extension if not exists "uuid-ossp";

-- Tailors table
create table tailors (
  id uuid default uuid_generate_v4() primary key,
  tailor_ref_id text unique not null,
  name text not null,
  phone text not null,
  skills text,
  created_at timestamptz default now()
);

-- Customers table
create table customers (
  id uuid default uuid_generate_v4() primary key,
  customer_ref_id text unique not null,
  name text not null,
  phone text not null,
  address text,
  created_at timestamptz default now()
);

-- Orders table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_ref_id text not null references customers(customer_ref_id) on delete cascade,
  tailor_id uuid references tailors(id) on delete set null,
  due_date date not null,
  status text not null default 'assigned' check (status in ('assigned', 'delivered')),
  created_at timestamptz default now(),
  delivered_at timestamptz
);

-- RLS off for single admin panel
alter table tailors disable row level security;
alter table customers disable row level security;
alter table orders disable row level security;
