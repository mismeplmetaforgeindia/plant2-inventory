-- =============================================================================
-- Plant 2 — FIFO board view (rev 3). Run in Supabase SQL editor.
-- Coil-date parser matches the Khatwad HTML tool: take the LAST run of digits
-- in the coil number, use its first 6 as YYMMDD (handles e.g. 26060603->260606),
-- validate year 2022-2027, fall back to receipt date when no valid coil date.
-- =============================================================================
create or replace function coil_date(ref text)
returns date language plpgsql immutable as $$
declare arr text[]; last text; cand text; y int; m int; d int;
begin
  if ref is null then return null; end if;
  select array_agg(x[1]) into arr from regexp_matches(ref, '[0-9]+', 'g') as x;
  if arr is null then return null; end if;
  last := arr[array_length(arr,1)];
  if length(last) >= 6 then cand := substr(last,1,6); else return null; end if;
  y := substr(cand,1,2)::int; m := substr(cand,3,2)::int; d := substr(cand,5,2)::int;
  if not (y between 22 and 27 and m between 1 and 12 and d between 1 and 31) then return null; end if;
  return make_date(2000 + y, m, d);
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
  b.id, b.rm_code, m.item_description, b.source_type,
  case when b.source_type = 'plant1_to_plant2' then 'Plant 1→2'
       else coalesce(g.grn_type, 'GRN') end                as source_label,
  b.reference_no, b.receipt_date,
  b.cdate                                                   as coil_date,
  coalesce(b.cdate, b.receipt_date)                         as lot_date,
  b.qty_received, b.qty_available, b.rack_number, b.status,
  (current_date - coalesce(b.cdate, b.receipt_date))        as aging_days,
  case
    when (current_date - coalesce(b.cdate, b.receipt_date)) <= 7  then '0-7'
    when (current_date - coalesce(b.cdate, b.receipt_date)) <= 15 then '8-15'
    when (current_date - coalesce(b.cdate, b.receipt_date)) <= 30 then '16-30'
    else '30+'
  end                                                       as aging_bucket,
  row_number() over (partition by b.rm_code
    order by coalesce(b.cdate, b.receipt_date) asc, b.created_at asc) as fifo_priority
from base b
left join material_master m using (rm_code)
left join grn_entries g on b.source_type = 'grn_khatwad' and b.source_id = g.id;

alter view v_fifo set (security_invoker = true);
grant select on v_fifo to anon;
