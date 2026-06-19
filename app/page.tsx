"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardRow, StockStatus, STATUS_ORDER } from "@/lib/types";
import { downloadCsv, timeAgo } from "@/lib/stock";
import Shell from "@/components/Shell";
import KpiCards from "@/components/KpiCards";
import InventoryTable, { SortKey } from "@/components/InventoryTable";

const REFRESH_MS = 60_000;

export default function DashboardPage() {
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number>(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("v_dashboard").select("*").limit(2000);
    if (error) setError(error.message);
    else { setRows((data ?? []) as DashboardRow[]); setError(null); setFetchedAt(Date.now()); }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  function onSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir(k === "rm_code" || k === "item_description" || k === "status" ? "asc" : "desc"); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let r = rows.filter((x) => {
      if (statusFilter !== "All" && x.status !== statusFilter) return false;
      if (q && !(x.rm_code.toLowerCase().includes(q) || (x.item_description ?? "").toLowerCase().includes(q))) return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      if (sortKey === "status") {
        const d = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        return sortDir === "asc" ? d : -d;
      }
      const av = a[sortKey], bv = b[sortKey];
      let d = 0;
      if (typeof av === "number" && typeof bv === "number") d = av - bv;
      else d = String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? d : -d;
    });
    return r;
  }, [rows, search, statusFilter, sortKey, sortDir]);

  const lastSync = useMemo(() => {
    const ts = rows.map((r) => r.synced_at).filter(Boolean).sort().slice(-1)[0] ?? null;
    return ts;
  }, [rows]);

  const syncLabel = loading && !rows.length ? "Loading…" : `Synced ${timeAgo(lastSync)}`;

  return (
    <Shell syncLabel={syncLabel} onRefresh={load} refreshing={loading}>
      {error && (
        <div className="mb-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "#dc2626", background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
          Couldn’t load data: {error}. Check that RLS read policies are applied and the anon key is set.
        </div>
      )}

      <KpiCards rows={rows} />

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search RM code or description…"
          className="h-8 w-full max-w-xs rounded-md border bg-transparent px-3 text-xs outline-none focus:border-[var(--header)]"
          style={{ borderColor: "var(--border)" }}
        />
        <div className="flex items-center gap-1">
          {(["All", ...STATUS_ORDER] as (StockStatus | "All")[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors"
              style={statusFilter === s
                ? { background: "var(--header)", color: "#fff" }
                : { color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <span>{filtered.length} of {rows.length}</span>
          <button
            onClick={() => downloadCsv(filtered)}
            className="rounded-md border px-2.5 py-1.5 font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderColor: "var(--border)" }}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-2.5">
        <InventoryTable rows={filtered} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
      </div>

      <p className="mt-2 text-[10px] text-[var(--muted)]">
        Reorder point = Peak ADC × Lead Time × Safety Factor. Status: Zero (≤0) · Low (below reorder point) · Overstock (above Max Level) · Inactive (no demand) · Safe (otherwise). Auto-refreshes every 60s.
      </p>
    </Shell>
  );
}
