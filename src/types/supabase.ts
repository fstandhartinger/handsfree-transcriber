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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          plan_id: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          last_sign_in_at: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          plan_id?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          plan_id?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          last_sign_in_at?: string | null
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          anonymous_usage_count: number
          authenticated_usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          anonymous_usage_count?: number
          authenticated_usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          anonymous_usage_count?: number
          authenticated_usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: number
          created_at: string
          user_id: string
          stripe_payment_id: string
          amount: number
          currency: string
          token_credits_added: number
          status: string
          completed_at: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          stripe_payment_id: string
          amount: number
          currency: string
          token_credits_added: number
          status: string
          completed_at?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          stripe_payment_id?: string
          amount?: number
          currency?: string
          token_credits_added?: number
          status?: string
          completed_at?: string | null
        }
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
  }
} 