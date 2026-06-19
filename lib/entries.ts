import { supabase } from "./supabase";
import { EntryRow } from "./types";

export async function fetchAllEntries(): Promise<EntryRow[]> {
  const pageSize = 1000;
  let from = 0;
  const all: EntryRow[] = [];
  for (;;) {
    const { data, error } = await supabase
      .from("v_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("entry_id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const batch = (data ?? []) as EntryRow[];
    all.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }
  return all;
}
