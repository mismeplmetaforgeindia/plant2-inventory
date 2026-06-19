import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const kind = b.kind === "transfer" ? "transfer" : "grn";
  const rm_code = (b.rm_code ?? "").toString().trim();
  const coil_no = (b.coil_no ?? "").toString().trim();
  const weight = Number(b.weight_kg);
  const doc_date = (b.doc_date ?? "").toString().slice(0, 10);

  if (!rm_code || !coil_no || !doc_date || !(weight > 0))
    return NextResponse.json({ error: "rm_code, coil_no, doc_date and weight>0 are required" }, { status: 400 });

  try {
    const admin = getAdmin();
    await admin.from("material_master").upsert({ rm_code, plant: "Khatwad" }, { onConflict: "rm_code", ignoreDuplicates: true });

    const now = new Date().toISOString();
    if (kind === "grn") {
      const { data, error } = await admin.from("grn_entries").insert({
        source_entry_ts: now, grn_date: doc_date, rm_code, plant: "Khatwad",
        weight_kg: weight, supplier: b.supplier || null, grn_type: b.grn_type || "GRN",
        coil_no, heat_no: b.heat_no || null, grade_size: b.grade_size || null,
        origin: "manual", created_by: "web", updated_by: "web",
      }).select("id").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, id: data.id });
    } else {
      const { data, error } = await admin.from("transfer_entries").insert({
        source_entry_ts: now, transfer_date: doc_date, rm_code, plant: "Khatwad",
        machine_no: b.machine_no || null, weight_kg: weight, coil_no,
        origin: "manual", created_by: "web", updated_by: "web",
      }).select("id").single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, id: data.id });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
