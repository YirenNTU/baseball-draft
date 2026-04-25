import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/factory";
import { TEAM_A, TEAM_B } from "@/data/players";
import type { Json } from "@/lib/supabase/types";

type Body = { slug?: string; team?: "a" | "b" };

function parseBody(json: unknown): Body {
  if (!json || typeof json !== "object") return {};
  const o = json as Record<string, unknown>;
  const slug = typeof o.slug === "string" ? o.slug : undefined;
  const team = o.team === "a" || o.team === "b" ? o.team : undefined;
  return { slug, team };
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase 未設定" }, { status: 503 });
  }
  const body = parseBody(await req.json().catch(() => ({})));
  const { slug, team } = body;
  if (!slug || !team) {
    return NextResponse.json(
      { error: "需要 slug, team" },
      { status: 400 }
    );
  }

  const supa = createServiceClient();
  const { data, error } = await supa.rpc("apply_pick", {
    p_slug: slug,
    p_team: team,
  });
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  const result = data as Json;
  if (
    result &&
    typeof result === "object" &&
    "ok" in result &&
    (result as { ok?: boolean }).ok === false
  ) {
    return NextResponse.json({ result: data }, { status: 400 });
  }
  return NextResponse.json({
    result: data,
    teamLabel:
      team === "a" ? { key: team, captain: TEAM_A.captain } : { key: team, captain: TEAM_B.captain },
  });
}
