# 臺大物理 · 選秀大會

雙隊長（**林柏喬**、**徐振華**）主持選秀、**不可入選秀名單**；待選共 **12 人**（含 **黃君颺**、**曾貴鴻**）。支援 **Supabase 即時** 或本機 **Mock**。

### 真實姓名閘道

- 進入 `/draft` 或 `/result` 前須輸入**真實姓名**（存 `sessionStorage`，不送後端）。
- 姓名與**林柏喬**、**徐振華**完全一致（可 NFKC 正規化、去空白）者，顯示隊長專用介面；**其餘人僅能觀戰**，不可切換成隊長（姓名仍存 `sessionStorage`）。
- 實際選人由 `apply_pick` 在後端以輪次驗證。隊長外號顯示：林柏喬 **Jerry 的頭號弟子**、徐振華 **粒子物理專家**（見 [`TEAM_A` / `TEAM_B` in `src/data/players.ts`](src/data/players.ts)）。選秀結算後有 **Trade me**（`wants_trade`）與 **`/api/trade`** 交換、**`/api/trade-me`** 自薦，皆無額外暗號。

## 本機

```bash
cd baseball-draft
npm install
npm run dev
```

未設定 `NEXT_PUBLIC_SUPABASE_URL` 時跑 Mock；狀態存本機 `sessionStorage`。

## Supabase

1. 建專案後在 **SQL** 執行 [`supabase/migrations/20260426000000_init.sql`](supabase/migrations/20260426000000_init.sql) 全文。  
2. 複製 [`.env.local.example`](.env.local.example) 為 `.env.local`，填入 URL、anon key、**service_role**（供 `/api/*` 呼叫 RPC 用）。  
3. 匯入人員與重設狀態：

   ```bash
   npm run seed
   ```

4. **Replication**：確認 `players`、`draft_state` 可 Realtime（migration 已加 publication 者略過）。

## 綁選

兩組同時入隊：**黃則叡**與**宋文郁**、**章舒涵**與**曾貴鴻**（見 `BOUND_SLUG_PAIRS` 於 [`src/data/players.ts`](src/data/players.ts)）。點名其中一人，另一人同隊同次一併入選，輪替仍只換一輪。上線前請在 Supabase 執行 [`supabase/migrations/20260427120000_apply_pick_bound_pairs.sql`](supabase/migrations/20260427120000_apply_pick_bound_pairs.sql)（或專案內全量 migration）。介面以姓名字首塊顯示，**不**再使用球員圖檔欄位；既有資料庫請執行 [`supabase/migrations/20260429140000_drop_players_image_path.sql`](supabase/migrations/20260429140000_drop_players_image_path.sql) 若仍有 `image_path` 欄位。

## 頁面

- `/` — 入口  
- `/draft` — 先填姓名；隊長可於輪到時選人，其他人觀戰  
- `/result` — 先填姓名；全員選完之後可看陣容與最高戰力

若曾用舊版 seed 匯入過隊長列，請再跑一次 `npm run seed` 並在 Supabase 執行較新 migration（`apply_pick` 以表內總人數判斷結束；有綁選則以「綁選」那版 `apply_pick` 為準）。

## 重開一輪

- `POST /api/reset` + `DRAFT_RESET_SECRET`，或 Supabase 執行 `select reset_draft();`

## Vercel

環境變數與本機相同（含 `SUPABASE_SERVICE_ROLE_KEY`）後 deploy 即可。

## 結構

- `src/data/players.ts` — 人員與文案  
- `src/lib/branding.ts` — 全站抬頭用語  
- `src/lib/participantRole.ts` — 姓名 → 觀戰 / 隊長身分辨識  
- `src/components/NameGate.tsx` — 姓名閘道  
- `src/app/api/pick` — `apply_pick`  
- `supabase/migrations/*` — schema / RPC
