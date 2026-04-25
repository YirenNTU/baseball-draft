import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/factory";

type Body = { secret?: string };

function parseBody(json: unknown): Body {
  if (!json || typeof json !== "object") return {};
  const o = json as Record<string, unknown>;
  return { secret: typeof o.secret === "string" ? o.secret : undefined };
}

/**
 * 重開一輪選秀：需 DRAFT_RESET_SECRET（測試／整隊前用）
 */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase 未設定" }, { status: 503 });
  }
  const { secret } = parseBody(await req.json().catch(() => ({})));
  const expected = process.env.DRAFT_RESET_SECRET;
  if (!expected || !secret || secret !== expected) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }
  const supa = createServiceClient();
  const { error } = await supa.rpc("reset_draft");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
