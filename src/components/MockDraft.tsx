"use client";

import { useCallback, useEffect, useState } from "react";
import { pickedPlayerMatchingName, type ParticipantRole } from "@/lib/participantRole";
import {
  DRAFT_POOL_SIZE,
  PLAYER_SEED,
  PublicPlayer,
  DraftStateRow,
  getBoundPartnerSlug,
} from "@/data/players";
import { DraftShell } from "./DraftShell";

const STORAGE = {
  snapshot: "draft_mock_snapshot_v1" as const,
};

function buildInitialPlayers(): PublicPlayer[] {
  return PLAYER_SEED.map(
    (s) =>
      ({
        id: `mock-${s.slug}`,
        slug: s.slug,
        name: s.name,
        title: s.title,
        blurb: s.blurb,
        fun_power: s.funPower,
        quirk: s.quirk,
        news_headline: s.newsHeadline,
        display_order: s.displayOrder,
        team_key: null,
        picked: false,
        picked_at: null,
        wants_trade: false,
      }) as PublicPlayer
  );
}

type MockProps = {
  participantName: string;
  role: ParticipantRole;
};

/**
 * 本機 mock：不需 Supabase，方便先預習畫面（不會與遠端同步；狀態在 sessionStorage）
 */
export function MockDraft({ participantName, role }: MockProps) {
  const [players, setPlayers] = useState<PublicPlayer[]>(buildInitialPlayers);
  const [state, setState] = useState<DraftStateRow>({
    id: 1,
    current_team_key: "a",
    is_complete: false,
    updated_at: new Date().toISOString(),
  });
  const [err, setErr] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meErr, setMeErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const snap = sessionStorage.getItem(STORAGE.snapshot);
        if (snap) {
          const parsed = JSON.parse(snap) as {
            players: PublicPlayer[];
            state: DraftStateRow;
          };
          if (parsed?.players?.length)
            setPlayers(
              parsed.players.map((p) => ({
                ...p,
                wants_trade: p.wants_trade ?? false,
              }))
            );
          if (parsed?.state) setState(parsed.state);
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE.snapshot,
        JSON.stringify({ players, state })
      );
    } catch {
      // ignore
    }
  }, [players, state]);

  const onPick = useCallback(
    (slug: string) => {
      if (state.is_complete) return;
      setErr(null);
      const team = state.current_team_key;
      setIsSubmitting(true);
      setPlayers((prev) => {
        const target = prev.find((p) => p.slug === slug);
        if (!target || target.picked) {
          setErr("已被選或無此人");
          queueMicrotask(() => setIsSubmitting(false));
          return prev;
        }
        const boundPartnerSlug = getBoundPartnerSlug(slug);
        const slugs: string[] = [slug];
        if (boundPartnerSlug) {
          const partner = prev.find((p) => p.slug === boundPartnerSlug);
          if (!partner) {
            setErr("找不到綁選成員");
            queueMicrotask(() => setIsSubmitting(false));
            return prev;
          }
          if (partner.picked) {
            setErr("綁選成員已先入隊，資料狀態異常");
            queueMicrotask(() => setIsSubmitting(false));
            return prev;
          }
          slugs.push(boundPartnerSlug);
        }
        const now = new Date().toISOString();
        const setPick = (s: string) =>
          (p: PublicPlayer) =>
            p.slug === s
              ? { ...p, picked: true, team_key: team, picked_at: now }
              : p;
        let next = prev;
        for (const s of slugs) {
          next = next.map(setPick(s));
        }
        const total = next.filter((p) => p.picked).length;
        if (total >= DRAFT_POOL_SIZE) {
          setState((s) => ({ ...s, is_complete: true, updated_at: now }));
        } else {
          setState((s) => ({
            ...s,
            current_team_key: team === "a" ? "b" : "a",
            updated_at: now,
          }));
        }
        queueMicrotask(() => setIsSubmitting(false));
        return next;
      });
    },
    [state.current_team_key, state.is_complete]
  );

  const onToggleTradeMe = useCallback(
    (slug: string, wantsTrade: boolean) => {
      setMeErr(null);
      setPlayers((prev) => {
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
      banner="本機預覽 · 不連遠端。上線請設定 .env 連 Supabase。"
      tradeAfterDraft={
        state.is_complete
          ? { onToggle: onToggleTradeMe, isSubmitting: false, lastError: meErr }
          : undefined
      }
    />
  );
}
