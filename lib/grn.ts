import { supabase } from "./supabase";
import { GrnRow } from "./types";

export async function fetchAllGrn(): Promise<GrnRow[]> {
  const pageSize = 1000;
  let from = 0;
  const all: GrnRow[] = [];
  for (;;) {
    const { data, error } = await supabase
      .from("v_grn")
      .select("*")
      .order("doc_date", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const b = (data ?? []) as GrnRow[];
    all.push(...b);
    if (b.length < pageSize) break;
    from += pageSize;
  }
  return all;
}
