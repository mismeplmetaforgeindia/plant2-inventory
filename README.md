# Plant 2 (Khatwad) Raw Material Inventory

Next.js 14 dashboard reading live data from Supabase (`v_dashboard`). Client-side
fetch with auto-refresh (60s), live search/filter/sort, CSV export, dark/light.
Physical Stock is the hero column with a fill-bar against Max Level, colored by
stock status.

## Deploy (GitHub + Vercel)

**1. Apply read policies in Supabase** (one time, after `schema.sql`):
Open `rls_policies.sql` in the Supabase SQL editor and run it. Without this the
browser can't read anything (RLS blocks the anon key).

**2. Push this folder to GitHub.**
```bash
git init && git add . && git commit -m "Plant 2 dashboard"
git branch -M main
git remote add origin https://github.com/<you>/plant2-inventory.git
git push -u origin main
```

**3. Import on Vercel.**
vercel.com → Add New → Project → import the repo. Framework auto-detects Next.js.
Add two Environment Variables before deploying:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uxztmntkdlvewzrmrxob.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your **publishable** (`sb_publishable_…`) or legacy **anon** key |

Deploy. (Both vars are public/read-only by design — never put the service_role
or secret key here.)

## Local (optional)
```bash
cp .env.local.example .env.local   # fill in the anon key
npm install
npm run dev
```

## Structure
```
app/page.tsx            dashboard (client component: fetch, filter, sort, refresh)
app/layout.tsx          theme bootstrap, fonts
components/Shell.tsx     sidebar + top bar (FIFO/GRN nav stubbed for later steps)
components/KpiCards.tsx  5 KPI cards
components/InventoryTable.tsx  sortable table + hero Physical Stock column
components/StatusChip.tsx / ThemeToggle.tsx
lib/supabase.ts          anon browser client
lib/types.ts             DashboardRow + status metadata
lib/stock.ts             formatting + CSV export
rls_policies.sql         run in Supabase to allow anon reads
```

Next: FIFO Board (`/fifo`) and GRN Entries (`/grn`) pages.
