"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicPlayer } from "@/data/players";
import { pickedPlayerMatchingName, type ParticipantRole } from "@/lib/participantRole";
import { ResultBoard } from "./ResultBoard";

const KEY = "draft_mock_snapshot_v1";

type Props = { participantName: string; role: ParticipantRole };

export function MockResult({ participantName, role }: Props) {
  const [players, setPlayers] = useState<PublicPlayer[] | null>(null);
  const [tradeErr, setTradeErr] = useState<string | null>(null);
  const [tradeSub, setTradeSub] = useState(false);
  const [meErr, setMeErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(KEY);
        if (!raw) {
          setPlayers([]);
          return;
        }
        const parsed = JSON.parse(raw) as { players?: PublicPlayer[] };
        const list = parsed?.players ?? [];
        setPlayers(
          list.map((p) => ({ ...p, wants_trade: p.wants_trade ?? false }))
        );
      } catch {
        setPlayers([]);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (players === null) return;
    try {
      const raw = sessionStorage.getItem(KEY);
      const parsed = raw
        ? (JSON.parse(raw) as { players?: PublicPlayer[]; state?: object })
        : { state: undefined };
      sessionStorage.setItem(
        KEY,
        JSON.stringify({ ...parsed, players })
      );
    } catch {
      // ignore
    }
  }, [players]);

  const onToggleTradeMe = useCallback(
    (slug: string, wantsTrade: boolean) => {
      setMeErr(null);
      setPlayers((prev) => {
        if (!prev) return prev;
        const me = pickedPlayerMatchingName(prev, participantName);
        if (!me || me.slug !== slug) {
          queueMicrotask(() =>
            setMeErr("僅能為本人變更（閘道姓名需與名單上相符）。")
          );
          return prev;
        }
        return prev.map((p) =>
          p.slug === slug ? { ...p, wants_trade: wantsTrade } : p
        );
      });
    },
    [participantName]
  );

  const onExecuteTrade = useCallback(
    (slugFromA: string, slugFromB: string) => {
      setTradeSub(true);
      setTradeErr(null);
      setPlayers((prev) => {
        if (!prev) {
          setTradeSub(false);
          return prev;
        }
        const pa = prev.find((p) => p.slug === slugFromA);
        const pb = prev.find((p) => p.slug === slugFromB);
        if (!pa || !pb) {
          setTradeErr("找不到人選。請重試。");
          queueMicrotask(() => setTradeSub(false));
          return prev;
        }
        if (pa.team_key !== "a" || pb.team_key !== "b") {
          setTradeErr("請確認「甲組出」在甲組、「乙組出」在乙組（或重整讀回最新陣容）。");
          queueMicrotask(() => setTradeSub(false));
          return prev;
        }
        if (slugFromA === slugFromB) {
          setTradeErr("兩人不可相同。");
          queueMicrotask(() => setTradeSub(false));
          return prev;
        }
        const now = new Date().toISOString();
        const next = prev.map((p) => {
          if (p.id === pa.id)
            return {
              ...p,
              team_key: "b" as const,
              picked_at: p.picked_at ?? now,
              wants_trade: false,
            };
          if (p.id === pb.id)
            return {
              ...p,
              team_key: "a" as const,
              picked_at: p.picked_at ?? now,
              wants_trade: false,
            };
          return p;
        });
        queueMicrotask(() => setTradeSub(false));
        return next;
      });
    },
    []
  );

  if (players === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950 text-slate-300">
        載入中…
      </div>
    );
  }

  return (
    <ResultBoard
      players={players}
      isMock
      participantName={participantName}
      role={role}
      onExecuteTrade={role === "a" || role === "b" ? onExecuteTrade : undefined}
      tradeError={tradeErr}
      tradeIsSubmitting={tradeSub}
      onToggleTradeMe={onToggleTradeMe}
      tradeMeError={meErr}
      tradeMeIsSubmitting={false}
    />
  );
}
