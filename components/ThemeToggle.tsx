"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-8 w-8 grid place-items-center rounded-md border text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {dark ? "☾" : "☀"}
    </button>
  );
}
