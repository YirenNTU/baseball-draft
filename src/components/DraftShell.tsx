"use client";

import Link from "next/link";
import { useMemo } from "react";
import { NewsTicker } from "./NewsTicker";
import { PlayerGrid } from "./PlayerGrid";
import { TradeMeSection } from "./TradeMeSection";
import { PublicPlayer, TEAM_A, TEAM_B } from "@/data/players";
import { BRAND } from "@/lib/branding";

import type { ParticipantRole } from "@/lib/participantRole";

type Props = {
  role: ParticipantRole;
  participantName: string;
  players: PublicPlayer[];
  currentTeam: "a" | "b";
  isComplete: boolean;
  lastError: string | null;
  onPick: (slug: string) => void | Promise<void>;
  isSubmitting: boolean;
  /** 例如 Mock 模式提示 */
  banner?: string;
  /** 選秀已結算時，球員 Trade me 自薦與眾人可見列表 */
  tradeAfterDraft?: {
    onToggle: (slug: string, wantsTrade: boolean) => void | Promise<void>;
    isSubmitting: boolean;
    lastError: string | null;
  };
};

function averagePower(list: PublicPlayer[]) {
  if (!list.length) return 0;
  return Math.round(
    list.reduce((s, p) => s + p.fun_power, 0) / list.length
  );
}

function TeamColumn({
  title,
  captain,
  caption,
  accent,
  roster,
}: {
  title: string;
  captain: string;
  caption: string;
  accent: "amber" | "sky";
  roster: PublicPlayer[];
}) {
  const avg = averagePower(roster);
  return (
    <section
      className={`rounded-2xl border p-4 ${
        accent === "amber"
          ? "border-amber-500/30 bg-amber-950/20"
          : "border-sky-500/30 bg-sky-950/20"
      }`}
    >
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
        {title}
      </h2>
      <p className="text-lg font-extrabold text-white">{captain}</p>
      <p className="text-xs text-slate-500">{caption}</p>
      <p className="mt-1 text-xs text-slate-500">均戰力 {avg}</p>
      <ul className="mt-3 space-y-1 text-sm text-slate-200">
        {roster.length === 0 && (
          <li className="text-slate-500">尚無人員</li>
        )}
        {roster.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2">
            <span className="min-w-0 flex flex-wrap items-center gap-1.5 truncate">
              {p.name}
              {p.wants_trade && (
                <span className="shrink-0 rounded border border-rose-500/30 bg-rose-950/40 px-1 py-0.5 text-[9px] font-bold uppercase text-rose-200/80">
                  Trade me
                </span>
              )}
            </span>
            <span className="shrink-0 text-slate-500">{p.fun_power}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DraftShell({
  role,
  participantName,
  players,
  currentTeam,
  isComplete,
  lastError,
  onPick,
  isSubmitting,
  banner,
  tradeAfterDraft,
}: Props) {
  const headlines = useMemo(
    () => players.map((p) => p.news_headline).filter(Boolean),
    [players]
  );
  const teamARoster = useMemo(
    () =>
      players
        .filter((p) => p.team_key === "a")
        .sort((a, b) => (a.picked_at ?? "").localeCompare(b.picked_at ?? "")),
    [players]
  );
  const teamBRoster = useMemo(
    () =>
      players
        .filter((p) => p.team_key === "b")
        .sort((a, b) => (a.picked_at ?? "").localeCompare(b.picked_at ?? "")),
    [players]
  );

  const canPickGrid =
    !isSubmitting && !isComplete && role !== "view" && currentTeam === role;

  return (
    <div className="min-h-dvh flex flex-col bg-slate-950 text-slate-100">
      {banner && (
        <div className="bg-amber-500/20 px-4 py-2 text-center text-sm text-amber-100">
          {banner}
        </div>
      )}
      <header className="border-b border-slate-800 bg-slate-900/50 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/90">
              {BRAND.enLine}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              {BRAND.shortTitle}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              真實姓名：{participantName}
              {role === "a" && (
                <span className="ml-1 text-amber-500/90">
                  · {TEAM_A.caption}
                </span>
              )}
              {role === "b" && (
                <span className="ml-1 text-sky-500/90">
                  · {TEAM_B.caption}
                </span>
              )}
              {role === "view" && <span className="ml-1">· 觀戰</span>}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {TEAM_A.captain} × {TEAM_B.captain} · 交替
              {isComplete ? (
                " · 已結束"
              ) : (
                <>
                  {" "}
                  · 輪到
                  <span className="font-bold text-amber-300">
                    {" "}
                    {currentTeam === "a" ? TEAM_A.captain : TEAM_B.captain}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {isComplete && (
              <Link
                href="/result"
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-900"
              >
                看結果
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <TeamColumn
            title={TEAM_A.name}
            captain={TEAM_A.captain}
            caption={TEAM_A.caption}
            accent="amber"
            roster={teamARoster}
          />
          <TeamColumn
            title={TEAM_B.name}
            captain={TEAM_B.captain}
            caption={TEAM_B.caption}
            accent="sky"
            roster={teamBRoster}
          />
        </div>

        <h2 className="mb-2 text-sm font-bold uppercase text-slate-500">
          待選名單
        </h2>
        {isComplete && (
          <p className="mb-4 text-amber-200">
            選秀結束。
            <Link className="ml-2 underline" href="/result">
              看結果
            </Link>
          </p>
        )}

        {isComplete && tradeAfterDraft && (
          <TradeMeSection
            players={players}
            participantName={participantName}
            draftSettled
            isSubmitting={tradeAfterDraft.isSubmitting}
            lastError={tradeAfterDraft.lastError}
            onToggle={tradeAfterDraft.onToggle}
            layout="compact"
          />
        )}

        <PlayerGrid
          players={players}
          currentTeam={isComplete ? null : currentTeam}
          isComplete={isComplete}
          myTeam={role}
          onPick={(slug) => {
            void onPick(slug);
          }}
          canPick={canPickGrid}
          lastError={lastError}
        />
      </div>

      <NewsTicker headlines={headlines} />
    </div>
  );
}
