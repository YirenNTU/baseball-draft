"use client";

import { NameGate } from "@/components/NameGate";
import { LiveResult } from "@/components/LiveResult";
import { MockResult } from "@/components/MockResult";
import { isSupabaseConfigured } from "@/lib/supabase/factory";

export function ResultWithGate() {
  return (
    <NameGate title="請輸入真實姓名">
      {({ name, role }) =>
        isSupabaseConfigured() ? (
          <LiveResult participantName={name} role={role} />
        ) : (
          <MockResult participantName={name} role={role} />
        )
      }
    </NameGate>
  );
}
