"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FifoRow } from "@/lib/types";
import { fetchAllFifo } from "@/lib/fifo";
import { fmt, fmtKg } from "@/lib/stock";
import Shell from "@/components/Shell";
import FifoPicker from "@/components/FifoPicker";
import FifoTable from "@/components/FifoTable";

const REFRESH_MS = 120_000;
type View = "picker" | "table";

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
  const [view, setView] = useState<View>("picker");
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

  const assignRack = useCallback(async (id: string, rack: string) => {
    const res = await fetch(`/api/batches/${id}/rack`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rack_number: rack }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? "save failed");
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, rack_number: j.rack_number, status: j.status } : r)));
  }, []);

  const kpi = useMemo(() => {
    const avail = rows.reduce((s, r) => s + (r.qty_available || 0), 0);
    const critical = rows.filter((r) => r.aging_days >= 30 && r.qty_available > 0).length;
    const pendingRack = rows.filter((r) => !r.rack_number && r.qty_available > 0).length;
    return { lots: rows.length, avail, critical, pendingRack };
  }, [rows]);

  const tableRows = useMemo(() => availOnly ? rows.filter((r) => r.qty_available > 0) : rows, [rows, availOnly]);

  return (
    <Shell active="/fifo" title="FIFO Board" syncLabel={loading ? "Loading…" : `${kpi.lots} lots`} onRefresh={load} refreshing={loading}>
      {error && (
        <div className="mb-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "#dc2626", background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
          Couldn’t load FIFO data: {error}. Make sure <code>fifo_view.sql</code> has been run.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi label="Total Lots" value={fmt(kpi.lots)} sub="GRN + transfers" />
        <Kpi label="Available Stock" value={fmtKg(kpi.avail)} accent="var(--header)" sub="across all lots" />
        <Kpi label="Critical Aging" value={fmt(kpi.critical)} accent={kpi.critical ? "#dc2626" : undefined} sub="30+ days, still available" />
        <Kpi label="Pending Rack" value={fmt(kpi.pendingRack)} accent={kpi.pendingRack ? "#ea8a0c" : undefined} sub="not yet assigned" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
          <input type="checkbox" checked={availOnly} onChange={(e) => setAvailOnly(e.target.checked)} /> Available only
        </label>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <div className="flex overflow-hidden rounded-md border" style={{ borderColor: "var(--border)" }}>
            {(["picker", "table"] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className="px-2.5 py-1.5 text-[11px] font-medium capitalize transition-colors"
                style={view === v ? { background: "var(--header)", color: "#fff" } : { color: "var(--muted)" }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2.5">
        {view === "picker"
          ? <FifoPicker rows={rows} assignRack={assignRack} availOnly={availOnly} />
          : <FifoTable rows={tableRows} />}
      </div>

      <p className="mt-2 text-[10px] text-[var(--muted)]">
        Pick a material to see its coils oldest-first; lower number = consume first, green = use next. Tap a rack box (or “+ Add rack”) to set its location (e.g. R1-C1). Aging uses the coil-number date; “*” = no coil date, receipt date used.
      </p>
    </Shell>
  );
}
