"use client";
import { useEffect, useState } from "react";
import { GrnRow } from "@/lib/types";

type Mode = { type: "add" } | { type: "edit"; row: GrnRow };

const F = (label: string, el: React.ReactNode) => (
  <label className="block">
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</span>
    {el}
  </label>
);
const inputCls = "h-9 w-full rounded-md border bg-transparent px-3 text-xs outline-none focus:border-[var(--header)]";

export default function GrnDrawer({ mode, onClose, onSaved }: { mode: Mode; onClose: () => void; onSaved: () => void; }) {
  const editing = mode.type === "edit";
  const r = editing ? mode.row : null;
  const [kind, setKind] = useState<"grn" | "transfer">(r?.kind ?? "grn");
  const [f, setF] = useState({
    doc_date: r?.doc_date ?? new Date().toISOString().slice(0, 10),
    rm_code: r?.rm_code ?? "", coil_no: r?.coil_no ?? "",
    weight_kg: r?.weight_kg != null ? String(r.weight_kg) : "",
    supplier: r?.supplier ?? "", grn_type: r?.grn_type ?? "GRN",
    heat_no: r?.heat_no ?? "", grade_size: r?.grade_size ?? "", machine_no: r?.machine_no ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit() {
    setErr(null);
    if (!f.rm_code.trim() || !f.coil_no.trim() || !f.doc_date || !(Number(f.weight_kg) > 0)) {
      setErr("RM code, coil no, date and a weight greater than 0 are required."); return;
    }
    setSaving(true);
    try {
      const payload = { kind, ...f, weight_kg: Number(f.weight_kg) };
      const res = editing
        ? await fetch(`/api/grn/${r!.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/grn`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "save failed");
      onSaved();
    } catch (e: any) { setErr(e?.message ?? "save failed"); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose}>
      <div className="flex h-full w-full max-w-md flex-col" style={{ background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold">{editing ? "Edit entry" : "New entry"}</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]">✕</button>
        </div>
        <div className="flex-1 space-y-3 overflow-auto p-4">
          {!editing && (
            <div className="flex overflow-hidden rounded-md border text-xs" style={{ borderColor: "var(--border)" }}>
              {(["grn", "transfer"] as const).map((k) => (
                <button key={k} onClick={() => setKind(k)} className="flex-1 px-3 py-2 font-medium transition-colors"
                  style={kind === k ? { background: "var(--header)", color: "#fff" } : { color: "var(--muted)" }}>
                  {k === "grn" ? "Purchase GRN" : "Plant 1→2 Transfer"}
                </button>
              ))}
            </div>
          )}
          {F("Date", <input type="date" value={f.doc_date} onChange={(e) => set("doc_date", e.target.value)} className={inputCls} style={{ borderColor: "var(--border)" }} />)}
          {F("RM Code", <input value={f.rm_code} onChange={(e) => set("rm_code", e.target.value)} placeholder="RM087" className={`${inputCls} font-mono`} style={{ borderColor: "var(--border)" }} />)}
          {F("Coil No", <input value={f.coil_no} onChange={(e) => set("coil_no", e.target.value)} placeholder="U4B-01563-260605" className={`${inputCls} font-mono`} style={{ borderColor: "var(--border)" }} />)}
          {F("Weight (kg)", <input type="number" value={f.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} placeholder="500" className={`${inputCls} font-mono`} style={{ borderColor: "var(--border)" }} />)}
          {kind === "grn" ? (
            <>
              {F("Type", (
                <div className="flex gap-2">
                  {["GRN", "57F4"].map((t) => (
                    <button key={t} onClick={() => set("grn_type", t)} className="flex-1 rounded-md border px-3 py-2 text-xs font-medium"
                      style={f.grn_type === t ? { background: "var(--header)", color: "#fff", borderColor: "var(--header)" } : { color: "var(--muted)", borderColor: "var(--border)" }}>
                      {t === "GRN" ? "Purchase (GRN)" : "Job-work (57F4)"}
                    </button>
                  ))}
                </div>
              ))}
              {F("Supplier", <input value={f.supplier} onChange={(e) => set("supplier", e.target.value)} className={inputCls} style={{ borderColor: "var(--border)" }} />)}
              {F("Heat No", <input value={f.heat_no} onChange={(e) => set("heat_no", e.target.value)} className={`${inputCls} font-mono`} style={{ borderColor: "var(--border)" }} />)}
              {F("Grade & Size", <input value={f.grade_size} onChange={(e) => set("grade_size", e.target.value)} className={inputCls} style={{ borderColor: "var(--border)" }} />)}
            </>
          ) : (
            F("M/C No", <input value={f.machine_no} onChange={(e) => set("machine_no", e.target.value)} placeholder="HN-61" className={`${inputCls} font-mono`} style={{ borderColor: "var(--border)" }} />)
          )}
          {err && <div className="rounded-md px-3 py-2 text-xs" style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}>{err}</div>}
          <p className="text-[10px] text-[var(--muted)]">Rack is assigned from the table after saving. Manual entries appear on the FIFO board immediately.</p>
        </div>
        <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="flex-1 rounded-md border py-2 text-xs font-medium" style={{ borderColor: "var(--border)" }}>Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 rounded-md py-2 text-xs font-semibold text-white disabled:opacity-60" style={{ background: "var(--header)" }}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
