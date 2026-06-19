"use client";
import { FifoRow, AgingBucket, BUCKETS, BUCKET_META } from "@/lib/types";
import { badges } from "@/lib/fifo";
import { fmt } from "@/lib/stock";
import SourceBadge from "./SourceBadge";

const CAP = 60; // cards rendered per column (counts/weights still reflect all)

function Card({ r }: { r: FifoRow }) {
  const b = badges(r);
  return (
    <div className="rounded-md border px-2.5 py-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs font-bold">{r.rm_code}</span>
        <SourceBadge label={r.source_label} />
        <span className="ml-auto font-mono text-[10px] text-[var(--muted)]">{r.aging_days}d</span>
      </div>
      <div className="mt-0.5 truncate text-[10px] text-[var(--muted)]" title={r.item_description ?? ""}>{r.item_description ?? "—"}</div>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[var(--muted)]">{r.reference_no ?? "—"}</span>
        <span className="font-mono text-xs font-semibold tabular-nums">{fmt(r.qty_available)} <span className="text-[9px] font-normal text-[var(--muted)]">kg</span></span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {b.oldest && <Tag color="#dc2626">Oldest</Tag>}
        {b.critical && <Tag color="#ea8a0c">Critical</Tag>}
        {b.ready ? <Tag color="#15a34a">Ready · {r.rack_number}</Tag> : <Tag color="#8a97a8">No rack</Tag>}
      </div>
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className="rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ color, background: `${color}1f` }}>{children}</span>;
}

export default function FifoBoard({ rows }: { rows: FifoRow[] }) {
  const grouped: Record<AgingBucket, FifoRow[]> = { "0-7": [], "8-15": [], "16-30": [], "30+": [] };
  for (const r of rows) grouped[r.aging_bucket].push(r);

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {BUCKETS.map((b) => {
        const list = grouped[b];
        const kg = list.reduce((s, r) => s + (r.qty_available || 0), 0);
        const m = BUCKET_META[b];
        return (
          <div key={b} className="flex flex-col rounded-lg border" style={{ borderColor: "var(--border)", background: m.tint, maxHeight: "calc(100vh - 250px)" }}>
            <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: m.color }}>{m.label}</span>
              <span className="font-mono text-[10px] text-[var(--muted)]">{list.length} lots · {fmt(kg)} kg</span>
            </div>
            <div className="flex flex-col gap-1.5 overflow-auto p-1.5">
              {list.slice(0, CAP).map((r) => <Card key={r.id} r={r} />)}
              {list.length > CAP && <div className="py-1 text-center text-[10px] text-[var(--muted)]">+{list.length - CAP} more in this bucket — use Table view to see all</div>}
              {list.length === 0 && <div className="py-6 text-center text-[10px] text-[var(--muted)]">No lots</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
