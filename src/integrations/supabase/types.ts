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
      agent_keys: {
        Row: {
          agent_key: string
          created_at: string
          created_by: string | null
          device_name: string | null
          employee_name: string | null
          id: string
          is_active: boolean
          key_name: string
          last_seen_at: string | null
        }
        Insert: {
          agent_key?: string
          created_at?: string
          created_by?: string | null
          device_name?: string | null
          employee_name?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          last_seen_at?: string | null
        }
        Update: {
          agent_key?: string
          created_at?: string
          created_by?: string | null
          device_name?: string | null
          employee_name?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_seen_at?: string | null
        }
        Relationships: []
      }
      application_rules: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      keystroke_logs: {
        Row: {
          active_time_seconds: number
          app_name: string | null
          created_at: string
          device: string | null
          employee_name: string
          id: string
          idle_time_seconds: number
          keystrokes_count: number
          recorded_at: string
        }
        Insert: {
          active_time_seconds?: number
          app_name?: string | null
          created_at?: string
          device?: string | null
          employee_name: string
          id?: string
          idle_time_seconds?: number
          keystrokes_count?: number
          recorded_at?: string
        }
        Update: {
          active_time_seconds?: number
          app_name?: string | null
          created_at?: string
          device?: string | null
          employee_name?: string
          id?: string
          idle_time_seconds?: number
          keystrokes_count?: number
          recorded_at?: string
        }
        Relationships: []
      }
      monitoring_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      productivity_logs: {
        Row: {
          apps_used: Json | null
          created_at: string
          device: string | null
          employee_name: string
          id: string
          neutral_time_seconds: number
          productive_time_seconds: number
          recorded_date: string
          unproductive_time_seconds: number
        }
        Insert: {
          apps_used?: Json | null
          created_at?: string
          device?: string | null
          employee_name: string
          id?: string
          neutral_time_seconds?: number
          productive_time_seconds?: number
          recorded_date?: string
          unproductive_time_seconds?: number
        }
        Update: {
          apps_used?: Json | null
          created_at?: string
          device?: string | null
          employee_name?: string
          id?: string
          neutral_time_seconds?: number
          productive_time_seconds?: number
          recorded_date?: string
          unproductive_time_seconds?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      screen_captures: {
        Row: {
          app_name: string | null
          capture_url: string
          captured_at: string
          created_at: string
          device: string | null
          employee_name: string
          id: string
          window_title: string | null
        }
        Insert: {
          app_name?: string | null
          capture_url: string
          captured_at?: string
          created_at?: string
          device?: string | null
          employee_name: string
          id?: string
          window_title?: string | null
        }
        Update: {
          app_name?: string | null
          capture_url?: string
          captured_at?: string
          created_at?: string
          device?: string | null
          employee_name?: string
          id?: string
          window_title?: string | null
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          category: string
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_violations: {
        Row: {
          created_at: string
          description: string | null
          device: string | null
          employee_name: string
          id: string
          ip_address: string | null
          policy_name: string
          read: boolean
          severity: string
          violation_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          device?: string | null
          employee_name: string
          id?: string
          ip_address?: string | null
          policy_name: string
          read?: boolean
          severity?: string
          violation_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          device?: string | null
          employee_name?: string
          id?: string
          ip_address?: string | null
          policy_name?: string
          read?: boolean
          severity?: string
          violation_type?: string
        }
        Relationships: []
      }
      settings_audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_name: string
          entity_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_name?: string
          entity_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
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
