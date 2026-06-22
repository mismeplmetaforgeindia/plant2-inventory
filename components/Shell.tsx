"use client";
import Image from "next/image";
import { LayoutDashboard, Boxes, ClipboardList, RefreshCw, Star } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const SECTIONS = [
  { title: "Overview", items: [
    { label: "Dashboard", href: "/", live: true, icon: LayoutDashboard },
    { label: "FIFO Board", href: "/fifo", live: true, icon: Boxes },
  ]},
  { title: "Operations", items: [
    { label: "GRN Entries", href: "/grn", live: true, icon: ClipboardList },
  ]},
];

export default function Shell({
  active, title, subtitle, syncLabel, onRefresh, refreshing, actions, children,
}: {
  active: string;
  title: string;
  subtitle?: string;
  syncLabel: string;
  onRefresh: () => void;
  refreshing: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — always dark navy */}
      <aside className="hidden w-60 shrink-0 flex-col md:flex"
        style={{ background: "linear-gradient(180deg,#1f3b5c 0%,#162a41 100%)", color: "#cbd7e6" }}>
        <div className="flex items-center gap-2.5 px-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-md bg-white">
            <Image src="/logo.png" alt="Metaforge" width={30} height={29} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-wide text-white">METAFORGE</div>
            <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#d8a94a" }}>Raw Material Inventory</div>
          </div>
        </div>

        <nav className="mt-2 flex flex-col gap-4 px-3 py-2">
          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#7e93ad" }}>{sec.title}</div>
              <div className="flex flex-col gap-0.5">
                {sec.items.map((n) => {
                  const isActive = n.href === active;
                  const Icon = n.icon;
                  return (
                    <a key={n.href} href={n.live || isActive ? n.href : undefined}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors"
                      style={isActive
                        ? { background: "#e6a338", color: "#17263a", fontWeight: 700 }
                        : { color: "#cbd7e6" }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                      <Icon size={17} strokeWidth={2} />
                      {n.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto px-4 py-3 text-[10px]" style={{ color: "#6b80a0" }}>Plant 2 · Khatwad · v0.2</div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* company strip */}
        <div className="flex items-center gap-2 border-b px-5 py-1.5 text-[11px]"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--muted)" }}>
          <span className="font-bold uppercase tracking-wide" style={{ color: "var(--navy)" }}>Metaforge Engineering (I) Pvt. Ltd.</span>
          <span>· Nashik, Maharashtra</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: "#fdf0d5", color: "#9a6b15", border: "1px solid #f0d99a" }}>
              <Star size={10} fill="#d8a94a" stroke="#d8a94a" /> ADMIN
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* page title row */}
        <header className="flex flex-wrap items-end justify-between gap-3 px-5 pb-3 pt-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>{title}</h1>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--text)]"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> {syncLabel}
            </button>
            {actions}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-5 pb-5">{children}</main>
      </div>
    </div>
  );
}
