"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FifoRow, BUCKETS, AgingBucket } from "@/lib/types";
import { fetchAllFifo } from "@/lib/fifo";
import { fmt, fmtKg, timeAgo } from "@/lib/stock";
import Shell from "@/components/Shell";
import FifoBoard from "@/components/FifoBoard";
import FifoTable from "@/components/FifoTable";

const REFRESH_MS = 120_000;
type View = "board" | "table";

function Kpi({ label, value, accent, sub }: { label: string; value: string; accent?: string; sub?: string }) {
  return (
    <div className="rounded-lg border px-3.5 py-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums" style={{ color: accent ?? "var(--text)" }}>{value}</div>
      {sub && <div className="text-[10px] text-[var(--muted)]">{sub}</div>}
    </div>
  );
}

export default function FifoPage() {
  const [rows, setRows] = useState<FifoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<View>("table");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<string>("All");
  const [bucket, setBucket] = useState<AgingBucket | "All">("All");
  const [availOnly, setAvailOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchAllFifo()); setError(null); }
    catch (e: any) { setError(e?.message ?? "load failed"); }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const sources = useMemo(() => ["All", ...Array.from(new Set(rows.map((r) => r.source_label)))], [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (source !== "All" && r.source_label !== source) return false;
      if (bucket !== "All" && r.aging_bucket !== bucket) return false;
      if (availOnly && r.qty_available <= 0) return false;
      if (q && !(r.rm_code.toLowerCase().includes(q) || (r.item_description ?? "").toLowerCase().includes(q) || (r.reference_no ?? "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, search, source, bucket, availOnly]);

  const kpi = useMemo(() => {
    const avail = rows.reduce((s, r) => s + (r.qty_available || 0), 0);
    const critical = rows.filter((r) => r.aging_days >= 30 && r.qty_available > 0).length;
    const pendingRack = rows.filter((r) => !r.rack_number && r.qty_available > 0).length;
    return { lots: rows.length, avail, critical, pendingRack };
  }, [rows]);

  const syncLabel = loading && !rows.length ? "Loading…" : `${rows.length} lots · ${timeAgo(new Date().toISOString())}`;

  return (
    <Shell active="/fifo" title="FIFO Board" syncLabel={loading ? "Loading…" : `${kpi.lots} lots`} onRefresh={load} refreshing={loading}>
      {error && (
        <div className="mb-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "#dc2626", background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
          Couldn’t load FIFO data: {error}. Make sure <code>fifo_view.sql</code> has been run in Supabase.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi label="Total Lots" value={fmt(kpi.lots)} sub="GRN + transfers" />
        <Kpi label="Available Stock" value={fmtKg(kpi.avail)} accent="var(--header)" sub="across all lots" />
        <Kpi label="Critical Aging" value={fmt(kpi.critical)} accent={kpi.critical ? "#dc2626" : undefined} sub="30+ days, still available" />
        <Kpi label="Pending Rack" value={fmt(kpi.pendingRack)} accent={kpi.pendingRack ? "#ea8a0c" : undefined} sub="not yet assigned" />
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search RM code, description, coil…"
          className="h-8 w-full max-w-xs rounded-md border bg-transparent px-3 text-xs outline-none focus:border-[var(--header)]"
          style={{ borderColor: "var(--border)" }}
        />
        <select value={source} onChange={(e) => setSource(e.target.value)} className="h-8 rounded-md border bg-transparent px-2 text-xs outline-none" style={{ borderColor: "var(--border)" }}>
          {sources.map((s) => <option key={s} value={s}>{s === "All" ? "All sources" : s}</option>)}
        </select>
        <div className="flex items-center gap-1">
          {(["All", ...BUCKETS] as (AgingBucket | "All")[]).map((b) => (
            <button key={b} onClick={() => setBucket(b)}
              className="rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors"
              style={bucket === b ? { background: "var(--header)", color: "#fff" } : { color: "var(--muted)", border: "1px solid var(--border)" }}>
              {b === "All" ? "All ages" : b}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <input type="checkbox" checked={availOnly} onChange={(e) => setAvailOnly(e.target.checked)} /> Available only
        </label>

        <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <span>{filtered.length} of {rows.length}</span>
          <div className="flex overflow-hidden rounded-md border" style={{ borderColor: "var(--border)" }}>
            {(["table", "board"] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className="px-2.5 py-1.5 text-[11px] font-medium capitalize transition-colors"
                style={view === v ? { background: "var(--header)", color: "#fff" } : { color: "var(--muted)" }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2.5">
        {view === "board" ? <FifoBoard rows={filtered} /> : <FifoTable rows={filtered} />}
      </div>

      <p className="mt-2 text-[10px] text-[var(--muted)]">
        Aging & FIFO order use the coil-number date (last 6 digits = YYMMDD); “*” means no coil date, receipt date used. Oldest-first per RM (lower # = consume first). Flags: <b style={{ color: "#dc2626" }}>Oldest</b> = #1 for its RM · <b style={{ color: "#ea8a0c" }}>Critical</b> = 30+ days · <b style={{ color: "#15a34a" }}>Ready</b> = rack assigned. Qty available reduces once issues are recorded.
      </p>
    </Shell>
  );
}
