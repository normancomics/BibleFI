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
      agent_assignments: {
        Row: {
          agent_id: string | null
          assignment_type: string
          church_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          assignment_type: string
          church_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          assignment_type?: string
          church_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "sovereign_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_assignments_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "global_churches"
            referencedColumns: ["id"]
          },
        ]
      }
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
      bible_verses: {
        Row: {
          book_name: string
          chapter: number
          created_at: string | null
          defi_keywords: string[] | null
          financial_relevance: number | null
          id: string
          testament: string
          text: string
          updated_at: string | null
          verse: number
          version: string
          wisdom_category: string[] | null
        }
        Insert: {
          book_name: string
          chapter: number
          created_at?: string | null
          defi_keywords?: string[] | null
          financial_relevance?: number | null
          id?: string
          testament: string
          text: string
          updated_at?: string | null
          verse: number
          version?: string
          wisdom_category?: string[] | null
        }
        Update: {
          book_name?: string
          chapter?: number
          created_at?: string | null
          defi_keywords?: string[] | null
          financial_relevance?: number | null
          id?: string
          testament?: string
          text?: string
          updated_at?: string | null
          verse?: number
          version?: string
          wisdom_category?: string[] | null
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
      church_reviews: {
        Row: {
          church_id: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          rating: number | null
          review_text: string | null
          user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number | null
          review_text?: string | null
          user_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number | null
          review_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_reviews_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "global_churches"
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
      comprehensive_biblical_texts: {
        Row: {
          aramaic_text: string | null
          book: string
          chapter: number
          created_at: string | null
          embedding: string | null
          financial_keywords: string[] | null
          financial_relevance: number | null
          greek_text: string | null
          hebrew_text: string | null
          id: string
          kjv_text: string
          original_words: Json | null
          strong_numbers: string[] | null
          updated_at: string | null
          verse: number
        }
        Insert: {
          aramaic_text?: string | null
          book: string
          chapter: number
          created_at?: string | null
          embedding?: string | null
          financial_keywords?: string[] | null
          financial_relevance?: number | null
          greek_text?: string | null
          hebrew_text?: string | null
          id?: string
          kjv_text: string
          original_words?: Json | null
          strong_numbers?: string[] | null
          updated_at?: string | null
          verse: number
        }
        Update: {
          aramaic_text?: string | null
          book?: string
          chapter?: number
          created_at?: string | null
          embedding?: string | null
          financial_keywords?: string[] | null
          financial_relevance?: number | null
          greek_text?: string | null
          hebrew_text?: string | null
          id?: string
          kjv_text?: string
          original_words?: Json | null
          strong_numbers?: string[] | null
          updated_at?: string | null
          verse?: number
        }
        Relationships: []
      }
      currency_rates: {
        Row: {
          from_currency: string
          id: string
          last_updated: string | null
          rate: number
          source: string | null
          to_currency: string
        }
        Insert: {
          from_currency: string
          id?: string
          last_updated?: string | null
          rate: number
          source?: string | null
          to_currency: string
        }
        Update: {
          from_currency?: string
          id?: string
          last_updated?: string | null
          rate?: number
          source?: string | null
          to_currency?: string
        }
        Relationships: []
      }
      global_churches: {
        Row: {
          accepts_cards: boolean | null
          accepts_checks: boolean | null
          accepts_crypto: boolean | null
          accepts_fiat: boolean | null
          accepts_wire_transfer: boolean | null
          address: string | null
          assistance_contact: string | null
          assistance_hours: string | null
          assistance_languages: string[] | null
          city: string
          coordinates: unknown | null
          country: string
          created_at: string | null
          created_by: string | null
          crypto_address: string | null
          crypto_networks: string[] | null
          denomination: string | null
          email: string | null
          fiat_currencies: string[] | null
          has_tech_assistance: boolean | null
          id: string
          last_updated_by: string | null
          name: string
          pastor_name: string | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          review_count: number | null
          search_vector: unknown | null
          state_province: string | null
          updated_at: string | null
          verification_date: string | null
          verified: boolean | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          accepts_cards?: boolean | null
          accepts_checks?: boolean | null
          accepts_crypto?: boolean | null
          accepts_fiat?: boolean | null
          accepts_wire_transfer?: boolean | null
          address?: string | null
          assistance_contact?: string | null
          assistance_hours?: string | null
          assistance_languages?: string[] | null
          city: string
          coordinates?: unknown | null
          country: string
          created_at?: string | null
          created_by?: string | null
          crypto_address?: string | null
          crypto_networks?: string[] | null
          denomination?: string | null
          email?: string | null
          fiat_currencies?: string[] | null
          has_tech_assistance?: boolean | null
          id?: string
          last_updated_by?: string | null
          name: string
          pastor_name?: string | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          search_vector?: unknown | null
          state_province?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified?: boolean | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          accepts_cards?: boolean | null
          accepts_checks?: boolean | null
          accepts_crypto?: boolean | null
          accepts_fiat?: boolean | null
          accepts_wire_transfer?: boolean | null
          address?: string | null
          assistance_contact?: string | null
          assistance_hours?: string | null
          assistance_languages?: string[] | null
          city?: string
          coordinates?: unknown | null
          country?: string
          created_at?: string | null
          created_by?: string | null
          crypto_address?: string | null
          crypto_networks?: string[] | null
          denomination?: string | null
          email?: string | null
          fiat_currencies?: string[] | null
          has_tech_assistance?: boolean | null
          id?: string
          last_updated_by?: string | null
          name?: string
          pastor_name?: string | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          search_vector?: unknown | null
          state_province?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verified?: boolean | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      mcp_biblical_sessions: {
        Row: {
          biblical_references: string[] | null
          context_type: string
          created_at: string | null
          id: string
          query: string
          response: string
          session_data: Json
          user_id: string | null
        }
        Insert: {
          biblical_references?: string[] | null
          context_type: string
          created_at?: string | null
          id?: string
          query: string
          response: string
          session_data?: Json
          user_id?: string | null
        }
        Update: {
          biblical_references?: string[] | null
          context_type?: string
          created_at?: string | null
          id?: string
          query?: string
          response?: string
          session_data?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          country: string
          created_at: string | null
          currency: string
          details: Json
          id: string
          is_default: boolean | null
          method_name: string
          method_type: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          country: string
          created_at?: string | null
          currency: string
          details: Json
          id?: string
          is_default?: boolean | null
          method_name: string
          method_type: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          country?: string
          created_at?: string | null
          currency?: string
          details?: Json
          id?: string
          is_default?: boolean | null
          method_name?: string
          method_type?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      sovereign_agents: {
        Row: {
          active: boolean | null
          availability_hours: string | null
          created_at: string | null
          email: string
          id: string
          languages: string[] | null
          name: string
          phone: string | null
          rating: number | null
          review_count: number | null
          service_areas: string[] | null
          specialties: string[] | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          active?: boolean | null
          availability_hours?: string | null
          created_at?: string | null
          email: string
          id?: string
          languages?: string[] | null
          name: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          active?: boolean | null
          availability_hours?: string | null
          created_at?: string | null
          email?: string
          id?: string
          languages?: string[] | null
          name?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          service_areas?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      strongs_concordance: {
        Row: {
          created_at: string | null
          definition: string
          id: string
          language: string
          original_word: string
          part_of_speech: string | null
          pronunciation: string | null
          root_word: string | null
          strong_number: string
          transliteration: string | null
        }
        Insert: {
          created_at?: string | null
          definition: string
          id?: string
          language: string
          original_word: string
          part_of_speech?: string | null
          pronunciation?: string | null
          root_word?: string | null
          strong_number: string
          transliteration?: string | null
        }
        Update: {
          created_at?: string | null
          definition?: string
          id?: string
          language?: string
          original_word?: string
          part_of_speech?: string | null
          pronunciation?: string | null
          root_word?: string | null
          strong_number?: string
          transliteration?: string | null
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
      search_biblical_wisdom: {
        Args: {
          limit_count?: number
          min_financial_relevance?: number
          search_term?: string
          wisdom_categories?: string[]
        }
        Returns: {
          defi_keywords: string[]
          financial_relevance: number
          id: string
          reference: string
          text: string
          wisdom_category: string[]
        }[]
      }
      search_comprehensive_biblical_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          aramaic_text: string
          book: string
          chapter: number
          financial_keywords: string[]
          financial_relevance: number
          greek_text: string
          hebrew_text: string
          id: string
          kjv_text: string
          original_words: Json
          similarity: number
          strong_numbers: string[]
          verse: number
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
