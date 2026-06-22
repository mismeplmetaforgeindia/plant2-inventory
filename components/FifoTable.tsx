"use client";
import { useState } from "react";
import { FifoRow, BUCKET_META } from "@/lib/types";
import { badges } from "@/lib/fifo";
import { fmt } from "@/lib/stock";
import SourceBadge from "./SourceBadge";

const PAGE = 200;

export default function FifoTable({ rows }: { rows: FifoRow[] }) {
  const [shown, setShown] = useState(PAGE);
  const slice = rows.slice(0, shown);

  return (
    <>
      <div className="overflow-auto rounded-lg border" style={{ borderColor: "var(--border)", maxHeight: "calc(100vh - 250px)" }}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: "var(--thead-bg)" }}>
              {["#", "RM Code", "Description", "Source", "Coil / Ref", "Lot Date", "Aging", "Rack", "Recd", "Avail", "Flags"].map((h, i) => (
                <th key={h} className={`whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--thead-fg)] ${i >= 8 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => {
              const b = badges(r);
              const bm = BUCKET_META[r.aging_bucket];
              return (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)", background: i % 2 ? "var(--surface-2)" : "var(--surface)" }}>
                  <td className="px-3 py-1.5 font-mono text-[var(--muted)]">{r.fifo_priority}</td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono font-semibold">{r.rm_code}</td>
                  <td className="max-w-[200px] truncate px-3 py-1.5 text-[var(--muted)]" title={r.item_description ?? ""}>{r.item_description ?? "—"}</td>
                  <td className="px-3 py-1.5"><SourceBadge label={r.source_label} /></td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px]">{r.reference_no ?? "—"}</td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px]" title={`Coil date ${r.coil_date ?? "n/a"} · Receipt ${r.receipt_date}`}>{r.lot_date}{r.coil_date ? "" : " *"}</td>
                  <td className="whitespace-nowrap px-3 py-1.5"><span className="font-mono text-[11px] font-semibold" style={{ color: bm.color }}>{r.aging_days}d</span></td>
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px]">{r.rack_number ?? <span className="text-[var(--muted)]">—</span>}</td>
                  <td className="px-3 py-1.5 text-right font-mono tabular-nums text-[var(--muted)]">{fmt(r.qty_received)}</td>
                  <td className="px-3 py-1.5 text-right font-mono font-semibold tabular-nums">{fmt(r.qty_available)}</td>
                  <td className="whitespace-nowrap px-3 py-1.5">
                    <div className="flex gap-1">
                      {b.oldest && <Dot color="#dc2626" title="Oldest" />}
                      {b.critical && <Dot color="#ea8a0c" title="Critical aging" />}
                      {b.ready && <Dot color="#15a34a" title="Ready for issue" />}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={11} className="px-3 py-10 text-center text-[var(--muted)]">No lots match these filters.</td></tr>}
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

function Dot({ color, title }: { color: string; title: string }) {
  return <span title={title} className="h-2 w-2 rounded-full" style={{ background: color, display: "inline-block" }} />;
}
