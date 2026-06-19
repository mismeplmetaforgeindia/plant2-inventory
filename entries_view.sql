-- =============================================================================
-- Plant 2 — unified receipt history view for the GRN Entries page.
-- Unions grn_entries + transfer_entries, each joined to its fifo_batch so the
-- page can show/edit rack + status (which live on fifo_batches) alongside the
-- receipt fields. Run in the Supabase SQL editor.
-- =============================================================================
create or replace view v_entries as
select
  g.id                                   as entry_id,
  'grn_khatwad'::text                    as source_type,
  fb.id                                  as batch_id,
  g.rm_code,
  m.item_description,
  g.grn_date                             as entry_date,
  g.weight_kg,
  g.supplier,
  null::text                             as machine_no,
  g.grn_type,
  g.coil_no,
  fb.rack_number,
  fb.status,
  fb.qty_available,
  g.origin,
  g.created_at, g.updated_at, g.created_by, g.updated_by
from grn_entries g
left join fifo_batches fb on fb.source_type = 'grn_khatwad' and fb.source_id = g.id
left join material_master m using (rm_code)
union all
select
  t.id, 'plant1_to_plant2', fb.id,
  t.rm_code, m.item_description, t.transfer_date, t.weight_kg,
  null::text, t.machine_no, null::text, t.coil_no,
  fb.rack_number, fb.status, fb.qty_available, t.origin,
  t.created_at, t.updated_at, t.created_by, t.updated_by
from transfer_entries t
left join fifo_batches fb on fb.source_type = 'plant1_to_plant2' and fb.source_id = t.id
left join material_master m using (rm_code);

alter view v_entries set (security_invoker = true);
grant select on v_entries to anon;
