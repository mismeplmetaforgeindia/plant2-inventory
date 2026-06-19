"use client";
import { DashboardRow, STATUS_META } from "@/lib/types";
import { fmt } from "@/lib/stock";
import StatusChip from "./StatusChip";

export type SortKey = keyof DashboardRow;

const COLS: { key: SortKey; label: string; num?: boolean }[] = [
  { key: "rm_code", label: "RM Code" },
  { key: "item_description", label: "Item Description" },
  { key: "peak_adc", label: "Peak ADC", num: true },
  { key: "adc", label: "Avg ADC", num: true },
  { key: "off_adc", label: "OFF ADC", num: true },
  { key: "lead_time", label: "Lead", num: true },
  { key: "safety_factor", label: "Saf.F", num: true },
  { key: "max_level", label: "Max Level", num: true },
  { key: "status", label: "Status" },
];

function HeroCell({ r }: { r: DashboardRow }) {
  const m = STATUS_META[r.status];
  const pct = r.max_level > 0 ? Math.min(100, (r.physical_stock / r.max_level) * 100) : (r.physical_stock > 0 ? 100 : 0);
  return (
    <td className="sticky right-0 px-3 py-1.5 text-right" style={{ background: "var(--surface)", borderLeft: "2px solid var(--border)" }}>
      <div className="font-mono text-sm font-bold tabular-nums leading-none" style={{ color: m.color }}>
        {fmt(r.physical_stock)}
      </div>
      <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
      </div>
    </td>
  );
}

export default function InventoryTable({
  rows, sortKey, sortDir, onSort,
}: {
  rows: DashboardRow[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (k: SortKey) => void;
}) {
  return (
    <div className="overflow-auto rounded-lg border" style={{ borderColor: "var(--border)", maxHeight: "calc(100vh - 230px)" }}>
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10">
          <tr style={{ background: "var(--header)" }}>
            {COLS.map((c) => (
              <th
                key={c.key}
                onClick={() => onSort(c.key)}
                className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/90 hover:text-white ${c.num ? "text-right" : "text-left"}`}
              >
                {c.label}
                {sortKey === c.key && <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>}
              </th>
            ))}
            <th
              onClick={() => onSort("physical_stock")}
              className="sticky right-0 cursor-pointer select-none whitespace-nowrap px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background: "var(--header)", borderLeft: "2px solid rgba(255,255,255,0.25)" }}
            >
              Physical Stock{sortKey === "physical_stock" && <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.rm_code} className="border-t" style={{ borderColor: "var(--border)", background: i % 2 ? "var(--surface-2)" : "var(--surface)" }}>
              <td className="whitespace-nowrap px-3 py-1.5 font-mono font-semibold">{r.rm_code}</td>
              <td className="max-w-[220px] truncate px-3 py-1.5 text-[var(--muted)]" title={r.item_description ?? ""}>{r.item_description ?? "—"}</td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">{fmt(r.peak_adc)}</td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">{fmt(r.adc)}</td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">{fmt(r.off_adc)}</td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">{fmt(r.lead_time)}</td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">{fmt(r.safety_factor, 1)}</td>
              <td className="px-3 py-1.5 text-right font-mono tabular-nums">{fmt(r.max_level)}</td>
              <td className="px-3 py-1.5"><StatusChip status={r.status} /></td>
              <HeroCell r={r} />
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={COLS.length + 1} className="px-3 py-10 text-center text-[var(--muted)]">No materials match these filters. Clear the search or status filter to see all rows.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
