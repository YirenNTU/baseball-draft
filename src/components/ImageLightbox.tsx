"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicPlayer } from "@/data/players";

const FALLBACK = "/players/default.svg";

type Props = {
  player: PublicPlayer | null;
  onClose: () => void;
};

export function ImageLightbox({ player, onClose }: Props) {
  const [useFallback, setUseFallback] = useState(false);
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!player) return;
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [player, onKey]);

  if (!player) return null;
  const displaySrc = useFallback ? FALLBACK : player.image_path;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${player.name} 大圖`}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="關閉"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg rounded-2xl border border-slate-600/80 bg-slate-900 p-4 shadow-2xl">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            關閉
          </button>
        </div>
        <div className="relative mx-auto mt-2 max-h-[70vh] w-full min-h-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- 需要 onError 切換預設圖，避免 next/image 在錯誤重試時的複雜度 */}
          <img
            src={displaySrc}
            alt={player.name}
            className="mx-auto max-h-[70vh] w-full object-contain"
            onError={() => {
              if (!useFallback) setUseFallback(true);
            }}
          />
        </div>
        <p className="mt-3 text-center text-lg font-bold text-amber-100">
          {player.name}
        </p>
        <p className="mt-1 line-clamp-2 text-center text-sm text-amber-500/90">
          {player.title}
        </p>
      </div>
    </div>
  );
}
