"use client";
import { useState } from "react";
import { GrnRow } from "@/lib/types";
import { fmt } from "@/lib/stock";
import SourceBadge from "./SourceBadge";

const PAGE = 200;

function StatusPill({ s }: { s: string | null }) {
  const map: Record<string, string> = {
    "Rack Assigned": "#15a34a", "Pending Rack Assignment": "#ea8a0c", "Edited": "#6366f1", "Depleted": "#8a97a8",
  };
  const c = map[s ?? ""] ?? "#8a97a8";
  const label = s === "Pending Rack Assignment" ? "Pending" : s ?? "—";
  return <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ color: c, background: `${c}1f` }}>{label}</span>;
}

export default function GrnTable({
  rows, assignRack, onEdit, onDelete,
}: {
  rows: GrnRow[];
  assignRack: (batchId: string, rack: string) => Promise<void>;
  onEdit: (r: GrnRow) => void;
  onDelete: (r: GrnRow) => void;
}) {
  const [shown, setShown] = useState(PAGE);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const slice = rows.slice(0, shown);

  async function saveRack(batchId: string) {
    setSaving(true);
    try { await assignRack(batchId, draft); setEditId(null); setDraft(""); }
    catch (e) { alert("Couldn't save rack: " + (e as Error).message); }
    setSaving(false);
  }

  return (
    <>
      <div className="overflow-auto rounded-lg border" style={{ borderColor: "var(--border)", maxHeight: "calc(100vh - 250px)" }}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: "var(--header)" }}>
              {["Date", "RM Code", "Source", "Coil No", "Weight", "Supplier / M-C", "Rack", "Status", "Origin", ""].map((h, i) => (
                <th key={h} className={`whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/90 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => {
              const manual = r.origin === "manual";
              return (
                <tr key={`${r.kind}-${r.id}`} className="border-t" style={{ borderColor: "var(--border)", background: i % 2 ? "var(--surface-2)" : "var(--surface)" }}>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px]">{r.doc_date}</td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono font-semibold">{r.rm_code}</td>
                  <td className="px-3 py-1.5"><SourceBadge label={r.grn_type ?? "GRN"} /></td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px]">{r.coil_no ?? "—"}</td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums">{fmt(r.weight_kg)}</td>
                  <td className="max-w-[160px] truncate px-3 py-1.5 text-[var(--muted)]" title={r.supplier ?? r.machine_no ?? ""}>{r.supplier ?? r.machine_no ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-1.5">
                    {editId === r.id ? (
                      <span className="flex items-center gap-1">
                        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && r.batch_id) saveRack(r.batch_id); if (e.key === "Escape") setEditId(null); }}
                          placeholder="R1-C1" className="h-7 w-16 rounded border bg-transparent px-1.5 font-mono text-[11px] uppercase outline-none" style={{ borderColor: "var(--header)" }} />
                        <button onClick={() => r.batch_id && saveRack(r.batch_id)} disabled={saving} className="rounded px-1.5 py-1 text-[10px] font-semibold text-white" style={{ background: "var(--header)" }}>✓</button>
                        <button onClick={() => setEditId(null)} className="text-[10px] text-[var(--muted)]">✕</button>
                      </span>
                    ) : r.rack_number ? (
                      <button onClick={() => { if (r.batch_id) { setEditId(r.id); setDraft(r.rack_number ?? ""); } }}
                        className="rounded px-2 py-0.5 font-mono text-[11px] font-bold" style={{ background: "#e0e7ff", color: "var(--header)" }}>{r.rack_number}</button>
                    ) : r.batch_id ? (
                      <button onClick={() => { setEditId(r.id); setDraft(""); }} className="rounded border border-dashed px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: "#ea8a0c", color: "#ea8a0c" }}>+ Add</button>
                    ) : <span className="text-[var(--muted)]">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5"><StatusPill s={r.status} /></td>
                  <td className="px-3 py-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: manual ? "#2e5a8f" : "var(--muted)" }}>{r.origin}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-1.5 text-right">
                    {manual ? (
                      <span className="flex justify-end gap-2">
                        <button onClick={() => onEdit(r)} className="text-[var(--muted)] hover:text-[var(--header)]" title="Edit">✎</button>
                        <button onClick={() => onDelete(r)} className="text-[var(--muted)] hover:text-[#dc2626]" title="Delete">🗑</button>
                      </span>
                    ) : (
                      <span title="Synced from the sheet — edit it in the sheet" className="cursor-default text-[var(--muted)] opacity-40">✎ 🗑</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={10} className="px-3 py-10 text-center text-[var(--muted)]">No entries match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      {shown < rows.length && (
        <div className="mt-2 text-center">
          <button onClick={() => setShown((s) => s + PAGE)} className="rounded-md border px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]" style={{ borderColor: "var(--border)" }}>
            Show more ({rows.length - shown} remaining)
          </button>
        </div>
      )}
    </>
  );
}
