/**
 * Database Types - Transfer Hub
 * 
 * Supabase database type definitions for TypeScript integration.
 * Generated types for database tables and relationships.
 * 
 * These types are used by Supabase client for type-safe database operations.
 */

export interface Database {
  public: {
    Tables: {
      transfers: {
        Row: {
          id: string
          player_id: number | null
          player_first_name: string
          player_last_name: string
          player_full_name: string | null
          age: number | null
          position: string | null
          nationality: string | null
          from_club_id: string | null
          to_club_id: string | null
          from_club_name: string
          to_club_name: string
          league_id: string | null
          league_name: string
          transfer_type: string
          transfer_value_usd: number | null
          transfer_value_display: string
          status: string
          transfer_date: string
          window: string
          api_transfer_id: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transfers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transfers']['Insert']>
      }
      clubs: {
        Row: {
          id: string
          api_club_id: number | null
          name: string
          short_name: string | null
          code: string | null
          country: string | null
          city: string | null
          league_id: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clubs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clubs']['Insert']>
      }
      leagues: {
        Row: {
          id: string
          api_league_id: number | null
          name: string
          country: string | null
          tier: number | null
          type: string | null
          logo_url: string | null
          flag_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leagues']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leagues']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
