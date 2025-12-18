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
      ai_analysis_reports: {
        Row: {
          analysis_period_end: string | null
          analysis_period_start: string | null
          created_at: string
          employee_name: string | null
          generated_by: string | null
          id: string
          insights: Json | null
          raw_data: Json | null
          recommendations: Json | null
          report_type: string
          risk_score: number | null
          summary: string | null
        }
        Insert: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          created_at?: string
          employee_name?: string | null
          generated_by?: string | null
          id?: string
          insights?: Json | null
          raw_data?: Json | null
          recommendations?: Json | null
          report_type: string
          risk_score?: number | null
          summary?: string | null
        }
        Update: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          created_at?: string
          employee_name?: string | null
          generated_by?: string | null
          id?: string
          insights?: Json | null
          raw_data?: Json | null
          recommendations?: Json | null
          report_type?: string
          risk_score?: number | null
          summary?: string | null
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
      click_logs: {
        Row: {
          app_name: string | null
          click_type: string
          created_at: string
          device: string | null
          employee_name: string
          id: string
          recorded_at: string
          target_element: string | null
          url: string | null
          window_title: string | null
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          app_name?: string | null
          click_type?: string
          created_at?: string
          device?: string | null
          employee_name: string
          id?: string
          recorded_at?: string
          target_element?: string | null
          url?: string | null
          window_title?: string | null
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          app_name?: string | null
          click_type?: string
          created_at?: string
          device?: string | null
          employee_name?: string
          id?: string
          recorded_at?: string
          target_element?: string | null
          url?: string | null
          window_title?: string | null
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: []
      }
      internet_access_settings: {
        Row: {
          access_level: string
          active_hours_end: string | null
          active_hours_start: string | null
          allowed_categories: string[] | null
          allowed_sites: string[] | null
          bandwidth_limit_mbps: number | null
          blocked_categories: string[] | null
          blocked_sites: string[] | null
          created_at: string
          employee_name: string
          id: string
          notes: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access_level?: string
          active_hours_end?: string | null
          active_hours_start?: string | null
          allowed_categories?: string[] | null
          allowed_sites?: string[] | null
          bandwidth_limit_mbps?: number | null
          blocked_categories?: string[] | null
          blocked_sites?: string[] | null
          created_at?: string
          employee_name: string
          id?: string
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access_level?: string
          active_hours_end?: string | null
          active_hours_start?: string | null
          allowed_categories?: string[] | null
          allowed_sites?: string[] | null
          bandwidth_limit_mbps?: number | null
          blocked_categories?: string[] | null
          blocked_sites?: string[] | null
          created_at?: string
          employee_name?: string
          id?: string
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      keystroke_details: {
        Row: {
          app_name: string | null
          created_at: string
          device: string | null
          employee_name: string
          id: string
          is_sensitive: boolean | null
          key_code: number | null
          key_pressed: string
          modifiers: string[] | null
          recorded_at: string
          window_title: string | null
        }
        Insert: {
          app_name?: string | null
          created_at?: string
          device?: string | null
          employee_name: string
          id?: string
          is_sensitive?: boolean | null
          key_code?: number | null
          key_pressed: string
          modifiers?: string[] | null
          recorded_at?: string
          window_title?: string | null
        }
        Update: {
          app_name?: string | null
          created_at?: string
          device?: string | null
          employee_name?: string
          id?: string
          is_sensitive?: boolean | null
          key_code?: number | null
          key_pressed?: string
          modifiers?: string[] | null
          recorded_at?: string
          window_title?: string | null
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
      policy_acknowledgments: {
        Row: {
          acknowledged_at: string
          device_name: string | null
          employee_name: string
          id: string
          ip_address: string | null
          latitude: number | null
          location_address: string | null
          longitude: number | null
          photo_url: string | null
          policy_version: string | null
        }
        Insert: {
          acknowledged_at?: string
          device_name?: string | null
          employee_name: string
          id?: string
          ip_address?: string | null
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          photo_url?: string | null
          policy_version?: string | null
        }
        Update: {
          acknowledged_at?: string
          device_name?: string | null
          employee_name?: string
          id?: string
          ip_address?: string | null
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          photo_url?: string | null
          policy_version?: string | null
        }
        Relationships: []
      }
      policy_exemptions: {
        Row: {
          created_at: string
          employee_name: string
          exempted_by: string | null
          expires_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          employee_name: string
          exempted_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          employee_name?: string
          exempted_by?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
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
          location: string | null
          notified_admin: boolean | null
          notified_employee: boolean | null
          policy_name: string
          read: boolean
          screenshot_url: string | null
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
          location?: string | null
          notified_admin?: boolean | null
          notified_employee?: boolean | null
          policy_name: string
          read?: boolean
          screenshot_url?: string | null
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
          location?: string | null
          notified_admin?: boolean | null
          notified_employee?: boolean | null
          policy_name?: string
          read?: boolean
          screenshot_url?: string | null
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
      violation_rules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          notify_admin: boolean
          notify_employee: boolean
          rule_type: Database["public"]["Enums"]["violation_rule_type"]
          rule_value: string
          severity: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          notify_admin?: boolean
          notify_employee?: boolean
          rule_type: Database["public"]["Enums"]["violation_rule_type"]
          rule_value: string
          severity?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          notify_admin?: boolean
          notify_employee?: boolean
          rule_type?: Database["public"]["Enums"]["violation_rule_type"]
          rule_value?: string
          severity?: string
          updated_at?: string
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
      violation_rule_type:
        | "blocked_site"
        | "blocked_keyword"
        | "blocked_app"
        | "blocked_file_extension"
        | "work_hours"
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
      violation_rule_type: [
        "blocked_site",
        "blocked_keyword",
        "blocked_app",
        "blocked_file_extension",
        "work_hours",
      ],
    },
  },
} as const
