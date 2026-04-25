"use client";

import Link from "next/link";
import { DRAFT_POOL_SIZE, PublicPlayer, TEAM_A, TEAM_B } from "@/data/players";
import { BRAND } from "@/lib/branding";
import type { ParticipantRole } from "@/lib/participantRole";
import { PlayerImage } from "./PlayerImage";
import { TradeMeSection } from "./TradeMeSection";
import { TradePanel } from "./TradePanel";

type Props = {
  players: PublicPlayer[];
  isMock?: boolean;
  participantName: string;
  role: ParticipantRole;
  onExecuteTrade?: (slugFromA: string, slugFromB: string) => void | Promise<void>;
  tradeError?: string | null;
  tradeIsSubmitting?: boolean;
  onToggleTradeMe?: (slug: string, wantsTrade: boolean) => void | Promise<void>;
  tradeMeError?: string | null;
  tradeMeIsSubmitting?: boolean;
};

function teamSide(team: "a" | "b", list: PublicPlayer[]) {
  const meta = team === "a" ? TEAM_A : TEAM_B;
  const sum = list.reduce((s, p) => s + p.fun_power, 0);
  const avg = list.length ? Math.round(sum / list.length) : 0;
  return { meta, list, avg };
}

function mvp(players: PublicPlayer[]) {
  if (!players.length) return null;
  return players.reduce((a, b) => (a.fun_power >= b.fun_power ? a : b));
}

export function ResultBoard({
  players,
  isMock,
  participantName,
  role,
  onExecuteTrade,
  tradeError = null,
  tradeIsSubmitting = false,
  onToggleTradeMe,
  tradeMeError = null,
  tradeMeIsSubmitting = false,
}: Props) {
  const sideA = teamSide(
    "a",
    players.filter((p) => p.team_key === "a")
  );
  const sideB = teamSide(
    "b",
    players.filter((p) => p.team_key === "b")
  );
  const m = mvp(players);
  const done = players.length > 0 && players.every((p) => p.picked);
  const isCaptain = role === "a" || role === "b";
  const canShowTrade = done && isCaptain && onExecuteTrade;
  if (!done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-slate-200">
        <p className="text-xs text-slate-500">觀看身分：{participantName}</p>
        <p>選秀尚未完成。</p>
        <Link className="text-amber-400 underline" href="/draft">
          回選秀
        </Link>
        {isMock && (
          <p className="text-xs text-slate-500">
            本機：同一分頁先跑完 {DRAFT_POOL_SIZE} 輪
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="min-h-dvh bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs text-slate-500">觀看身分：{participantName}</p>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/90">
          {BRAND.enLine}
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">選秀結果</h1>
        <p className="mt-1 text-slate-400">本場最高戰力</p>
        {m && (
          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 md:flex-row">
            <PlayerImage src={m.image_path} name={m.name} size={140} />
            <div>
              <h2 className="text-2xl font-extrabold text-amber-200">{m.name}</h2>
              <p className="text-sm text-amber-500/90">{m.title}</p>
              <p className="mt-2 text-sm text-slate-300">{m.blurb}</p>
              <p className="mt-2 text-sm text-amber-300">戰力 {m.fun_power}</p>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-amber-500/30 p-4">
            <h3 className="text-lg font-bold text-amber-200">{sideA.meta.name}</h3>
            <p className="text-sm text-slate-400">隊長 {sideA.meta.captain} · 均戰力 {sideA.avg}</p>
            <ul className="mt-3 space-y-2">
              {sideA.list.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="w-6 text-slate-500">{p.fun_power}</span>
                  <span className="min-w-0">
                    {p.name}
                    {p.wants_trade && (
                      <span className="ml-1.5 inline-block rounded border border-rose-500/40 bg-rose-950/50 px-1 py-0.5 text-[9px] font-bold uppercase text-rose-200/80">
                        Trade me
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-sky-500/30 p-4">
            <h3 className="text-lg font-bold text-sky-200">{sideB.meta.name}</h3>
            <p className="text-sm text-slate-400">隊長 {sideB.meta.captain} · 均戰力 {sideB.avg}</p>
            <ul className="mt-3 space-y-2">
              {sideB.list.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="w-6 text-slate-500">{p.fun_power}</span>
                  <span className="min-w-0">
                    {p.name}
                    {p.wants_trade && (
                      <span className="ml-1.5 inline-block rounded border border-rose-500/40 bg-rose-950/50 px-1 py-0.5 text-[9px] font-bold uppercase text-rose-200/80">
                        Trade me
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {onToggleTradeMe && (
          <TradeMeSection
            players={players}
            participantName={participantName}
            draftSettled
            isSubmitting={tradeMeIsSubmitting}
            lastError={tradeMeError}
            onToggle={onToggleTradeMe}
          />
        )}

        {canShowTrade && onExecuteTrade && (
          <TradePanel
            teamA={sideA.list}
            teamB={sideB.list}
            isSubmitting={tradeIsSubmitting}
            lastError={tradeError}
            onExecute={onExecuteTrade}
          />
        )}

        <p className="mt-8 text-center text-xs text-slate-600">
          <Link href="/draft" className="text-amber-500/80 underline">
            回選秀
          </Link>
        </p>
      </div>
    </div>
  );
}
