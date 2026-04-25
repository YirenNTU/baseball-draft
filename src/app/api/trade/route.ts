import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/factory";
import type { Json } from "@/lib/supabase/types";

type Body = {
  slugFromA?: string;
  slugFromB?: string;
};

function parseBody(json: unknown): Body {
  if (!json || typeof json !== "object") return {};
  const o = json as Record<string, unknown>;
  return {
    slugFromA: typeof o.slugFromA === "string" ? o.slugFromA : undefined,
    slugFromB: typeof o.slugFromB === "string" ? o.slugFromB : undefined,
  };
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase 未設定" }, { status: 503 });
  }
  const body = parseBody(await req.json().catch(() => ({})));
  const { slugFromA, slugFromB } = body;
  if (!slugFromA || !slugFromB) {
    return NextResponse.json(
      { error: "需要 slugFromA, slugFromB" },
      { status: 400 }
    );
  }

  const supa = createServiceClient();
  const { data, error } = await supa.rpc("apply_trade", {
    p_slug_from_a: slugFromA,
    p_slug_from_b: slugFromB,
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
  return NextResponse.json({ result: data });
}
