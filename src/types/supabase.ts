
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      churches: {
        Row: {
          id: string
          name: string
          denomination: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          website: string | null
          accepts_crypto: boolean
          payment_methods: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          denomination?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          website?: string | null
          accepts_crypto?: boolean
          payment_methods?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          denomination?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          website?: string | null
          accepts_crypto?: boolean
          payment_methods?: string[] | null
          created_at?: string
        }
      }
      members: {
        Row: {
          id: string
          church_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          membership_status: string | null
          join_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          church_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          membership_status?: string | null
          join_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          membership_status?: string | null
          join_date?: string | null
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          church_id: string
          member_id: string | null
          amount: number
          currency: string
          donation_date: string
          payment_method: string
          crypto_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          church_id: string
          member_id?: string | null
          amount: number
          currency?: string
          donation_date: string
          payment_method: string
          crypto_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          church_id?: string
          member_id?: string | null
          amount?: number
          currency?: string
          donation_date?: string
          payment_method?: string
          crypto_type?: string | null
          created_at?: string
        }
      }
    }
  }
}
