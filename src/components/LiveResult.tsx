"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/factory";
import { PublicPlayer } from "@/data/players";
import type { ParticipantRole } from "@/lib/participantRole";
import { ResultBoard } from "./ResultBoard";

type Props = { participantName: string; role: ParticipantRole };

export function LiveResult({ participantName, role }: Props) {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [tradeErr, setTradeErr] = useState<string | null>(null);
  const [tradeSub, setTradeSub] = useState(false);
  const [meErr, setMeErr] = useState<string | null>(null);
  const [meSub, setMeSub] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    const supa = createBrowserClient();
    const { data, error } = await supa
      .from("players")
      .select(
        "id, slug, name, image_path, title, blurb, fun_power, quirk, news_headline, display_order, team_key, picked, picked_at, wants_trade"
      );
    if (error) {
      setErr(error.message);
      return;
    }
    setPlayers(
      (data as PublicPlayer[]).sort((a, b) => a.display_order - b.display_order)
    );
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const supa = createBrowserClient();
    const ch = supa
      .channel("result-ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, () => {
        setTimeout(() => {
          void load();
        }, 0);
      })
      .subscribe();
    return () => {
      void supa.removeChannel(ch);
    };
  }, [load]);

  const onExecuteTrade = useCallback(
    async (slugFromA: string, slugFromB: string) => {
      setTradeErr(null);
      setTradeSub(true);
      try {
        const res = await fetch("/api/trade", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slugFromA, slugFromB }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          result?: { ok?: boolean; error?: string };
          error?: string;
        };
        if (!res.ok) {
          setTradeErr(
            body.error ?? (typeof body === "string" ? String(body) : "交易失敗")
          );
          return;
        }
        if (body.result && body.result.ok === false) {
          const e = body.result.error;
          if (e === "draft_not_complete")
            setTradeErr("選秀尚未結算，暫不能交易。請在選秀全數選完且完成後重試。");
          else if (e === "not_on_team_a")
            setTradeErr("「由甲組交出」的球員必須隸屬甲組；請自選單重選或重整頁面。");
          else if (e === "not_on_team_b")
            setTradeErr("「由乙組交出」的球員必須隸屬乙組；請自選單重選或重整頁面。");
          else if (e === "invalid_slugs")
            setTradeErr("請在兩邊各選一名、且兩人不可相同。");
          else
            setTradeErr(String(e ?? "交易失敗"));
          return;
        }
        await load();
        setTradeErr(null);
      } catch (e) {
        setTradeErr(e instanceof Error ? e.message : "網路錯誤");
      } finally {
        setTradeSub(false);
      }
    },
    [load]
  );

  const onToggleTradeMe = useCallback(
    async (slug: string, wantsTrade: boolean) => {
      setMeErr(null);
      setMeSub(true);
      try {
        const res = await fetch("/api/trade-me", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            slug,
            wantsTrade,
            participantName,
          }),
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

  if (err) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950 p-4 text-center text-red-200">
        {err}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950 text-slate-300">
        載入中…
      </div>
    );
  }

  return (
    <ResultBoard
      players={players}
      participantName={participantName}
      role={role}
      onExecuteTrade={role === "a" || role === "b" ? onExecuteTrade : undefined}
      tradeError={tradeErr}
      tradeIsSubmitting={tradeSub}
      onToggleTradeMe={onToggleTradeMe}
      tradeMeError={meErr}
      tradeMeIsSubmitting={meSub}
    />
  );
}
