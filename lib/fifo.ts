import { supabase } from "./supabase";
import { FifoRow } from "./types";

// Supabase/PostgREST caps a single response at 1000 rows. Page through it.
export async function fetchAllFifo(): Promise<FifoRow[]> {
  const pageSize = 1000;
  let from = 0;
  const all: FifoRow[] = [];
  for (;;) {
    const { data, error } = await supabase
      .from("v_fifo")
      .select("*")
      .order("rm_code", { ascending: true })
      .order("fifo_priority", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const batch = (data ?? []) as FifoRow[];
    all.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

export const badges = (r: FifoRow) => ({
  oldest: r.fifo_priority === 1 && r.qty_available > 0,
  critical: r.aging_days >= 30 && r.qty_available > 0,
  ready: !!r.rack_number && r.qty_available > 0,
});
