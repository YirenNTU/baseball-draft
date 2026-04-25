"use client";

import { useCallback, useEffect, useState } from "react";
import {
  normalizeName,
  roleFromRealName,
  type ParticipantRole,
} from "@/lib/participantRole";
import { BRAND } from "@/lib/branding";

export const PARTICIPANT_NAME_KEY = "draft_participant_name";

type ReadyCtx = { name: string; role: ParticipantRole };

type Props = {
  children: (ctx: ReadyCtx) => React.ReactNode;
  /** 結果頁等只需姓名時仍用同一 key */
  title?: string;
};

export function NameGate({ children, title = "請輸入真實姓名" }: Props) {
  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState<string | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const s = sessionStorage.getItem(PARTICIPANT_NAME_KEY);
        if (s) setStored(s);
      } catch {
        // ignore
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const save = useCallback(() => {
    const n = normalizeName(input);
    if (!n) return;
    try {
      sessionStorage.setItem(PARTICIPANT_NAME_KEY, n);
    } catch {
      // ignore
    }
    setStored(n);
  }, [input]);

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950 text-slate-400">
        載入中…
      </div>
    );
  }

  if (!stored) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-slate-950 px-4 text-slate-100">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500/90">
          {BRAND.enLine}
        </p>
        <h1 className="mt-2 text-2xl font-black text-white">{title}</h1>
        <p className="mt-2 max-w-sm text-center text-sm text-slate-500">
          此姓名僅用於本機顯示與身分辨識。僅兩位隊長可進入選秀介面，其他人為觀戰。
        </p>
        <form
          className="mt-8 flex w-full max-w-sm flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            type="text"
            autoComplete="name"
            placeholder="與真實姓名一致"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-amber-500 py-3 text-sm font-bold text-slate-900"
          >
            進入
          </button>
        </form>
      </div>
    );
  }

  const role = roleFromRealName(stored);
  return <>{children({ name: stored, role })}</>;
}
