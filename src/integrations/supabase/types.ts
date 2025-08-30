export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_context_sessions: {
        Row: {
          biblical_references: string[] | null
          context_data: Json
          created_at: string
          expires_at: string
          id: string
          session_type: string
          user_id: string | null
        }
        Insert: {
          biblical_references?: string[] | null
          context_data: Json
          created_at?: string
          expires_at?: string
          id?: string
          session_type: string
          user_id?: string | null
        }
        Update: {
          biblical_references?: string[] | null
          context_data?: Json
          created_at?: string
          expires_at?: string
          id?: string
          session_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      biblical_knowledge_base: {
        Row: {
          application: string | null
          category: string
          created_at: string
          defi_relevance: string | null
          embedding: string | null
          financial_keywords: string[] | null
          id: string
          principle: string | null
          reference: string
          updated_at: string
          verse_text: string
        }
        Insert: {
          application?: string | null
          category: string
          created_at?: string
          defi_relevance?: string | null
          embedding?: string | null
          financial_keywords?: string[] | null
          id?: string
          principle?: string | null
          reference: string
          updated_at?: string
          verse_text: string
        }
        Update: {
          application?: string | null
          category?: string
          created_at?: string
          defi_relevance?: string | null
          embedding?: string | null
          financial_keywords?: string[] | null
          id?: string
          principle?: string | null
          reference?: string
          updated_at?: string
          verse_text?: string
        }
        Relationships: []
      }
      church_memberships: {
        Row: {
          church_id: string
          id: string
          joined_at: string | null
          primary_church: boolean | null
          user_id: string
        }
        Insert: {
          church_id: string
          id?: string
          joined_at?: string | null
          primary_church?: boolean | null
          user_id: string
        }
        Update: {
          church_id?: string
          id?: string
          joined_at?: string | null
          primary_church?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_memberships_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          accepts_crypto: boolean
          address: string | null
          city: string
          country: string
          created_at: string | null
          created_by: string | null
          denomination: string | null
          id: string
          name: string
          payment_methods: string[] | null
          state: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          accepts_crypto?: boolean
          address?: string | null
          city: string
          country: string
          created_at?: string | null
          created_by?: string | null
          denomination?: string | null
          id?: string
          name: string
          payment_methods?: string[] | null
          state: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          accepts_crypto?: boolean
          address?: string | null
          city?: string
          country?: string
          created_at?: string | null
          created_by?: string | null
          denomination?: string | null
          id?: string
          name?: string
          payment_methods?: string[] | null
          state?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      superfluid_streams: {
        Row: {
          church_id: string | null
          created_at: string
          end_date: string | null
          flow_rate: string
          id: string
          receiver_address: string
          start_date: string
          status: string
          stream_id: string
          stream_type: string
          token_address: string
          token_symbol: string
          tx_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          end_date?: string | null
          flow_rate: string
          id?: string
          receiver_address: string
          start_date?: string
          status?: string
          stream_id: string
          stream_type: string
          token_address: string
          token_symbol: string
          tx_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          end_date?: string | null
          flow_rate?: string
          id?: string
          receiver_address?: string
          start_date?: string
          status?: string
          stream_id?: string
          stream_type?: string
          token_address?: string
          token_symbol?: string
          tx_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wisdom_scores: {
        Row: {
          biblical_verse_id: string | null
          calculation_date: string
          factors: Json
          id: string
          score: number
          user_id: string
        }
        Insert: {
          biblical_verse_id?: string | null
          calculation_date?: string
          factors: Json
          id?: string
          score: number
          user_id: string
        }
        Update: {
          biblical_verse_id?: string | null
          calculation_date?: string
          factors?: Json
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wisdom_scores_biblical_verse_id_fkey"
            columns: ["biblical_verse_id"]
            isOneToOne: false
            referencedRelation: "biblical_knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      search_biblical_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          application: string
          category: string
          defi_relevance: string
          id: string
          principle: string
          reference: string
          similarity: number
          verse_text: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
