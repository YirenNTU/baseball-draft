import Link from "next/link";
import { BRAND } from "@/lib/branding";
import { DRAFT_POOL_SIZE } from "@/data/players";

function hasSupabaseUrl() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export default function Home() {
  const live = hasSupabaseUrl();
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 py-12 text-slate-100">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/90">
          {BRAND.enLine}
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight text-white">
          {BRAND.shortTitle}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">臺大物理系</p>
        <p className="mt-4 text-slate-400">
          林柏喬 × 徐振華 · {DRAFT_POOL_SIZE} 人可選 · 交替制 ·
          <span className="text-slate-500"> 文案為系內玩梗</span>
          {live ? " · 即時" : " · 本機預覽"}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-amber-500 px-6 py-4 text-lg font-bold text-slate-900 shadow-lg shadow-amber-900/30 transition hover:bg-amber-400 sm:w-auto"
            href="/draft"
          >
            進入選秀
          </Link>
          <Link
            className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl border border-slate-600 px-6 py-4 text-lg font-bold text-slate-200 transition hover:border-slate-500 sm:w-auto"
            href="/result"
          >
            結果
          </Link>
        </div>
        <p className="mt-8 text-left text-sm leading-relaxed text-slate-500">
          {!live && (
            <>
              尚未設定 <code className="text-amber-500/80">NEXT_PUBLIC_SUPABASE_URL</code>
              時，會以本機 Mock 執行，方便你先看畫面。派對前請參考 README
              建立 Supabase 專案、匯入 migration、執行 seed 並在 Vercel
              設定環境變數。
            </>
          )}
          {live && "已連 Supabase，多人開啟同一部署網址即可即時同步。"}
        </p>
      </div>
    </div>
  );
}
