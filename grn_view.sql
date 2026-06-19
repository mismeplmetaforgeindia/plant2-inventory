-- =============================================================================
-- Plant 2 — unified GRN/transfer entries view (Step 5). Run after schema.sql.
-- One row per receipt (purchase GRN + Plant 1->2 transfer), joined to its
-- operational fifo_batch for rack / status. origin = 'sheet' | 'manual'.
-- =============================================================================
create or replace view v_grn as
select 'grn'::text as kind, g.id,
  g.grn_date as doc_date, g.rm_code, g.plant,
  g.weight_kg, g.supplier, null::text as machine_no,
  g.grn_type, g.coil_no, g.heat_no, g.grade_size,
  g.origin, g.created_at, g.updated_at, g.created_by, g.updated_by,
  fb.id as batch_id, fb.rack_number, fb.status, fb.qty_available
from grn_entries g
left join fifo_batches fb on fb.source_type='grn_khatwad' and fb.source_id=g.id
union all
select 'transfer'::text, t.id,
  t.transfer_date, t.rm_code, t.plant,
  t.weight_kg, null::text, t.machine_no,
  'Plant 1→2'::text, t.coil_no, null::text, null::text,
  t.origin, t.created_at, t.updated_at, t.created_by, t.updated_by,
  fb.id, fb.rack_number, fb.status, fb.qty_available
from transfer_entries t
left join fifo_batches fb on fb.source_type='plant1_to_plant2' and fb.source_id=t.id;

alter view v_grn set (security_invoker = true);
grant select on v_grn to anon;
