import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/factory";
import { normalizeName } from "@/lib/participantRole";

type Body = {
  slug?: string;
  wantsTrade?: boolean;
  participantName?: string;
};

function parseBody(json: unknown): Body {
  if (!json || typeof json !== "object") return {};
  const o = json as Record<string, unknown>;
  return {
    slug: typeof o.slug === "string" ? o.slug : undefined,
    wantsTrade: typeof o.wantsTrade === "boolean" ? o.wantsTrade : undefined,
    participantName:
      typeof o.participantName === "string" ? o.participantName : undefined,
  };
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase 未設定" }, { status: 503 });
  }
  const body = parseBody(await req.json().catch(() => ({})));
  const { slug, wantsTrade, participantName } = body;
  if (!slug || wantsTrade === undefined || !participantName) {
    return NextResponse.json(
      { error: "需要 slug, wantsTrade, participantName" },
      { status: 400 }
    );
  }

  const supa = createServiceClient();
  const { data: st, error: stErr } = await supa
    .from("draft_state")
    .select("is_complete")
    .eq("id", 1)
    .single();
  if (stErr || !st) {
    return NextResponse.json({ error: stErr?.message ?? "讀取狀態失敗" }, { status: 500 });
  }
  if (!st.is_complete) {
    return NextResponse.json(
      { result: { ok: false, error: "draft_not_complete" } },
      { status: 400 }
    );
  }

  const { data: pl, error: pErr } = await supa
    .from("players")
    .select("id, name, picked, team_key, slug")
    .eq("slug", slug)
    .single();
  if (pErr || !pl) {
    return NextResponse.json({ result: { ok: false, error: "not_found" } }, { status: 400 });
  }
  if (!pl.picked || (pl.team_key !== "a" && pl.team_key !== "b")) {
    return NextResponse.json(
      { result: { ok: false, error: "not_in_roster" } },
      { status: 400 }
    );
  }
  if (normalizeName(participantName) !== normalizeName(pl.name)) {
    return NextResponse.json(
      { error: "僅能為本人變更（姓名需與閘道內、名單上一致）" },
      { status: 403 }
    );
  }

  const { error: uErr } = await supa
    .from("players")
    .update({ wants_trade: wantsTrade })
    .eq("id", pl.id);
  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
