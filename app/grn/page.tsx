"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GrnRow } from "@/lib/types";
import { fetchAllGrn } from "@/lib/grn";
import { fmt } from "@/lib/stock";
import Shell from "@/components/Shell";
import GrnTable from "@/components/GrnTable";
import GrnDrawer from "@/components/GrnDrawer";

type DrawerMode = { type: "add" } | { type: "edit"; row: GrnRow } | null;

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border px-3.5 py-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums" style={{ color: accent ?? "var(--text)" }}>{value}</div>
    </div>
  );
}

export default function GrnPage() {
  const [rows, setRows] = useState<GrnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerMode>(null);

  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<string>("All");
  const [origin, setOrigin] = useState<string>("All");

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchAllGrn()); setError(null); }
    catch (e: any) { setError(e?.message ?? "load failed"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const assignRack = useCallback(async (batchId: string, rack: string) => {
    const res = await fetch(`/api/batches/${batchId}/rack`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rack_number: rack }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error ?? "save failed");
    setRows((prev) => prev.map((r) => (r.batch_id === batchId ? { ...r, rack_number: j.rack_number, status: j.status } : r)));
  }, []);

  const onDelete = useCallback(async (r: GrnRow) => {
    if (!confirm(`Delete entry ${r.rm_code} · ${r.coil_no}? This can't be undone.`)) return;
    const res = await fetch(`/api/grn/${r.id}?kind=${r.kind}`, { method: "DELETE" });
    const j = await res.json();
    if (!res.ok) { alert("Delete failed: " + (j.error ?? "")); return; }
    setRows((prev) => prev.filter((x) => !(x.id === r.id && x.kind === r.kind)));
  }, []);

  const kpi = useMemo(() => ({
    total: rows.length,
    manual: rows.filter((r) => r.origin === "manual").length,
    pending: rows.filter((r) => !r.rack_number && (r.qty_available ?? 0) > 0).length,
    edited: rows.filter((r) => r.status === "Edited").length,
  }), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (kind !== "All" && (r.grn_type ?? "GRN") !== kind) return false;
      if (origin !== "All" && r.origin !== origin) return false;
      if (q && !(r.rm_code.toLowerCase().includes(q) || (r.coil_no ?? "").toLowerCase().includes(q) || (r.supplier ?? "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, search, kind, origin]);

  return (
    <Shell active="/grn" title="GRN Entries" subtitle={`${kpi.total} receipts · GRN + Plant 1→2 transfers`} syncLabel={loading ? "Loading…" : `${kpi.total} entries`} onRefresh={load} refreshing={loading}
      actions={<button onClick={() => setDrawer({ type: "add" })} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: "var(--navy)" }}>+ New Entry</button>}>
      {error && (
        <div className="mb-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "#dc2626", background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
          Couldn’t load entries: {error}. Make sure <code>grn_view.sql</code> has been run.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi label="Total Entries" value={fmt(kpi.total)} />
        <Kpi label="Manual Entries" value={fmt(kpi.manual)} accent={kpi.manual ? "#1e40af" : undefined} />
        <Kpi label="Pending Rack" value={fmt(kpi.pending)} accent={kpi.pending ? "#b45309" : undefined} />
        <Kpi label="Edited" value={fmt(kpi.edited)} accent={kpi.edited ? "#4338ca" : undefined} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search RM, coil, supplier…"
          className="h-8 w-full max-w-xs rounded-md border bg-transparent px-3 text-xs outline-none focus:border-[var(--header)]" style={{ borderColor: "var(--border)" }} />
        <div className="flex items-center gap-1">
          {["All", "GRN", "57F4", "Plant 1→2"].map((k) => (
            <button key={k} onClick={() => setKind(k)} className="rounded-md px-2 py-1.5 text-[11px] font-medium"
              style={kind === k ? { background: "var(--header)", color: "#fff" } : { color: "var(--muted)", border: "1px solid var(--border)" }}>{k}</button>
          ))}
        </div>
        <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="h-8 rounded-md border bg-transparent px-2 text-xs outline-none" style={{ borderColor: "var(--border)" }}>
          <option value="All">All origins</option>
          <option value="manual">Manual</option>
          <option value="sheet">Sheet</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-[var(--muted)]">{filtered.length} of {rows.length}</span>
        </div>
      </div>

      <div className="mt-2.5">
        <GrnTable rows={filtered} assignRack={assignRack} onEdit={(r) => setDrawer({ type: "edit", row: r })} onDelete={onDelete} />
      </div>

      <p className="mt-2 text-[10px] text-[var(--muted)]">
        Add a purchase GRN or a Plant 1→2 transfer; it appears on the FIFO board immediately. Assign racks inline. Edit/delete is enabled for manual entries only — sheet-synced rows are managed in the sheet (editing here would be overwritten on the next sync).
      </p>

      {drawer && <GrnDrawer mode={drawer} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load(); }} />}
    </Shell>
  );
}
