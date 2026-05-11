-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Define User Roles
create type user_role as enum ('admin', 'officer', 'inmate');

-- PROFILES (Links to Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role user_role default 'inmate',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CELLS
create table cells (
  id uuid default uuid_generate_v4() primary key,
  block_name text not null,
  cell_number text not null,
  capacity int default 2,
  current_occupancy int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(block_name, cell_number)
);

-- INMATES
create table inmates (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references profiles(id) on delete set null, -- Optional link if they have kiosk access
  inmate_number text unique not null,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  offense text,
  sentence_start_date date,
  sentence_end_date date,
  cell_id uuid references cells(id),
  photo_url text,
  status text default 'active', -- active, released, transferred
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WALLETS
create table wallets (
  id uuid default uuid_generate_v4() primary key,
  inmate_id uuid references inmates(id) on delete cascade unique,
  balance decimal(10, 2) default 0.00,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WALLET TRANSACTIONS
create type transaction_type as enum ('deposit', 'purchase', 'withdrawal');
create table wallet_transactions (
  id uuid default uuid_generate_v4() primary key,
  wallet_id uuid references wallets(id) on delete cascade,
  amount decimal(10, 2) not null,
  type transaction_type not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVENTORY (Prison Store)
create table inventory (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  stock_quantity int default 0,
  category text,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REQUESTS
create type request_type as enum ('food', 'medical', 'education', 'item', 'visit', 'other');
create type request_status as enum ('pending', 'approved', 'rejected', 'completed');

create table requests (
  id uuid default uuid_generate_v4() primary key,
  inmate_id uuid references inmates(id) on delete cascade,
  type request_type not null,
  subject text not null,
  description text,
  status request_status default 'pending',
  admin_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Setup
alter table profiles enable row level security;
alter table inmates enable row level security;
alter table cells enable row level security;
alter table wallets enable row level security;
alter table wallet_transactions enable row level security;
alter table inventory enable row level security;
alter table requests enable row level security;

-- POLICIES (Simplified for initial setup - refine as needed)

-- Profiles: Users can read their own profile. Admins/Officers can read all.
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Inmates: Admins/Officers view all. Inmates view themselves (via profile_id).
create policy "Staff view all inmates" on inmates for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);
create policy "Inmates view own record" on inmates for select using (
  profile_id = auth.uid()
);

-- Requests: Inmates create/view own. Staff view/update all.
create policy "Inmates can create requests" on requests for insert with check (
  exists (select 1 from inmates where id = inmate_id and profile_id = auth.uid())
);
create policy "Inmates view own requests" on requests for select using (
  exists (select 1 from inmates where id = inmate_id and profile_id = auth.uid())
);
create policy "Staff manage requests" on requests for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

-- Inventory: Viewable by all active users
create policy "Inventory viewable by all" on inventory for select using (true);

-- Functions & Triggers

-- Auto-create profile on signup (Optional, handled by Supabase Auth usually but good to have)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'inmate'); -- Default to inmate, admin changes later
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
