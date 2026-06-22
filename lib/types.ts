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
  Zero:      { label: "Zero",      color: "#b91c1c", tint: "#fee2e2" },
  Low:       { label: "Low",       color: "#b45309", tint: "#fef3c7" },
  Safe:      { label: "Safe",      color: "#047857", tint: "#d1fae5" },
  Overstock: { label: "Overstock", color: "#4338ca", tint: "#e0e7ff" },
  Inactive:  { label: "Inactive",  color: "#475569", tint: "#f1f5f9" },
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
  "0-7":   { label: "0–7 days",   color: "#047857", tint: "#d1fae5" },
  "8-15":  { label: "8–15 days",  color: "#1e40af", tint: "#dbeafe" },
  "16-30": { label: "16–30 days", color: "#b45309", tint: "#fef3c7" },
  "30+":   { label: "30+ days",   color: "#b91c1c", tint: "#fee2e2" },
};

export function sourceMeta(label: string): { color: string; tint: string } {
  if (label === "57F4") return { color: "#6d28d9", tint: "#ede9fe" };
  if (label.startsWith("Plant")) return { color: "#0f766e", tint: "#ccfbf1" };
  return { color: "#1e40af", tint: "#dbeafe" }; // GRN
}

// ── GRN Entries ──────────────────────────────────────────────────────────────
export interface EntryRow {
  entry_id: string;
  source_type: "grn_khatwad" | "plant1_to_plant2";
  batch_id: string | null;
  rm_code: string;
  item_description: string | null;
  entry_date: string;
  weight_kg: number;
  supplier: string | null;
  machine_no: string | null;
  grn_type: string | null;
  coil_no: string | null;
  rack_number: string | null;
  status: string;
  qty_available: number | null;
  origin: string; // 'sheet' | 'manual'
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export function entrySourceLabel(r: EntryRow): string {
  return r.source_type === "plant1_to_plant2" ? "Plant 1→2" : (r.grn_type || "GRN");
}

// ── GRN Entries ──────────────────────────────────────────────────────────────
export interface GrnRow {
  kind: "grn" | "transfer";
  id: string;
  doc_date: string;
  rm_code: string;
  plant: string;
  weight_kg: number;
  supplier: string | null;
  machine_no: string | null;
  grn_type: string | null;
  coil_no: string | null;
  heat_no: string | null;
  grade_size: string | null;
  origin: "sheet" | "manual";
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  batch_id: string | null;
  rack_number: string | null;
  status: string | null;
  qty_available: number | null;
}
