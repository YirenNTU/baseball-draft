"use client";

import { TEAM_A, TEAM_B, type PublicPlayer } from "@/data/players";
import { pickedPlayerMatchingName } from "@/lib/participantRole";

type Props = {
  /** 全體人員含 wants_trade，通常為已分隊後 */
  players: PublicPlayer[];
  /** NameGate 姓名 */
  participantName: string;
  /** 選秀已結算且人員在陣中時才能操作 / 顯示 */
  draftSettled: boolean;
  isSubmitting: boolean;
  lastError: string | null;
  onToggle: (slug: string, wantsTrade: boolean) => void | Promise<void>;
  /** 標題變體 */
  layout?: "default" | "compact";
};

function TradeBadge() {
  return (
    <span className="rounded border border-rose-500/40 bg-rose-950/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-200/90">
      Trade me
    </span>
  );
}

export function TradeMeSection({
  players,
  participantName,
  draftSettled,
  isSubmitting,
  lastError,
  onToggle,
  layout = "default",
}: Props) {
  const inPool = players.filter(
    (p) => p.picked && p.team_key !== null
  ) as (PublicPlayer & { team_key: "a" | "b" })[];
  const aSide = inPool
    .filter((p) => p.team_key === "a")
    .sort((x, y) => (x.picked_at ?? "").localeCompare(y.picked_at ?? ""));
  const bSide = inPool
    .filter((p) => p.team_key === "b")
    .sort((x, y) => (x.picked_at ?? "").localeCompare(y.picked_at ?? ""));

  const asSelf = draftSettled ? pickedPlayerMatchingName(players, participantName) : null;
  const showSelfRow = asSelf && draftSettled;

  if (!draftSettled) {
    return null;
  }

  return (
    <section
      className={
        layout === "compact"
          ? "mt-6 rounded-2xl border border-slate-600/60 bg-slate-900/40 p-4"
          : "mt-10 rounded-2xl border border-slate-600/80 bg-slate-900/50 p-4"
      }
    >
      <h3 className="text-lg font-bold text-slate-100">交易意願（全員可見）</h3>
      <p className="mt-1 text-sm text-slate-400">
        已入選球員可提出 <strong className="text-rose-200/90">Trade me</strong>
        ；<strong>僅兩位隊長</strong>能於下方執行實際 1:1
        交換。提出意願不代表成交。
      </p>
      {lastError && (
        <p
          className="mt-3 rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          {lastError}
        </p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-bold uppercase text-amber-500/80">
            {TEAM_A.captain} 隊
          </h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            {aSide.length === 0 && (
              <li className="text-slate-500">（尚無人員）</li>
            )}
            {aSide.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span>
                  {p.name}
                  {p.wants_trade && (
                    <span className="ml-2">
                      <TradeBadge />
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-slate-500">{p.fun_power}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase text-sky-500/80">
            {TEAM_B.captain} 隊
          </h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            {bSide.length === 0 && (
              <li className="text-slate-500">（尚無人員）</li>
            )}
            {bSide.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span>
                  {p.name}
                  {p.wants_trade && (
                    <span className="ml-2">
                      <TradeBadge />
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-slate-500">{p.fun_power}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showSelfRow && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-950/20 p-3">
          <p className="text-sm text-slate-200">
            以閘道姓名，你是名單上的 <strong>{asSelf.name}</strong>。你可自薦
            &nbsp; Trade me 或收回。
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void onToggle(asSelf.slug, !asSelf.wants_trade)}
              className="rounded-lg bg-rose-500/90 px-4 py-2 text-sm font-bold text-rose-950 transition hover:bg-rose-400 disabled:opacity-50"
            >
              {isSubmitting
                ? "處理中…"
                : asSelf.wants_trade
                  ? "收回 Trade me"
                  : "我提出 Trade me"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
