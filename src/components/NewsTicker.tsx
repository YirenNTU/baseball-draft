"use client";

const EXTRA_LINES = [
  "【場邊】今日最大敵人不是對手，是大家剛吃完早餐跑不動。",
  "【內部】戰術板內容曝光：第一行寫著『不要太丟臉』。",
  "【觀眾票選】最想看誰滑壘滑到像在拖地？投票持續中。",
  "【聲明】戰力數值純屬亂掰，如有雷同代表本人真的很好笑。",
] as const;

type Props = { headlines: string[] };

export function NewsTicker({ headlines }: Props) {
  const all = [...headlines, ...EXTRA_LINES];
  const line = all.join("   •   ");
  return (
    <div className="border-t border-amber-500/40 bg-slate-950/90 py-2 text-sm text-amber-100/90 [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
      <div className="overflow-hidden">
        <div className="ticker flex w-max gap-20">
        <p className="shrink-0 whitespace-nowrap">{line}</p>
        <p className="shrink-0 whitespace-nowrap" aria-hidden>
          {line}
        </p>
        </div>
      </div>
    </div>
  );
}
