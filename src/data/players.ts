/**
 * 可選秀名單（不含隊長；隊長僅在 TEAM_A / TEAM_B）
 * 圖片：public/players/<slug>.(jpg|png)
 */

export type PlayerSeed = {
  slug: string;
  name: string;
  imagePath: string;
  title: string;
  blurb: string;
  funPower: number;
  quirk: string;
  newsHeadline: string;
  displayOrder: number;
};

export const TEAM_A = {
  key: "a" as const,
  name: "普物甲組·Hamiltonian 柏喬軍",
  captain: "林柏喬",
  caption: "Jerry 的頭號弟子",
};

export const TEAM_B = {
  key: "b" as const,
  name: "費米面巡弋·振華艦隊",
  captain: "徐振華",
  caption: "粒子物理專家",
};

export const PLAYER_SEED: readonly PlayerSeed[] = [
  {
    slug: "chang-yi-jie",
    name: "張亦杰",
    imagePath: "/players/chang-yi-jie.jpg",
    title: "外野自走監視器｜皮克敏愛好者",
    blurb:
      "外野站位像在等公車，球飛過來先點頭致意再慢慢追。自稱皮克敏愛好者，漏接時會說小藍皮克敏在水裡忙，沒空幫忙撿球。",
    funPower: 78,
    quirk: "跑壘時會突然看向遠方，像在找今天掉隊的皮克敏。",
    newsHeadline:
      "【快訊】張亦杰接殺後比出安靜手勢 原因是他怕吵醒背包裡的皮克敏",
    displayOrder: 1,
  },
  {
    slug: "wu-yi-ren",
    name: "吳翌任",
    imagePath: "/players/wu-yi-ren.jpg",
    title: "一壘釘子戶｜踩壘包像在顧攤",
    blurb: "擊球聲很大，球很客氣。擅長把平凡的一壘安打跑成年度災難片，並在壘上跟對手聊到忘記幾出局。",
    funPower: 71,
    quirk: "上場前一定要整理袖子，整理到投手都想問需不需要熨斗。",
    newsHeadline:
      "吳翌任短打成功後自稱戰術大師 隊友表示那只是沒打好",
    displayOrder: 2,
  },
  {
    slug: "xu-jia-hao",
    name: "許家豪",
    imagePath: "/players/xu-jia-hao.jpg",
    title: "骰子型投手｜兄弟情濃度超標",
    blurb: "每一球都有驚喜包精神：可能三振、可能暴投、也可能直接把捕手的人生打亂。休息區跟隊友互動自帶 BL 預告片感，但本人堅稱只是戰友情太熱。",
    funPower: 75,
    quirk: "投球前會用力點頭，像跟捕手交換了一份不能播出的默契。",
    newsHeadline: "家豪牛棚熱身太有火花 觀眾要求主辦補上愛情線字幕",
    displayOrder: 3,
  },
  {
    slug: "huang-ze-rui",
    name: "黃則叡",
    imagePath: "/players/default.svg",
    title: "表情管理失敗王｜揮空也要點評世界",
    blurb: "打擊前看起來很有計畫，揮完之後只剩人生感悟。最擅長把三振講成『我剛剛有抓到感覺』。",
    funPower: 82,
    quirk: "被三振後會原地點頭，好像裁判其實講得很有道理。",
    newsHeadline: "則叡宣稱今天手感很好 目前證據只有他自己很敢講",
    displayOrder: 4,
  },
  {
    slug: "chen-guan-zhi",
    name: "陳冠志",
    imagePath: "/players/chen-guan-zhi.jpg",
    title: "一壘吉祥物｜球來就先祈禱",
    blurb: "守備風格主打一個『相信隊友，也相信奇蹟』。球進手套那一刻，全隊會短暫以為今天有神明值班。",
    funPower: 69,
    quirk: "休息區坐姿像老闆，實際職位是幫大家保管零食。",
    newsHeadline: "冠志成功接球後全場沉默三秒 大家在確認是不是本人",
    displayOrder: 5,
  },
  {
    slug: "zhou-shi-xuan",
    name: "周士軒",
    imagePath: "/players/zhou-shi-xuan.jpg",
    title: "盜壘猴王｜彩虹營業擔當",
    blurb: "只要上壘就開始躁動，像把『不要亂跑』聽成『現在出發』。跑壘路線很直，場邊效果很彎，滑壘完還會對二壘手露出偶像劇級微笑。",
    funPower: 80,
    quirk: "盜壘失敗後第一句永遠是『我剛剛只是想靠近他一點』。",
    newsHeadline: "士軒偷跑到二壘才發現沒人叫他跑 教練：算了 CP 感有打出來",
    displayOrder: 6,
  },
  {
    slug: "zhang-shu-han",
    name: "章舒涵",
    imagePath: "/players/default.svg",
    title: "外野精裝版｜皮克敏野餐組長",
    blurb: "跑起來比大家體面太多，顯得整場比賽突然有美術指導。平常疑似在培養皮克敏大軍，外野漏球時會說那是小紅皮克敏沒跟上。",
    funPower: 77,
    quirk: "接球前會先調整表情，並確認今天帶的是哪一色皮克敏。",
    newsHeadline: "舒涵外野接殺畫面太完整 對手抗議她根本帶了皮克敏助攻",
    displayOrder: 7,
  },
  {
    slug: "song-wen-yu",
    name: "宋文郁",
    imagePath: "/players/default.svg",
    title: "休息區脫口秀｜棒球只是副業",
    blurb: "上場前先講三分鐘，打完再講五分鐘。戰力不一定穩定，但氣氛產量保證超標，裁判都想收門票。",
    funPower: 73,
    quirk: "跑壘時還能跟二壘手聊天，像在錄 Podcast 外景。",
    newsHeadline: "文郁賽前訪談超時 主辦單位考慮把他排進中場表演",
    displayOrder: 8,
  },
  {
    slug: "cai-ming-zhe",
    name: "蔡明哲",
    imagePath: "/players/cai-ming-zhe.jpg",
    title: "捕手總機｜投手壞掉請按 9",
    blurb: "蹲在本壘後面像客服主管，投手爆炸時負責溫柔地把人類重新開機。配球偶爾神，偶爾像亂按電梯。",
    funPower: 85,
    quirk: "喊暫停的氣勢像要開會，結果只是想確認大家還活著。",
    newsHeadline: "明哲牽制後對跑者微笑 跑者表示心理創傷比出局嚴重",
    displayOrder: 9,
  },
  {
    slug: "huang-jun-yang",
    name: "黃君颺",
    imagePath: "/players/huang-jun-yang.jpg",
    title: "新來的麻煩包｜一上場先製造問號",
    blurb:
      "備賽全大運無法打球，僅提供情緒價值。",
    funPower: 76,
    quirk: "失誤後會露出非常真誠的笑容，讓隊友不好意思罵。",
    newsHeadline: "黃君颺加入選秀池 球探報告只有四個字：先選再說",
    displayOrder: 10,
  },
  {
    slug: "zeng-gui-hong",
    name: "曾貴鴻",
    imagePath: "/players/default.svg",
    title: "板凳核彈｜坐著也有壓迫感",
    blurb:
      "還沒上場就已經開始影響比賽，主要是大家一直問他到底什麼時候要動。揮棒像在處理私人恩怨，球如果會說話應該會先道歉。",
    funPower: 79,
    quirk: "熱身動作像要開大絕，結果只是鞋帶鬆了。",
    newsHeadline: "曾貴鴻加入選秀池 休息區空氣突然變得比較有戲",
    displayOrder: 11,
  },
  {
    slug: "mystery-bonus",
    name: "神秘加賽籤",
    imagePath: "/players/mystery-12.jpg",
    title: "最後一包樂透｜抽到先不要哭",
    blurb: "身分不明、戰力不明、出席率也不明。可能是隱藏王牌，也可能只是來幫忙買水的人，刺激感拉滿。",
    funPower: 50,
    quirk: "上場前要先確認是不是本人，因為大家也沒看過。",
    newsHeadline: "神秘加賽籤行情暴漲 原因是沒資料所以無法證明他爛",
    displayOrder: 12,
  },
] as const;

/**
 * 綁選：指名任一人，另一人同隊同次一併入選（仍只換一輪下一位）。排序必須與 DB / migration
 * `apply_pick` 內建 slug 表一致。
 */
export const BOUND_SLUG_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["huang-ze-rui", "song-wen-yu"],
  ["zhang-shu-han", "zeng-gui-hong"],
] as const;

export function getBoundPartnerSlug(slug: string): string | null {
  for (const [a, b] of BOUND_SLUG_PAIRS) {
    if (slug === a) return b;
    if (slug === b) return a;
  }
  return null;
}

/** 可選秀總人數（與 DB players 筆數一致，供 UI／Mock） */
export const DRAFT_POOL_SIZE = PLAYER_SEED.length;

export type PublicPlayer = {
  id: string;
  slug: string;
  name: string;
  image_path: string;
  title: string;
  blurb: string;
  fun_power: number;
  quirk: string;
  news_headline: string;
  display_order: number;
  team_key: "a" | "b" | null;
  picked: boolean;
  picked_at: string | null;
  /** 選秀結束後，球員自薦想被納入交易；全員可見。 */
  wants_trade: boolean;
};

export type DraftStateRow = {
  id: number;
  current_team_key: "a" | "b";
  is_complete: boolean;
  updated_at: string;
};
