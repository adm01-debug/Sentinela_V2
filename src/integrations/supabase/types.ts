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
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          device_name?: string | null
          employee_name?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_keys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      alert_notification_settings: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          notify_critical: boolean
          notify_high: boolean
          notify_low: boolean
          notify_medium: boolean
          recipient_emails: string[]
          setting_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          notify_critical?: boolean
          notify_high?: boolean
          notify_low?: boolean
          notify_medium?: boolean
          recipient_emails?: string[]
          setting_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          notify_critical?: boolean
          notify_high?: boolean
          notify_low?: boolean
          notify_medium?: boolean
          recipient_emails?: string[]
          setting_type?: string
          updated_at?: string
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
      badges: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_at: string
          blocked_by: string | null
          created_at: string
          endpoint: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_active: boolean
          reason: string | null
          request_count_at_block: number | null
        }
        Insert: {
          blocked_at?: string
          blocked_by?: string | null
          created_at?: string
          endpoint?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_active?: boolean
          reason?: string | null
          request_count_at_block?: number | null
        }
        Update: {
          blocked_at?: string
          blocked_by?: string | null
          created_at?: string
          endpoint?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_active?: boolean
          reason?: string | null
          request_count_at_block?: number | null
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
      click_logs_partitioned: {
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
      click_logs_partitioned_2025_12: {
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
      click_logs_partitioned_2026_01: {
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
      click_logs_partitioned_2026_02: {
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
      click_logs_partitioned_2026_03: {
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
      companies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          max_employees: number | null
          name: string
          plan: string | null
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_employees?: number | null
          name: string
          plan?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          max_employees?: number | null
          name?: string
          plan?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          agent_version: string | null
          company_id: string | null
          created_at: string
          device_type: string
          employee_id: string | null
          first_seen: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          last_seen: string | null
          mac_address: string | null
          name: string
          os_name: string | null
          os_version: string | null
          updated_at: string
        }
        Insert: {
          agent_version?: string | null
          company_id?: string | null
          created_at?: string
          device_type?: string
          employee_id?: string | null
          first_seen?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_seen?: string | null
          mac_address?: string | null
          name: string
          os_name?: string | null
          os_version?: string | null
          updated_at?: string
        }
        Update: {
          agent_version?: string | null
          company_id?: string | null
          created_at?: string
          device_type?: string
          employee_id?: string | null
          first_seen?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_seen?: string | null
          mac_address?: string | null
          name?: string
          os_name?: string | null
          os_version?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_badges: {
        Row: {
          badge_id: string
          earned_at: string
          employee_id: string
          id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          employee_id: string
          id?: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_badges_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_devices: {
        Row: {
          agent_key_id: string | null
          assigned_at: string
          device_name: string
          device_type: string | null
          employee_id: string
          id: string
          is_primary: boolean | null
        }
        Insert: {
          agent_key_id?: string | null
          assigned_at?: string
          device_name: string
          device_type?: string | null
          employee_id: string
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          agent_key_id?: string | null
          assigned_at?: string
          device_name?: string
          device_type?: string | null
          employee_id?: string
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_devices_agent_key_id_fkey"
            columns: ["agent_key_id"]
            isOneToOne: false
            referencedRelation: "agent_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_devices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_geofences: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          employee_id: string
          geofence_id: string
          id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          employee_id: string
          geofence_id: string
          id?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          employee_id?: string
          geofence_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_geofences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_geofences_geofence_id_fkey"
            columns: ["geofence_id"]
            isOneToOne: false
            referencedRelation: "geofences"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_points: {
        Row: {
          created_at: string
          current_streak: number
          employee_id: string
          experience: number
          id: string
          last_activity_date: string | null
          level: number
          longest_streak: number
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          employee_id: string
          experience?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          employee_id?: string
          experience?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_points_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_schedules: {
        Row: {
          assigned_by: string | null
          created_at: string
          effective_from: string
          effective_until: string | null
          employee_id: string
          id: string
          schedule_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          employee_id: string
          id?: string
          schedule_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          employee_id?: string
          id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_schedules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "work_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          department: string | null
          email: string | null
          hire_date: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_violations: {
        Row: {
          action_taken: string | null
          created_at: string
          detected_address: string | null
          device: string | null
          distance_meters: number | null
          employee_name: string
          id: string
          latitude: number
          longitude: number
          nearest_geofence_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          detected_address?: string | null
          device?: string | null
          distance_meters?: number | null
          employee_name: string
          id?: string
          latitude: number
          longitude: number
          nearest_geofence_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          detected_address?: string | null
          device?: string | null
          distance_meters?: number | null
          employee_name?: string
          id?: string
          latitude?: number
          longitude?: number
          nearest_geofence_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geofence_violations_nearest_geofence_id_fkey"
            columns: ["nearest_geofence_id"]
            isOneToOne: false
            referencedRelation: "geofences"
            referencedColumns: ["id"]
          },
        ]
      }
      geofences: {
        Row: {
          address: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          radius_meters: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          radius_meters?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          radius_meters?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      keystroke_logs_partitioned: {
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
      keystroke_logs_partitioned_2025_12: {
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
      keystroke_logs_partitioned_2026_01: {
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
      keystroke_logs_partitioned_2026_02: {
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
      keystroke_logs_partitioned_2026_03: {
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
      message_templates: {
        Row: {
          body: string
          channel: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          subject: string | null
          template_type: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          subject?: string | null
          template_type?: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      mobile_activity_logs: {
        Row: {
          activity_type: string
          app_name: string | null
          created_at: string
          device_id: string | null
          duration_seconds: number | null
          employee_name: string
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          recorded_at: string
        }
        Insert: {
          activity_type: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Update: {
          activity_type?: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_activity_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "mobile_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_activity_logs_partitioned: {
        Row: {
          activity_type: string
          app_name: string | null
          created_at: string
          device_id: string | null
          duration_seconds: number | null
          employee_name: string
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          recorded_at: string
        }
        Insert: {
          activity_type: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Update: {
          activity_type?: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Relationships: []
      }
      mobile_activity_logs_partitioned_2025_12: {
        Row: {
          activity_type: string
          app_name: string | null
          created_at: string
          device_id: string | null
          duration_seconds: number | null
          employee_name: string
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          recorded_at: string
        }
        Insert: {
          activity_type: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Update: {
          activity_type?: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Relationships: []
      }
      mobile_activity_logs_partitioned_2026_01: {
        Row: {
          activity_type: string
          app_name: string | null
          created_at: string
          device_id: string | null
          duration_seconds: number | null
          employee_name: string
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          recorded_at: string
        }
        Insert: {
          activity_type: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Update: {
          activity_type?: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Relationships: []
      }
      mobile_activity_logs_partitioned_2026_02: {
        Row: {
          activity_type: string
          app_name: string | null
          created_at: string
          device_id: string | null
          duration_seconds: number | null
          employee_name: string
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          recorded_at: string
        }
        Insert: {
          activity_type: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Update: {
          activity_type?: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Relationships: []
      }
      mobile_activity_logs_partitioned_2026_03: {
        Row: {
          activity_type: string
          app_name: string | null
          created_at: string
          device_id: string | null
          duration_seconds: number | null
          employee_name: string
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          recorded_at: string
        }
        Insert: {
          activity_type: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Update: {
          activity_type?: string
          app_name?: string | null
          created_at?: string
          device_id?: string | null
          duration_seconds?: number | null
          employee_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          recorded_at?: string
        }
        Relationships: []
      }
      mobile_devices: {
        Row: {
          app_version: string | null
          created_at: string
          device_id: string
          device_model: string | null
          employee_name: string
          id: string
          is_active: boolean
          last_location_lat: number | null
          last_location_lng: number | null
          last_seen_at: string | null
          os_type: string
          os_version: string | null
          push_token: string | null
          updated_at: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_id: string
          device_model?: string | null
          employee_name: string
          id?: string
          is_active?: boolean
          last_location_lat?: number | null
          last_location_lng?: number | null
          last_seen_at?: string | null
          os_type: string
          os_version?: string | null
          push_token?: string | null
          updated_at?: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_id?: string
          device_model?: string | null
          employee_name?: string
          id?: string
          is_active?: boolean
          last_location_lat?: number | null
          last_location_lng?: number | null
          last_seen_at?: string | null
          os_type?: string
          os_version?: string | null
          push_token?: string | null
          updated_at?: string
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
      overtime_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          end_time: string
          id: string
          reason: string | null
          requested_date: string
          start_time: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_time: string
          id?: string
          reason?: string | null
          requested_date: string
          start_time: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_time?: string
          id?: string
          reason?: string | null
          requested_date?: string
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      points_history: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          employee_id: string
          id: string
          points: number
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          employee_id: string
          id?: string
          points: number
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          employee_id?: string
          id?: string
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "points_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      productivity_logs_partitioned: {
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
      productivity_logs_partitioned_2025_12: {
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
      productivity_logs_partitioned_2026_01: {
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
      productivity_logs_partitioned_2026_02: {
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
      productivity_logs_partitioned_2026_03: {
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
      rate_limit_logs: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          identifier_type: string
          request_count: number | null
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          identifier_type: string
          request_count?: number | null
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number | null
          window_start?: string
        }
        Relationships: []
      }
      scheduled_report_settings: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          include_activity_summary: boolean
          include_productivity: boolean
          include_violations: boolean
          last_sent_at: string | null
          recipient_emails: string[]
          report_type: string
          send_day_of_week: number | null
          send_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          include_activity_summary?: boolean
          include_productivity?: boolean
          include_violations?: boolean
          last_sent_at?: string | null
          recipient_emails?: string[]
          report_type?: string
          send_day_of_week?: number | null
          send_time?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          include_activity_summary?: boolean
          include_productivity?: boolean
          include_violations?: boolean
          last_sent_at?: string | null
          recipient_emails?: string[]
          report_type?: string
          send_day_of_week?: number | null
          send_time?: string
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
          extracted_text: string | null
          id: string
          ocr_processed_at: string | null
          window_title: string | null
        }
        Insert: {
          app_name?: string | null
          capture_url: string
          captured_at?: string
          created_at?: string
          device?: string | null
          employee_name: string
          extracted_text?: string | null
          id?: string
          ocr_processed_at?: string | null
          window_title?: string | null
        }
        Update: {
          app_name?: string | null
          capture_url?: string
          captured_at?: string
          created_at?: string
          device?: string | null
          employee_name?: string
          extracted_text?: string | null
          id?: string
          ocr_processed_at?: string | null
          window_title?: string | null
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          category: string
          company_id: string | null
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          company_id?: string | null
          created_at?: string
          description: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          company_id?: string | null
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      security_violations: {
        Row: {
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "security_violations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      session_recordings: {
        Row: {
          app_name: string | null
          created_at: string
          device: string | null
          employee_name: string
          events: Json | null
          id: string
          recorded_at: string
          screenshot_url: string
          session_date: string
          window_title: string | null
        }
        Insert: {
          app_name?: string | null
          created_at?: string
          device?: string | null
          employee_name: string
          events?: Json | null
          id?: string
          recorded_at?: string
          screenshot_url: string
          session_date?: string
          window_title?: string | null
        }
        Update: {
          app_name?: string | null
          created_at?: string
          device?: string | null
          employee_name?: string
          events?: Json | null
          id?: string
          recorded_at?: string
          screenshot_url?: string
          session_date?: string
          window_title?: string | null
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
      station_block_logs: {
        Row: {
          block_type: string
          blocked_at: string
          device: string | null
          employee_name: string
          id: string
          reason: string | null
          unblocked_at: string | null
        }
        Insert: {
          block_type: string
          blocked_at?: string
          device?: string | null
          employee_name: string
          id?: string
          reason?: string | null
          unblocked_at?: string | null
        }
        Update: {
          block_type?: string
          blocked_at?: string
          device?: string | null
          employee_name?: string
          id?: string
          reason?: string | null
          unblocked_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          employee_name: string
          id: string
          joined_at: string
          role: string | null
          team_id: string
        }
        Insert: {
          employee_name: string
          id?: string
          joined_at?: string
          role?: string | null
          team_id: string
        }
        Update: {
          employee_name?: string
          id?: string
          joined_at?: string
          role?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          leader_id: string | null
          leader_name: string | null
          name: string
          parent_team_id: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          leader_id?: string | null
          leader_name?: string | null
          name: string
          parent_team_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          leader_id?: string | null
          leader_name?: string | null
          name?: string
          parent_team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_parent_team_id_fkey"
            columns: ["parent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      violation_rules: {
        Row: {
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "violation_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          attempt_number: number
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_code: number | null
          status: string
          webhook_id: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_code?: number | null
          status?: string
          webhook_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_code?: number | null
          status?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          headers: Json | null
          id: string
          is_active: boolean
          last_response_code: number | null
          last_status: string | null
          last_triggered_at: string | null
          name: string
          retry_count: number
          secret: string | null
          timeout_seconds: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_response_code?: number | null
          last_status?: string | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number
          secret?: string | null
          timeout_seconds?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean
          last_response_code?: number | null
          last_status?: string | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number
          secret?: string | null
          timeout_seconds?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      whatsapp_message_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_content: string
          message_type: string
          recipient_number: string
          status: string
          violation_id: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_content: string
          message_type?: string
          recipient_number: string
          status?: string
          violation_id?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_content?: string
          message_type?: string
          recipient_number?: string
          status?: string
          violation_id?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_logs_violation_id_fkey"
            columns: ["violation_id"]
            isOneToOne: false
            referencedRelation: "security_violations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_notification_settings: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          id: string
          notify_critical: boolean
          notify_high: boolean
          notify_low: boolean
          notify_medium: boolean
          phone_number_id: string | null
          recipient_numbers: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          notify_critical?: boolean
          notify_high?: boolean
          notify_low?: boolean
          notify_medium?: boolean
          phone_number_id?: string | null
          recipient_numbers?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          id?: string
          notify_critical?: boolean
          notify_high?: boolean
          notify_low?: boolean
          notify_medium?: boolean
          phone_number_id?: string | null
          recipient_numbers?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      work_schedules: {
        Row: {
          allow_overtime: boolean
          auto_block_enabled: boolean
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          grace_period_minutes: number
          id: string
          lunch_end: string | null
          lunch_start: string | null
          name: string
          start_time: string
          updated_at: string
          work_days: number[]
        }
        Insert: {
          allow_overtime?: boolean
          auto_block_enabled?: boolean
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          grace_period_minutes?: number
          id?: string
          lunch_end?: string | null
          lunch_start?: string | null
          name: string
          start_time?: string
          updated_at?: string
          work_days?: number[]
        }
        Update: {
          allow_overtime?: boolean
          auto_block_enabled?: boolean
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          grace_period_minutes?: number
          id?: string
          lunch_end?: string | null
          lunch_start?: string | null
          name?: string
          start_time?: string
          updated_at?: string
          work_days?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "work_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      all_click_logs: {
        Row: {
          app_name: string | null
          click_type: string | null
          created_at: string | null
          device: string | null
          employee_name: string | null
          id: string | null
          recorded_at: string | null
          target_element: string | null
          url: string | null
          window_title: string | null
          x_position: number | null
          y_position: number | null
        }
        Relationships: []
      }
      all_keystroke_logs: {
        Row: {
          active_time_seconds: number | null
          app_name: string | null
          created_at: string | null
          device: string | null
          employee_name: string | null
          id: string | null
          idle_time_seconds: number | null
          keystrokes_count: number | null
          recorded_at: string | null
        }
        Relationships: []
      }
      all_mobile_activity_logs: {
        Row: {
          activity_type: string | null
          app_name: string | null
          created_at: string | null
          device_id: string | null
          duration_seconds: number | null
          employee_name: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          recorded_at: string | null
        }
        Relationships: []
      }
      all_productivity_logs: {
        Row: {
          apps_used: Json | null
          created_at: string | null
          device: string | null
          employee_name: string | null
          id: string | null
          neutral_time_seconds: number | null
          productive_time_seconds: number | null
          recorded_date: string | null
          unproductive_time_seconds: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_identifier_type: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: Json
      }
      cleanup_rate_limit_logs: { Args: never; Returns: number }
      create_monthly_partition: {
        Args: { p_partition_date: string; p_table_name: string }
        Returns: string
      }
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ip_blocked: { Args: { p_ip_address: string }; Returns: boolean }
      user_in_company: {
        Args: { _company_id: string; _user_id: string }
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
