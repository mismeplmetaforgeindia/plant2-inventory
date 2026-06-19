-- =============================================================================
-- Plant 2 — FIFO board view (Step 4). Run in Supabase SQL editor after schema.sql.
-- One row per inbound lot, oldest-first, with aging, bucket, and FIFO priority.
-- =============================================================================
create or replace view v_fifo as
select
  fb.id,
  fb.rm_code,
  m.item_description,
  fb.source_type,
  case
    when fb.source_type = 'plant1_to_plant2' then 'Plant 1→2'
    else coalesce(g.grn_type, 'GRN')           -- 'GRN' (purchase) or '57F4' (job-work)
  end                                            as source_label,
  fb.reference_no,
  fb.receipt_date,
  fb.qty_received,
  fb.qty_available,
  fb.rack_number,
  fb.status,
  (current_date - fb.receipt_date)               as aging_days,
  case
    when (current_date - fb.receipt_date) <= 7  then '0-7'
    when (current_date - fb.receipt_date) <= 15 then '8-15'
    when (current_date - fb.receipt_date) <= 30 then '16-30'
    else '30+'
  end                                            as aging_bucket,
  -- FIFO priority: oldest lot for each RM is 1 (ties broken by ingest order)
  row_number() over (
    partition by fb.rm_code
    order by fb.receipt_date asc, fb.created_at asc
  )                                              as fifo_priority
from fifo_batches fb
left join material_master m using (rm_code)
left join grn_entries g
  on fb.source_type = 'grn_khatwad' and fb.source_id = g.id;

-- Respect caller RLS + expose to the browser (anon) read-only.
alter view v_fifo set (security_invoker = true);
grant select on v_fifo to anon;

-- Quick check: should return ~2054
--   select count(*) from v_fifo;
