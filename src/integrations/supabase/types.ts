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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      discharge_summaries: {
        Row: {
          created_at: string
          created_by: string | null
          diagnosis: string
          discharged_at: string
          follow_up_instructions: string | null
          id: string
          medications: string | null
          outcome: string
          patient_id: string
          referral_id: string
          treatment_given: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          diagnosis?: string
          discharged_at?: string
          follow_up_instructions?: string | null
          id?: string
          medications?: string | null
          outcome?: string
          patient_id: string
          referral_id: string
          treatment_given?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          diagnosis?: string
          discharged_at?: string
          follow_up_instructions?: string | null
          id?: string
          medications?: string | null
          outcome?: string
          patient_id?: string
          referral_id?: string
          treatment_given?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discharge_summaries_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      fchv_feedback: {
        Row: {
          created_at: string
          feedback_type: string
          from_doctor: string | null
          id: string
          is_read: boolean
          message: string
          referral_id: string
          to_fchv: string | null
        }
        Insert: {
          created_at?: string
          feedback_type?: string
          from_doctor?: string | null
          id?: string
          is_read?: boolean
          message?: string
          referral_id: string
          to_fchv?: string | null
        }
        Update: {
          created_at?: string
          feedback_type?: string
          from_doctor?: string | null
          id?: string
          is_read?: boolean
          message?: string
          referral_id?: string
          to_fchv?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fchv_feedback_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_images: {
        Row: {
          annotations: Json | null
          category: string
          consent_given: boolean
          consent_timestamp: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          expires_at: string
          face_blurred: boolean
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          patient_id: string
          sync_status: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          annotations?: Json | null
          category: string
          consent_given?: boolean
          consent_timestamp?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expires_at?: string
          face_blurred?: boolean
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          patient_id: string
          sync_status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          annotations?: Json | null
          category?: string
          consent_given?: boolean
          consent_timestamp?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expires_at?: string
          face_blurred?: boolean
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          patient_id?: string
          sync_status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          ward: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          ward?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          ward?: string | null
        }
        Relationships: []
      }
      referral_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          referral_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          referral_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          referral_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_updates_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          additional_notes: string | null
          assigned_doctor: string | null
          created_at: string
          date: string
          facility: string
          id: string
          patient_id: string
          patient_name: string
          provisional_diagnosis: string
          referred_by: string | null
          sms_preview: string | null
          status: string
          tracking_status: string
          transport_arranged: boolean
          updated_at: string
          urgency: string
        }
        Insert: {
          additional_notes?: string | null
          assigned_doctor?: string | null
          created_at?: string
          date?: string
          facility?: string
          id?: string
          patient_id: string
          patient_name?: string
          provisional_diagnosis?: string
          referred_by?: string | null
          sms_preview?: string | null
          status?: string
          tracking_status?: string
          transport_arranged?: boolean
          updated_at?: string
          urgency?: string
        }
        Update: {
          additional_notes?: string | null
          assigned_doctor?: string | null
          created_at?: string
          date?: string
          facility?: string
          id?: string
          patient_id?: string
          patient_name?: string
          provisional_diagnosis?: string
          referred_by?: string | null
          sms_preview?: string | null
          status?: string
          tracking_status?: string
          transport_arranged?: boolean
          updated_at?: string
          urgency?: string
        }
        Relationships: []
      }
      sync_queue: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          data: Json
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          priority: string
          retry_count: number
          status: string
          synced_at: string | null
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          data: Json
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          priority?: string
          retry_count?: number
          status?: string
          synced_at?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          data?: Json
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          priority?: string
          retry_count?: number
          status?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_user_district: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "fchv" | "supervisor" | "doctor" | "admin"
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
      app_role: ["fchv", "supervisor", "doctor", "admin"],
    },
  },
} as const
