import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tableFor(kind: string) {
  return kind === "transfer" ? "transfer_entries" : "grn_entries";
}
function sourceTypeFor(kind: string) {
  return kind === "transfer" ? "plant1_to_plant2" : "grn_khatwad";
}

// Edit a manual entry (sheet rows are not editable — they re-sync).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const kind = b.kind === "transfer" ? "transfer" : "grn";

  const patch: Record<string, any> = { updated_by: "web" };
  if (b.doc_date) patch[kind === "transfer" ? "transfer_date" : "grn_date"] = String(b.doc_date).slice(0, 10);
  if (b.rm_code) patch.rm_code = String(b.rm_code).trim();
  if (b.coil_no) patch.coil_no = String(b.coil_no).trim();
  if (b.weight_kg != null && Number(b.weight_kg) > 0) patch.weight_kg = Number(b.weight_kg);
  if (kind === "grn") {
    if ("supplier" in b) patch.supplier = b.supplier || null;
    if ("grn_type" in b) patch.grn_type = b.grn_type || "GRN";
    if ("heat_no" in b) patch.heat_no = b.heat_no || null;
    if ("grade_size" in b) patch.grade_size = b.grade_size || null;
  } else {
    if ("machine_no" in b) patch.machine_no = b.machine_no || null;
  }

  try {
    const admin = getAdmin();
    if (patch.rm_code) await admin.from("material_master").upsert({ rm_code: patch.rm_code, plant: "Khatwad" }, { onConflict: "rm_code", ignoreDuplicates: true });
    const { data, error } = await admin.from(tableFor(kind))
      .update(patch).eq("id", params.id).eq("origin", "manual").select("id");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data || data.length === 0) return NextResponse.json({ error: "only manual entries can be edited" }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}

// Delete a manual entry + its fifo batch (cascades stock_movements).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const kind = new URL(req.url).searchParams.get("kind") === "transfer" ? "transfer" : "grn";
  try {
    const admin = getAdmin();
    const { data: rows } = await admin.from(tableFor(kind)).select("origin").eq("id", params.id).single();
    if (!rows) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (rows.origin !== "manual") return NextResponse.json({ error: "only manual entries can be deleted" }, { status: 403 });

    await admin.from("fifo_batches").delete().eq("source_type", sourceTypeFor(kind)).eq("source_id", params.id);
    const { error } = await admin.from(tableFor(kind)).delete().eq("id", params.id).eq("origin", "manual");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
