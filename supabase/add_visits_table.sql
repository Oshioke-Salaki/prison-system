-- Create Visits Table
create table if not exists visits (
  id uuid default uuid_generate_v4() primary key,
  inmate_id uuid references inmates(id) on delete cascade,
  visitor_name text not null,
  visit_date date not null,
  visit_time time not null,
  status text default 'planned', -- planned, completed, cancelled
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table visits enable row level security;

-- Policies
create policy "Staff view all visits" on visits for select using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

create policy "Staff manage visits" on visits for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

create policy "Inmates view own visits" on visits for select using (
  exists (select 1 from inmates where id = inmate_id and profile_id = auth.uid())
);
