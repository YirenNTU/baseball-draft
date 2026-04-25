"use client";

import { NameGate } from "@/components/NameGate";
import { LiveResult } from "@/components/LiveResult";
import { MockResult } from "@/components/MockResult";

function hasSupabaseUrl() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function ResultWithGate() {
  return (
    <NameGate title="請輸入真實姓名">
      {({ name, role }) =>
        hasSupabaseUrl() ? (
          <LiveResult participantName={name} role={role} />
        ) : (
          <MockResult participantName={name} role={role} />
        )
      }
    </NameGate>
  );
}
