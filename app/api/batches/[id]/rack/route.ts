import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: { rack_number?: string | null };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const rack = (body.rack_number ?? "").toString().trim().toUpperCase() || null;
  const status = rack ? "Rack Assigned" : "Pending Rack Assignment";

  try {
    const admin = getAdmin();
    const { error } = await admin
      .from("fifo_batches")
      .update({ rack_number: rack, status, updated_by: "web" })
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, rack_number: rack, status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
