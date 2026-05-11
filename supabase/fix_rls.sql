-- Allow Admins and Officers to INSERT into inmates table
create policy "Staff can insert inmates" on inmates for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

-- Allow Admins and Officers to UPDATE inmates table
create policy "Staff can update inmates" on inmates for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

-- Allow Admins (only) to DELETE inmates
create policy "Admins can delete inmates" on inmates for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- INVENTORY POLICIES
-- Allow Admins and Officers to INSERT into inventory
create policy "Staff can insert inventory" on inventory for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

-- Allow Admins and Officers to UPDATE inventory
create policy "Staff can update inventory" on inventory for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

-- Allow Admins to DELETE inventory
create policy "Admins can delete inventory" on inventory for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- CELLS POLICIES
-- Allow all to view cells
create policy "Cells viewable by everyone" on cells for select using (true);

-- Allow Admins and Officers to INSERT into cells
create policy "Staff can insert cells" on cells for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

-- Allow Admins and Officers to UPDATE cells
create policy "Staff can update cells" on cells for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'officer'))
);

-- Allow Admins to DELETE cells
create policy "Admins can delete cells" on cells for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
