import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/factory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase 未設定" },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  const supa = createServiceClient();
  const { data: players, error: playersError } = await supa
    .from("players")
    .select(
      "id, slug, name, title, blurb, fun_power, quirk, news_headline, display_order, team_key, picked, picked_at, wants_trade"
    )
    .order("display_order", { ascending: true });
  if (playersError) {
    return NextResponse.json(
      { error: playersError.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }

  const { data: state, error: stateError } = await supa
    .from("draft_state")
    .select("*")
    .eq("id", 1)
    .single();
  if (stateError) {
    return NextResponse.json(
      { error: stateError.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json({ players, state }, { headers: NO_STORE_HEADERS });
}
