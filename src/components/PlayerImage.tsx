"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK = "/players/default.svg";

type Props = {
  src: string;
  name: string;
  className?: string;
  size?: number;
};

export function PlayerImage({ src, name, className = "", size = 120 }: Props) {
  const [url, setUrl] = useState(src);
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-800 ring-2 ring-amber-500/30 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={() => {
          if (url !== FALLBACK) setUrl(FALLBACK);
        }}
        unoptimized={url.endsWith(".svg")}
      />
    </div>
  );
}
