import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plant 2 Inventory — Metaforge",
  description: "Khatwad raw material inventory",
};

// Set theme before paint to avoid flash.
const themeScript = `
(function(){try{
  var t=localStorage.getItem('theme');
  var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(d)document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
