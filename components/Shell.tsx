"use client";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { label: "Dashboard", href: "/", live: true },
  { label: "FIFO Board", href: "/fifo", live: true },
  { label: "GRN Entries", href: "/grn", live: false },
];

export default function Shell({
  active, title, syncLabel, onRefresh, refreshing, children,
}: {
  active: string;
  title: string;
  syncLabel: string;
  onRefresh: () => void;
  refreshing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
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
          {NAV.map((n) => {
            const isActive = n.href === active;
            return (
              <a
                key={n.href}
                href={n.live || isActive ? n.href : undefined}
                className="rounded-md px-3 py-2 text-sm transition-colors"
                style={isActive
                  ? { background: "var(--header)", color: "#fff", fontWeight: 600 }
                  : { color: "var(--muted)", cursor: n.live ? "pointer" : "default" }}
              >
                {n.label}
                {!n.live && <span className="ml-1 text-[9px] uppercase tracking-wide opacity-60">soon</span>}
              </a>
            );
          })}
        </nav>
        <div className="mt-auto px-4 py-3 text-[10px] text-[var(--muted)]">Industrial inventory · v0.1</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-2.5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="md:hidden grid h-7 w-7 place-items-center rounded font-mono text-xs font-bold text-white" style={{ background: "var(--header)" }}>M2</div>
          <h1 className="text-sm font-semibold">{title}</h1>
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
