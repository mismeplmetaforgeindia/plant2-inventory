-- =============================================================================
-- Plant 2 — FIFO board view (Step 4, rev 2). Run in Supabase SQL editor.
-- Aging + FIFO order are based on the DATE ENCODED IN THE COIL NUMBER
-- (last 6 digits = YYMMDD, e.g. U4H-01270-260331 -> 2026-03-31), falling back
-- to the sheet receipt date when a coil has no valid date suffix.
-- =============================================================================

-- Parse the trailing -YYMMDD from a coil number -> date (null if absent/invalid).
create or replace function coil_date(ref text)
returns date language plpgsql immutable as $$
declare s text; y int; m int; d int;
begin
  s := substring(trim(coalesce(ref,'')) from '([0-9]{6})$');
  if s is null then return null; end if;
  y := 2000 + substr(s,1,2)::int;
  m := substr(s,3,2)::int;
  d := substr(s,5,2)::int;
  return make_date(y, m, d);           -- throws on impossible dates -> caught below
exception when others then
  return null;
end $$;

drop view if exists v_fifo;
create view v_fifo as
with base as (
  select fb.*, coil_date(fb.reference_no) as cdate
  from fifo_batches fb
)
select
  b.id,
  b.rm_code,
  m.item_description,
  b.source_type,
  case
    when b.source_type = 'plant1_to_plant2' then 'Plant 1→2'
    else coalesce(g.grn_type, 'GRN')
  end                                                  as source_label,
  b.reference_no,
  b.receipt_date,                                      -- date the row was entered/transferred
  b.cdate                                              as coil_date,   -- parsed from coil no (nullable)
  coalesce(b.cdate, b.receipt_date)                    as lot_date,    -- date used for aging/FIFO
  b.qty_received,
  b.qty_available,
  b.rack_number,
  b.status,
  (current_date - coalesce(b.cdate, b.receipt_date))   as aging_days,
  case
    when (current_date - coalesce(b.cdate, b.receipt_date)) <= 7  then '0-7'
    when (current_date - coalesce(b.cdate, b.receipt_date)) <= 15 then '8-15'
    when (current_date - coalesce(b.cdate, b.receipt_date)) <= 30 then '16-30'
    else '30+'
  end                                                  as aging_bucket,
  row_number() over (
    partition by b.rm_code
    order by coalesce(b.cdate, b.receipt_date) asc, b.created_at asc
  )                                                    as fifo_priority
from base b
left join material_master m using (rm_code)
left join grn_entries g
  on b.source_type = 'grn_khatwad' and b.source_id = g.id;

alter view v_fifo set (security_invoker = true);
grant select on v_fifo to anon;

-- Spot-check the coil parser:
--   select reference_no, coil_date(reference_no), receipt_date
--   from fifo_batches where reference_no like '%260331' limit 5;
