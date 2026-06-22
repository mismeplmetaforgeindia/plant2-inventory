"use client";
import { useMemo, useState } from "react";
import { FifoRow, BUCKET_META } from "@/lib/types";
import { fmt } from "@/lib/stock";
import SourceBadge from "./SourceBadge";

const PRIO = ["#10b981", "#fbbf24", "#fb923c"]; // p1, p2, p3

function priColor(p: number) { return PRIO[p - 1] ?? "#94a3b8"; }

export default function FifoPicker({
  rows, assignRack, availOnly,
}: {
  rows: FifoRow[];
  assignRack: (id: string, rack: string) => Promise<void>;
  availOnly: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // group rows by RM
  const groups = useMemo(() => {
    const map = new Map<string, FifoRow[]>();
    for (const r of rows) {
      if (availOnly && r.qty_available <= 0) continue;
      if (!map.has(r.rm_code)) map.set(r.rm_code, []);
      map.get(r.rm_code)!.push(r);
    }
    const out = Array.from(map.entries()).map(([rm, lots]) => {
      lots.sort((a, b) => a.fifo_priority - b.fifo_priority);
      return {
        rm_code: rm,
        desc: lots[0].item_description,
        lots,
        avail: lots.reduce((s, r) => s + (r.qty_available || 0), 0),
        oldest: Math.max(...lots.map((r) => r.aging_days)),
        pending: lots.filter((r) => !r.rack_number && r.qty_available > 0).length,
      };
    });
    out.sort((a, b) => b.oldest - a.oldest); // RMs with oldest stock first
    return out;
  }, [rows, availOnly]);

  const filteredGroups = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return groups;
    return groups.filter((g) => g.rm_code.toLowerCase().includes(s) || (g.desc ?? "").toLowerCase().includes(s));
  }, [groups, q]);

  const current = groups.find((g) => g.rm_code === selected) ?? filteredGroups[0] ?? null;

  async function save(id: string) {
    setSaving(true);
    try { await assignRack(id, draft); setEditing(null); setDraft(""); }
    catch (e) { alert("Couldn't save rack: " + (e as Error).message); }
    setSaving(false);
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[330px_1fr]">
      {/* LEFT — RM list */}
      <div className="flex flex-col rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)", maxHeight: "calc(100vh - 250px)" }}>
        <div className="border-b p-2" style={{ borderColor: "var(--border)" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search material…"
            className="h-8 w-full rounded-md border bg-transparent px-3 text-xs outline-none focus:border-[var(--header)]" style={{ borderColor: "var(--border)" }} />
        </div>
        <div className="overflow-auto">
          {filteredGroups.map((g) => {
            const active = current?.rm_code === g.rm_code;
            return (
              <button key={g.rm_code} onClick={() => setSelected(g.rm_code)}
                className="block w-full border-b px-3 py-2 text-left transition-colors"
                style={{ borderColor: "var(--border)", background: active ? "var(--header)" : "transparent", color: active ? "#fff" : "var(--text)" }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold">{g.rm_code}</span>
                  <span className="font-mono text-[11px] tabular-nums" style={{ opacity: 0.85 }}>{fmt(g.avail)} kg</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[10px]" style={{ opacity: active ? 0.8 : 0.55 }}>{g.desc ?? "—"}</span>
                  <span className="shrink-0 font-mono text-[9px]" style={{ opacity: 0.7 }}>
                    {g.lots.length} lot{g.lots.length > 1 ? "s" : ""}{g.pending ? ` · ${g.pending} no-rack` : ""}
                  </span>
                </div>
              </button>
            );
          })}
          {filteredGroups.length === 0 && <div className="p-6 text-center text-[11px] text-[var(--muted)]">No materials.</div>}
        </div>
      </div>

      {/* RIGHT — selected RM's FIFO queue */}
      <div className="rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface-2)", maxHeight: "calc(100vh - 250px)", overflow: "auto" }}>
        {!current ? (
          <div className="grid h-40 place-items-center text-xs text-[var(--muted)]">Select a material to see its FIFO queue.</div>
        ) : (
          <div className="p-3">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-mono text-base font-bold">{current.rm_code}</span>
                <span className="ml-2 text-xs text-[var(--muted)]">{current.desc ?? "—"}</span>
              </div>
              <span className="font-mono text-xs text-[var(--muted)]">{current.lots.length} lots · {fmt(current.avail)} kg available</span>
            </div>

            <div className="flex flex-col gap-2">
              {current.lots.map((r) => {
                const bm = BUCKET_META[r.aging_bucket];
                const isP1 = r.fifo_priority === 1 && r.qty_available > 0;
                return (
                  <div key={r.id} className="relative flex items-center gap-3 rounded-lg border px-3 py-2.5"
                    style={{ borderColor: isP1 ? "#6ee7b7" : "var(--border)", background: isP1 ? "rgba(16,185,129,0.08)" : "var(--surface)", boxShadow: isP1 ? "0 0 0 2px rgba(167,243,208,0.6)" : "none" }}>
                    {/* priority circle */}
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-sm font-bold text-white" style={{ background: priColor(r.fifo_priority) }}>
                      {r.fifo_priority}
                    </div>
                    {isP1 && <span className="absolute -top-2 left-12 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white" style={{ background: "#10b981" }}>Use next</span>}

                    {/* rack / location */}
                    <div className="shrink-0">
                      {editing === r.id ? (
                        <div className="flex items-center gap-1">
                          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") save(r.id); if (e.key === "Escape") setEditing(null); }}
                            placeholder="R1-C1" className="h-8 w-20 rounded-md border bg-transparent px-2 font-mono text-sm uppercase outline-none focus:border-[var(--header)]" style={{ borderColor: "var(--header)" }} />
                          <button onClick={() => save(r.id)} disabled={saving} className="rounded-md px-2 py-1.5 text-[11px] font-semibold text-white" style={{ background: "var(--header)" }}>✓</button>
                          <button onClick={() => setEditing(null)} className="rounded-md border px-2 py-1.5 text-[11px]" style={{ borderColor: "var(--border)" }}>✕</button>
                        </div>
                      ) : r.rack_number ? (
                        <button onClick={() => { setEditing(r.id); setDraft(r.rack_number ?? ""); }} title="Edit rack"
                          className="rounded-md px-3 py-1.5 font-mono text-lg font-bold" style={{ background: "#e0e7ff", color: "var(--header)" }}>
                          {r.rack_number}
                        </button>
                      ) : (
                        <button onClick={() => { setEditing(r.id); setDraft(""); }}
                          className="rounded-md border border-dashed px-3 py-1.5 text-[11px] font-semibold" style={{ borderColor: "#ea8a0c", color: "#ea8a0c" }}>
                          + Add rack
                        </button>
                      )}
                    </div>

                    {/* coil + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-sm font-semibold">{r.reference_no ?? "—"}</span>
                        <SourceBadge label={r.source_label} />
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--muted)]">
                        {r.lot_date}{r.coil_date ? "" : " *"} · <span style={{ color: bm.color, fontWeight: 600 }}>{r.aging_days}d old</span>
                      </div>
                    </div>

                    {/* weight */}
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-lg font-bold tabular-nums">{fmt(r.qty_available)}</div>
                      <div className="text-[9px] text-[var(--muted)]">kg avail{r.qty_available !== r.qty_received ? ` / ${fmt(r.qty_received)}` : ""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
