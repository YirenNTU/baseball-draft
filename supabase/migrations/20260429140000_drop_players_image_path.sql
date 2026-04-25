-- 移除球員圖片欄位（UI 不再顯示頭像路徑）
alter table public.players
  drop column if exists image_path;
