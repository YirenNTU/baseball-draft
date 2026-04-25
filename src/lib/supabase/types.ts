export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      players: {
        Relationships: [];
        Row: {
          id: string;
          slug: string;
          name: string;
          title: string;
          blurb: string;
          fun_power: number;
          quirk: string;
          news_headline: string;
          display_order: number;
          team_key: "a" | "b" | null;
          picked: boolean;
          picked_at: string | null;
          wants_trade: boolean;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          title: string;
          blurb: string;
          fun_power: number;
          quirk: string;
          news_headline: string;
          display_order: number;
          team_key?: "a" | "b" | null;
          picked?: boolean;
          picked_at?: string | null;
          wants_trade?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
      };
      draft_state: {
        Relationships: [];
        Row: {
          id: number;
          current_team_key: "a" | "b";
          is_complete: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          current_team_key: "a" | "b";
          is_complete?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["draft_state"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      apply_pick: {
        Args: { p_slug: string; p_team: "a" | "b" };
        Returns: Json;
      };
      apply_trade: {
        Args: { p_slug_from_a: string; p_slug_from_b: string };
        Returns: Json;
      };
      reset_draft: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
};
