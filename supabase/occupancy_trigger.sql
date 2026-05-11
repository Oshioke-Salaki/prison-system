-- Function to update cell occupancy
create or replace function update_cell_occupancy() returns trigger as $$
begin
  -- Handle content for INSERT (increment new cell)
  if (TG_OP = 'INSERT') then
    if (NEW.cell_id is not null) then
      update cells set current_occupancy = current_occupancy + 1 where id = NEW.cell_id;
    end if;
  end if;

  -- Handle DELETE (decrement old cell)
  if (TG_OP = 'DELETE') then
    if (OLD.cell_id is not null) then
      update cells set current_occupancy = current_occupancy - 1 where id = OLD.cell_id;
    end if;
  end if;

  -- Handle UPDATE (decrement old, increment new)
  if (TG_OP = 'UPDATE') then
    -- If cell changed
    if (OLD.cell_id is distinct from NEW.cell_id) then
      -- Decrement old if it existed
      if (OLD.cell_id is not null) then
        update cells set current_occupancy = current_occupancy - 1 where id = OLD.cell_id;
      end if;
      -- Increment new if it exists
      if (NEW.cell_id is not null) then
        update cells set current_occupancy = current_occupancy + 1 where id = NEW.cell_id;
      end if;
    end if;
  end if;

  return null;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to allow re-running
drop trigger if exists on_inmate_cell_change on inmates;

-- Create Trigger
create trigger on_inmate_cell_change
after insert or update of cell_id or delete on inmates
for each row execute procedure update_cell_occupancy();
