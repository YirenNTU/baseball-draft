"use client";

import { NameGate } from "@/components/NameGate";
import { LiveDraft } from "@/components/LiveDraft";
import { MockDraft } from "@/components/MockDraft";
import { isSupabaseConfigured } from "@/lib/supabase/factory";

export function DraftWithGate() {
  return (
    <NameGate>
      {({ name, role }) =>
        isSupabaseConfigured() ? (
          <LiveDraft participantName={name} role={role} />
        ) : (
          <MockDraft participantName={name} role={role} />
        )
      }
    </NameGate>
  );
}
