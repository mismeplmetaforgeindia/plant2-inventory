export type StockStatus = "Inactive" | "Zero" | "Overstock" | "Low" | "Safe";

export interface DashboardRow {
  rm_code: string;
  item_description: string | null;
  plant: string;
  peak_adc: number;
  adc: number;
  off_adc: number;
  lead_time: number;
  safety_factor: number;
  max_level: number;
  physical_stock: number;
  reorder_point: number;
  safety_stock: number;
  days_of_cover: number | null;
  status: StockStatus;
  synced_at: string | null;
}

export const STATUS_ORDER: StockStatus[] = ["Zero", "Low", "Safe", "Overstock", "Inactive"];

export const STATUS_META: Record<StockStatus, { label: string; color: string; tint: string }> = {
  Zero:      { label: "Zero",      color: "#dc2626", tint: "rgba(220,38,38,0.12)" },
  Low:       { label: "Low",       color: "#ea8a0c", tint: "rgba(234,138,12,0.14)" },
  Safe:      { label: "Safe",      color: "#15a34a", tint: "rgba(21,163,74,0.12)" },
  Overstock: { label: "Overstock", color: "#6366f1", tint: "rgba(99,102,241,0.12)" },
  Inactive:  { label: "Inactive",  color: "#8a97a8", tint: "rgba(138,151,168,0.12)" },
};

// ── FIFO board ───────────────────────────────────────────────────────────────
export type AgingBucket = "0-7" | "8-15" | "16-30" | "30+";

export interface FifoRow {
  id: string;
  rm_code: string;
  item_description: string | null;
  source_type: "grn_khatwad" | "plant1_to_plant2";
  source_label: string; // 'GRN' | '57F4' | 'Plant 1→2'
  reference_no: string | null;
  receipt_date: string;
  coil_date: string | null;
  lot_date: string;
  qty_received: number;
  qty_available: number;
  rack_number: string | null;
  status: string;
  aging_days: number;
  aging_bucket: AgingBucket;
  fifo_priority: number;
}

export const BUCKETS: AgingBucket[] = ["0-7", "8-15", "16-30", "30+"];

export const BUCKET_META: Record<AgingBucket, { label: string; color: string; tint: string }> = {
  "0-7":   { label: "0–7 days",   color: "#15a34a", tint: "rgba(21,163,74,0.10)" },
  "8-15":  { label: "8–15 days",  color: "#2e5a8f", tint: "rgba(46,90,143,0.10)" },
  "16-30": { label: "16–30 days", color: "#ea8a0c", tint: "rgba(234,138,12,0.12)" },
  "30+":   { label: "30+ days",   color: "#dc2626", tint: "rgba(220,38,38,0.10)" },
};

export function sourceMeta(label: string): { color: string; tint: string } {
  if (label === "57F4") return { color: "#7c3aed", tint: "rgba(124,58,237,0.12)" };
  if (label.startsWith("Plant")) return { color: "#0d9488", tint: "rgba(13,148,136,0.12)" };
  return { color: "#2e5a8f", tint: "rgba(46,90,143,0.12)" }; // GRN
}
