"use client";

import { useState } from "react";
import { TEAM_A, TEAM_B, type PublicPlayer } from "@/data/players";

type Props = {
  teamA: PublicPlayer[];
  teamB: PublicPlayer[];
  isSubmitting: boolean;
  lastError: string | null;
  onExecute: (slugFromA: string, slugFromB: string) => void | Promise<void>;
};

export function TradePanel({
  teamA,
  teamB,
  isSubmitting,
  lastError,
  onExecute,
}: Props) {
  const [slugA, setSlugA] = useState("");
  const [slugB, setSlugB] = useState("");

  const canRun =
    slugA &&
    slugB &&
    slugA !== slugB &&
    teamA.some((p) => p.slug === slugA) &&
    teamB.some((p) => p.slug === slugB) &&
    !isSubmitting;

  return (
    <section className="mt-10 rounded-2xl border border-slate-600/80 bg-slate-900/40 p-4">
      <h3 className="text-lg font-bold text-slate-100">選秀後交易（1:1）</h3>
      <p className="mt-1 text-sm text-slate-400">
        各選一名互換陣容。僅
        <strong className="text-amber-200/90"> 隊長 </strong>
        可執行，且須在
        <strong className="text-amber-200/90">全員入選且選秀已結算</strong>之後。
      </p>
      {lastError && (
        <p
          className="mt-3 rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {lastError}
        </p>
      )}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-amber-500/90">
            由 {TEAM_A.captain} 隊 交出
          </label>
          <select
            value={slugA}
            onChange={(e) => setSlugA(e.target.value)}
            className="mt-1 w-full rounded-lg border border-amber-600/40 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">— 選擇 —</option>
            {teamA.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}（{p.fun_power}）
                {p.wants_trade ? " · Trade me" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-sky-500/90">
            由 {TEAM_B.captain} 隊 交出
          </label>
          <select
            value={slugB}
            onChange={(e) => setSlugB(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sky-600/40 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">— 選擇 —</option>
            {teamB.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}（{p.fun_power}）
                {p.wants_trade ? " · Trade me" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canRun}
          onClick={() => {
            void onExecute(slugA, slugB);
          }}
          className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "處理中…" : "執行交易"}
        </button>
        <p className="text-xs text-slate-500">執行後陣容即時更新（含 Realtime）。</p>
      </div>
    </section>
  );
}
