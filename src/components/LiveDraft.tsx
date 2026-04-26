"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/factory";
import type { ParticipantRole } from "@/lib/participantRole";
import { DraftShell } from "./DraftShell";
import { PublicPlayer, DraftStateRow } from "@/data/players";

function mapPlayers(rows: PublicPlayer[]) {
  return [...rows].sort((a, b) => a.display_order - b.display_order);
}

type Props = {
  participantName: string;
  role: ParticipantRole;
};

type DraftSnapshot = {
  players?: PublicPlayer[];
  state?: DraftStateRow;
  error?: string;
};

export function LiveDraft({ participantName, role }: Props) {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [state, setState] = useState<DraftStateRow | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meErr, setMeErr] = useState<string | null>(null);
  const [meSub, setMeSub] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/draft-state", { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as DraftSnapshot;
    if (!res.ok) {
      setErr(body.error ?? "讀取選秀狀態失敗");
      return;
    }
    if (!body.players || !body.state) {
      setErr("讀取選秀狀態失敗");
      return;
    }
    setPlayers(mapPlayers(body.players));
    setState(body.state);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void load().finally(() => {
        setLoading(false);
      });
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const supa = createBrowserClient();
    const ch = supa
      .channel("draft-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, () => {
        setTimeout(() => {
          void load();
        }, 0);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "draft_state" }, () => {
        setTimeout(() => {
          void load();
        }, 0);
      })
      .subscribe();
    return () => {
      void supa.removeChannel(ch);
    };
  }, [load]);

  // Realtime WebSockets are often blocked (corp Wi-Fi, extensions). Polling keeps
  // other participants in sync when postgres_changes does not fire.
  const draftActive = Boolean(state && !state.is_complete);
  useEffect(() => {
    if (!draftActive) return;
    const id = setInterval(() => {
      void load();
    }, 3000);
    return () => clearInterval(id);
  }, [draftActive, load]);

  const onToggleTradeMe = useCallback(
    async (slug: string, wantsTrade: boolean) => {
      setMeErr(null);
      setMeSub(true);
      try {
        const res = await fetch("/api/trade-me", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slug, wantsTrade, participantName }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          result?: { ok?: boolean; error?: string };
          error?: string;
        };
        if (!res.ok) {
          setMeErr(
            body.error ?? (body.result as { error?: string } | undefined)?.error ?? "變更失敗"
          );
          return;
        }
        if (body.result && body.result.ok === false) {
          if (body.result.error === "draft_not_complete")
            setMeErr("選秀尚未結算。");
          else if (body.result.error === "not_in_roster")
            setMeErr("僅在名單上且已分隊可提出。");
          else
            setMeErr(String(body.result.error ?? "變更失敗"));
          return;
        }
        await load();
      } catch (e) {
        setMeErr(e instanceof Error ? e.message : "網路錯誤");
      } finally {
        setMeSub(false);
      }
    },
    [load, participantName]
  );

  const onPick = async (slug: string) => {
    if (!state) return;
    if (state.is_complete) return;
    const team = state.current_team_key;
    setIsSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/pick", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, team }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        result?: { ok?: boolean; error?: string; current?: string };
        error?: string;
      };
      if (!res.ok) {
        if (body.result && body.result.error === "wrong_turn") {
          setErr("還沒輪到這一隊，或畫面落後。重整試試。");
        } else if (body.result && body.result.error === "already_picked") {
          setErr("此人已被選。");
        } else if (body.result && body.result.error === "bound_partner_picked") {
          setErr("綁選對象已入選，畫面可能落後。請重整。");
        } else if (body.result && body.result.error === "bound_partner_missing") {
          setErr("找不到綁選成員。請執行 seed 並檢查名單。");
        } else {
          setErr(body.error ?? (typeof body === "string" ? body : "選人失敗"));
        }
        return;
      }
      if (body.result && typeof body.result === "object" && body.result.ok === false) {
        setErr(String(body.result.error ?? "選人失敗"));
        return;
      }
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "網路錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950 text-slate-200">
        <p>載入中…</p>
      </div>
    );
  }
  if (!state) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-slate-950 px-4 text-center text-slate-200">
        <p className="text-red-300">載入失敗：{err ?? "未知錯誤"}</p>
        <p className="max-w-md text-sm text-slate-500">
          確認已執行 migration（含
          <code className="text-amber-500/90">apply_pick 總人數</code>）並{" "}
          <code className="text-amber-500/90">npm run seed</code> 匯入名單。
        </p>
      </div>
    );
  }

  return (
    <DraftShell
      role={role}
      participantName={participantName}
      players={players}
      currentTeam={state.current_team_key}
      isComplete={state.is_complete}
      lastError={err}
      onPick={onPick}
      isSubmitting={isSubmitting}
      tradeAfterDraft={
        state.is_complete
          ? { onToggle: onToggleTradeMe, isSubmitting: meSub, lastError: meErr }
          : undefined
      }
    />
  );
}
