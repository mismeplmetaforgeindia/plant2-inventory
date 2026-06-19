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
