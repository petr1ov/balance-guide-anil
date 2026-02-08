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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          cost_usd: number | null
          created_at: string
          id: string
          input_tokens: number | null
          metadata: Json | null
          model: string | null
          output_tokens: number | null
          telegram_id: string | null
          total_tokens: number | null
          usage_type: string
          user_id: string | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          telegram_id?: string | null
          total_tokens?: number | null
          usage_type: string
          user_id?: string | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          telegram_id?: string | null
          total_tokens?: number | null
          usage_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_scores: {
        Row: {
          career: number | null
          created_at: string
          environment: number | null
          finance: number | null
          health: number | null
          id: string
          relationships: number | null
          rest: number | null
          spirituality: number | null
          user_id: string
        }
        Insert: {
          career?: number | null
          created_at?: string
          environment?: number | null
          finance?: number | null
          health?: number | null
          id?: string
          relationships?: number | null
          rest?: number | null
          spirituality?: number | null
          user_id: string
        }
        Update: {
          career?: number | null
          created_at?: string
          environment?: number | null
          finance?: number | null
          health?: number | null
          id?: string
          relationships?: number | null
          rest?: number | null
          spirituality?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          telegram_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          telegram_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          telegram_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          event: string
          id: string
          metadata: Json | null
          telegram_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          metadata?: Json | null
          telegram_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          metadata?: Json | null
          telegram_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          focus_area: string
          id: string
          ideal: string | null
          month_plan: string | null
          point_a: string | null
          short_goal: string | null
          updated_at: string
          user_id: string
          year_goal: string | null
        }
        Insert: {
          created_at?: string
          focus_area: string
          id?: string
          ideal?: string | null
          month_plan?: string | null
          point_a?: string | null
          short_goal?: string | null
          updated_at?: string
          user_id: string
          year_goal?: string | null
        }
        Update: {
          created_at?: string
          focus_area?: string
          id?: string
          ideal?: string | null
          month_plan?: string | null
          point_a?: string | null
          short_goal?: string | null
          updated_at?: string
          user_id?: string
          year_goal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          astrology_frequency: string | null
          birth_city: string | null
          birth_country: string | null
          birth_date: string | null
          birth_time: string | null
          consent_at: string | null
          consent_personal_data: boolean | null
          consent_version: string | null
          conversation_state: Json | null
          created_at: string
          id: string
          jyotish_summary: Json | null
          language: string | null
          mode: string | null
          name: string | null
          onboarding_completed: boolean | null
          telegram_id: string
          updated_at: string
        }
        Insert: {
          astrology_frequency?: string | null
          birth_city?: string | null
          birth_country?: string | null
          birth_date?: string | null
          birth_time?: string | null
          consent_at?: string | null
          consent_personal_data?: boolean | null
          consent_version?: string | null
          conversation_state?: Json | null
          created_at?: string
          id?: string
          jyotish_summary?: Json | null
          language?: string | null
          mode?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          telegram_id: string
          updated_at?: string
        }
        Update: {
          astrology_frequency?: string | null
          birth_city?: string | null
          birth_country?: string | null
          birth_date?: string | null
          birth_time?: string | null
          consent_at?: string | null
          consent_personal_data?: boolean | null
          consent_version?: string | null
          conversation_state?: Json | null
          created_at?: string
          id?: string
          jyotish_summary?: Json | null
          language?: string | null
          mode?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          telegram_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          id: string
          reminder_type: string
          sent_at: string | null
          sent_date: string
          user_id: string
        }
        Insert: {
          id?: string
          reminder_type: string
          sent_at?: string | null
          sent_date?: string
          user_id: string
        }
        Update: {
          id?: string
          reminder_type?: string
          sent_at?: string | null
          sent_date?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string | null
          day_time: string | null
          enabled: boolean | null
          evening_time: string | null
          id: string
          morning_time: string | null
          telegram_id: number | null
          timezone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_time?: string | null
          enabled?: boolean | null
          evening_time?: string | null
          id?: string
          morning_time?: string | null
          telegram_id?: number | null
          timezone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_time?: string | null
          enabled?: boolean | null
          evening_time?: string | null
          id?: string
          morning_time?: string | null
          telegram_id?: number | null
          timezone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sphere_details: {
        Row: {
          created_at: string
          daily_plan: string[] | null
          id: string
          jyotish_accent: string | null
          point_a: string | null
          point_b: string | null
          score: number | null
          sphere: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_plan?: string[] | null
          id?: string
          jyotish_accent?: string | null
          point_a?: string | null
          point_b?: string | null
          score?: number | null
          sphere: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_plan?: string[] | null
          id?: string
          jyotish_accent?: string | null
          point_a?: string | null
          point_b?: string | null
          score?: number | null
          sphere?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sphere_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          payment_id: string | null
          payment_provider: string | null
          plan: string
          price_usd: number | null
          started_at: string
          status: string
          subscription_type: string | null
          telegram_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          payment_provider?: string | null
          plan?: string
          price_usd?: number | null
          started_at?: string
          status?: string
          subscription_type?: string | null
          telegram_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          payment_provider?: string | null
          plan?: string
          price_usd?: number | null
          started_at?: string
          status?: string
          subscription_type?: string | null
          telegram_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_telegram: { Args: { _telegram_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
