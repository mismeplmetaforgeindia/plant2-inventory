import { DashboardRow } from "./types";

export const fmt = (n: number | null | undefined, d = 0) =>
  n == null ? "—" : n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmtKg = (n: number) =>
  n >= 1000 ? `${(n / 1000).toLocaleString("en-IN", { maximumFractionDigits: 1 })} t` : `${fmt(n)} kg`;

export function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function toCsv(rows: DashboardRow[]): string {
  const cols: (keyof DashboardRow)[] = [
    "rm_code", "item_description", "plant", "peak_adc", "adc", "off_adc",
    "lead_time", "safety_factor", "max_level", "physical_stock",
    "reorder_point", "days_of_cover", "status",
  ];
  const head = cols.join(",");
  const body = rows.map((r) =>
    cols.map((c) => {
      const v = r[c];
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")
  );
  return [head, ...body].join("\n");
}

export function downloadCsv(rows: DashboardRow[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `plant2-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
