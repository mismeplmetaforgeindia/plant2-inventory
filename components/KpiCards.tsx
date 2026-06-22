import { DashboardRow } from "@/lib/types";
import { fmt, fmtKg } from "@/lib/stock";

function Card({ label, value, accent, sub, hero }: { label: string; value: string; accent?: string; sub?: string; hero?: boolean }) {
  if (hero) {
    return (
      <div className="rounded-xl px-4 py-3 shadow-sm" style={{ background: "linear-gradient(160deg,#1f3b5c,#152840)", color: "#fff" }}>
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#a9c0db" }}>{label}</div>
        <div className="mt-1 font-mono text-2xl font-bold tabular-nums">{value}</div>
        {sub && <div className="text-[10px]" style={{ color: "#9bb4d0" }}>{sub}</div>}
      </div>
    );
  }
  return (
    <div className="rounded-xl border px-4 py-3 shadow-sm" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums" style={{ color: accent ?? "var(--text)" }}>{value}</div>
      {sub && <div className="text-[10px] text-[var(--muted)]">{sub}</div>}
    </div>
  );
}

export default function KpiCards({ rows }: { rows: DashboardRow[] }) {
  const total = rows.length;
  const low = rows.filter((r) => r.status === "Low").length;
  const zero = rows.filter((r) => r.status === "Zero").length;
  const over = rows.filter((r) => r.status === "Overstock").length;
  const totalStock = rows.reduce((s, r) => s + (r.physical_stock || 0), 0);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      <Card label="Raw Materials" value={fmt(total)} />
      <Card label="Low Stock" value={fmt(low)} accent={low ? "#b45309" : undefined} sub="below reorder point" />
      <Card label="Zero Stock" value={fmt(zero)} accent={zero ? "#b91c1c" : undefined} sub="needs urgent action" />
      <Card label="Above Max" value={fmt(over)} accent={over ? "#4338ca" : undefined} sub="overstocked" />
      <Card label="Total Physical Stock" value={fmtKg(totalStock)} hero sub="across all materials" />
    </div>
  );
}
