"use client";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { label: "Dashboard", href: "/", active: true },
  { label: "FIFO Board", href: "/fifo", active: false },
  { label: "GRN Entries", href: "/grn", active: false },
];

export default function Shell({
  children, syncLabel, onRefresh, refreshing,
}: {
  children: React.ReactNode;
  syncLabel: string;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="hidden w-52 shrink-0 flex-col border-r md:flex"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="grid h-7 w-7 place-items-center rounded font-mono text-xs font-bold text-white" style={{ background: "var(--header)" }}>M2</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Plant 2</div>
            <div className="text-[10px] text-[var(--muted)]">Khatwad · Metaforge</div>
          </div>
        </div>
        <nav className="mt-2 flex flex-col gap-0.5 px-2">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm transition-colors"
              style={n.active
                ? { background: "var(--header)", color: "#fff", fontWeight: 600 }
                : { color: "var(--muted)" }}
            >
              {n.label}
              {!n.active && <span className="ml-1 text-[9px] uppercase tracking-wide opacity-60">soon</span>}
            </a>
          ))}
        </nav>
        <div className="mt-auto px-4 py-3 text-[10px] text-[var(--muted)]">
          Industrial inventory · v0.1
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-2.5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="md:hidden grid h-7 w-7 place-items-center rounded font-mono text-xs font-bold text-white" style={{ background: "var(--header)" }}>M2</div>
          <h1 className="text-sm font-semibold">Raw Material Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${refreshing ? "animate-pulse" : ""}`} style={{ background: refreshing ? "#15a34a" : "var(--muted)" }} />
              {syncLabel}
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
