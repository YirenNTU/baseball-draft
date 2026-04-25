"use client";

import { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";
import { PlayerImage } from "./PlayerImage";
import {
  TEAM_A,
  TEAM_B,
  getBoundPartnerSlug,
  type PublicPlayer,
} from "@/data/players";

type Props = {
  players: PublicPlayer[];
  currentTeam: "a" | "b" | null;
  isComplete: boolean;
  myTeam: "a" | "b" | "view";
  onPick: (slug: string) => void;
  canPick: boolean;
  lastError: string | null;
};

const teamName = (k: "a" | "b") => (k === "a" ? TEAM_A : TEAM_B);

export function PlayerGrid({
  players,
  currentTeam,
  isComplete,
  myTeam,
  onPick,
  canPick,
  lastError,
}: Props) {
  const [lightboxPlayer, setLightboxPlayer] = useState<PublicPlayer | null>(null);
  const available = players.filter((p) => !p.picked);
  return (
    <div className="space-y-4">
      <ImageLightbox
        key={lightboxPlayer?.id ?? "lightbox-off"}
        player={lightboxPlayer}
        onClose={() => setLightboxPlayer(null)}
      />
      {lastError && (
        <p
          className="rounded-lg border border-red-500/50 bg-red-950/50 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {lastError}
        </p>
      )}
      {available.length === 0 && isComplete && (
        <p className="text-center text-slate-500">全員入隊，選秀結束。</p>
      )}
      {available.length === 0 && !isComplete && (
        <p className="text-center text-amber-200/80">
          待選名單為空。若剛建資料庫，請在專案執行 seed。
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((p) => {
          const isMyTurn =
            canPick &&
            !isComplete &&
            myTeam !== "view" &&
            currentTeam != null &&
            currentTeam === myTeam;
          const boundPartnerSlug = getBoundPartnerSlug(p.slug);
          const boundPartner = boundPartnerSlug
            ? players.find((x) => x.slug === boundPartnerSlug)
            : null;
          return (
            <article
              key={p.id}
              className={`text-left transition ${
                isMyTurn
                  ? "ring-2 ring-amber-400/80 shadow-lg shadow-amber-900/20"
                  : "opacity-80 hover:opacity-100"
              } flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/60`}
            >
              <div className="flex gap-3 p-3">
                <button
                  type="button"
                  className="shrink-0 rounded-xl transition ring-offset-2 ring-offset-slate-900 hover:ring-2 hover:ring-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
                  onClick={() => setLightboxPlayer(p)}
                  aria-label={`查看 ${p.name} 大圖`}
                >
                  <PlayerImage src={p.image_path} name={p.name} size={100} />
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-amber-100">{p.name}</h3>
                  {boundPartner && (
                    <p className="mt-0.5 text-[10px] leading-tight text-rose-200/90">
                      與 {boundPartner.name} 綁選（點加入則兩人同隊）
                    </p>
                  )}
                  <p className="text-xs font-medium text-amber-500/90">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {p.blurb}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                      戰力 {p.fun_power}
                    </span>
                    <span className="rounded bg-emerald-900/50 px-1.5 py-0.5 text-[10px] text-emerald-200/90">
                      缺點：{p.quirk.slice(0, 20)}…
                    </span>
                  </div>
                </div>
              </div>
              <p className="border-t border-slate-800 px-3 py-2 text-[11px] leading-snug text-slate-500">
                <span className="text-amber-600/90">新聞</span> {p.news_headline}
              </p>
              {isMyTurn && currentTeam && (
                <div className="border-t border-amber-500/30">
                  <p className="bg-amber-500/20 py-1.5 text-center text-xs font-bold text-amber-200">
                    選給 {teamName(currentTeam).captain}
                  </p>
                  <button
                    type="button"
                    className="w-full bg-amber-500 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset"
                    onClick={() => onPick(p.slug)}
                  >
                    加入
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
