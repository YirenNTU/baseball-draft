"use client";

import { NameGate } from "@/components/NameGate";
import { LiveDraft } from "@/components/LiveDraft";
import { MockDraft } from "@/components/MockDraft";

function hasSupabaseUrl() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function DraftWithGate() {
  return (
    <NameGate>
      {({ name, role }) =>
        hasSupabaseUrl() ? (
          <LiveDraft participantName={name} role={role} />
        ) : (
          <MockDraft participantName={name} role={role} />
        )
      }
    </NameGate>
  );
}
