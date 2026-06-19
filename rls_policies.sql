-- =============================================================================
-- Plant 2 inventory — RLS read policies for the dashboard (Step 3)
-- Run once in the Supabase SQL editor, AFTER schema.sql.
-- Effect: the browser (anon key) can READ everything, but cannot write.
--         The sync keeps working because service_role bypasses RLS.
--         Writes (GRN CRUD) will be added server-side in Step 5.
-- =============================================================================

-- 1. Make the dashboard view respect the caller's RLS (so anon policies apply
--    instead of the view silently running with owner privileges).
alter view v_dashboard set (security_invoker = true);

-- 2. Enable RLS on every table.
alter table material_master     enable row level security;
alter table inventory_snapshot  enable row level security;
alter table grn_entries         enable row level security;
alter table transfer_entries    enable row level security;
alter table fifo_batches        enable row level security;
alter table stock_movements     enable row level security;
alter table rack_locations      enable row level security;
alter table sync_logs           enable row level security;

-- 3. Anon read-only policies (internal read dashboard; no row restriction).
do $$
declare t text;
begin
  foreach t in array array[
    'material_master','inventory_snapshot','grn_entries','transfer_entries',
    'fifo_batches','stock_movements','rack_locations','sync_logs'
  ] loop
    execute format('drop policy if exists anon_read on %I;', t);
    execute format('create policy anon_read on %I for select to anon using (true);', t);
  end loop;
end $$;

-- 4. Grants so PostgREST exposes the relations to the anon role.
grant usage on schema public to anon;
grant select on all tables in schema public to anon;   -- includes the v_dashboard view
grant select on v_dashboard to anon;

-- NOTE: no insert/update/delete is granted to anon, so the browser is read-only.
-- Quick check (run as needed): should return ~199
--   select count(*) from v_dashboard;
