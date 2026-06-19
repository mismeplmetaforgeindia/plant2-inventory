import { sourceMeta } from "@/lib/types";

export default function SourceBadge({ label }: { label: string }) {
  const m = sourceMeta(label);
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: m.color, background: m.tint }}
    >
      {label}
    </span>
  );
}
