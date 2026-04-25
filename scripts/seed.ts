/**
 * 匯入可選秀名單（含黃君颺；不含兩位隊長）並重設選秀狀態。
 * 用法：在專案根目錄建立 .env.local（或 .env）含 Supabase 變數後執行
 *   npm run seed
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { createClient } from "@supabase/supabase-js";
import { PLAYER_SEED } from "../src/data/players";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!url || !key) {
    console.error("需要 NEXT_PUBLIC_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const supa = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const keepSlugs = new Set(PLAYER_SEED.map((p) => p.slug));

  for (const p of PLAYER_SEED) {
    const { error } = await supa.from("players").upsert(
      {
        slug: p.slug,
        name: p.name,
        title: p.title,
        blurb: p.blurb,
        fun_power: p.funPower,
        quirk: p.quirk,
        news_headline: p.newsHeadline,
        display_order: p.displayOrder,
        team_key: null,
        picked: false,
        picked_at: null,
        wants_trade: false,
      },
      { onConflict: "slug" }
    );
    if (error) {
      console.error("upsert", p.slug, error.message);
      process.exit(1);
    }
  }

  const { data: existing, error: listErr } = await supa
    .from("players")
    .select("id, slug");
  if (listErr) {
    console.error("list players", listErr.message);
    process.exit(1);
  }
  for (const row of existing ?? []) {
    if (row.slug && !keepSlugs.has(row.slug)) {
      const { error: derr } = await supa.from("players").delete().eq("id", row.id);
      if (derr) {
        console.error("delete", row.slug, derr.message);
        process.exit(1);
      }
    }
  }

  const { error: rerr } = await supa.rpc("reset_draft");
  if (rerr) {
    console.error("reset_draft", rerr.message);
    process.exit(1);
  }

  console.log("已匯入", PLAYER_SEED.length, "位球員並重設狀態。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
