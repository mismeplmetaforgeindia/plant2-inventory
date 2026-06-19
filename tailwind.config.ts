import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#1e3a5f", accent: "#2e5a8f", soft: "#3b6ea5" },
        // status palette (text colors; soft bg tints applied inline)
        zero: "#dc2626",
        low: "#ea8a0c",
        safe: "#15a34a",
        over: "#6366f1",
        idle: "#8a97a8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
