import type { PublicPlayer } from "@/data/players";
import { TEAM_A, TEAM_B } from "@/data/players";

export type ParticipantRole = "view" | "a" | "b";

const NFKC = (s: string) => s.normalize("NFKC");

/** 前後空白、全形空白收斂；不強制全形/半形姓名異體字替換。 */
export function normalizeName(input: string): string {
  return NFKC(input)
    .trim()
    .replace(/[\s\u3000]+/g, " ");
}

/**
 * 僅兩位隊長真實全名可取得選秀 UI；其餘為觀戰。
 * 實際選人由 RPC、輪次在後端驗證（/api/pick 不再要求暗號）。
 */
export function roleFromRealName(name: string): ParticipantRole {
  const n = normalizeName(name);
  if (n === normalizeName(TEAM_A.captain)) return "a";
  if (n === normalizeName(TEAM_B.captain)) return "b";
  return "view";
}

/** 在已入選的球員中，依閘道姓名尋找本人（觀戰可為名單內真名）。 */
export function pickedPlayerMatchingName(
  players: PublicPlayer[],
  name: string
): PublicPlayer | null {
  const n = normalizeName(name);
  for (const p of players) {
    if (p.picked && normalizeName(p.name) === n) return p;
  }
  return null;
}
