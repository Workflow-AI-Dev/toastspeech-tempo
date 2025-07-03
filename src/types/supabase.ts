export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      evaluations: {
        Row: {
          ai_feedback: Json | null
          avg_pause_duration: string | null
          clarity_score: number | null
          confidence_score: number | null
          content_insight_score: number | null
          created_at: string | null
          duration_seconds: number | null
          evaluation_accuracy_score: number | null
          evaluation_method: string | null
          evaluation_recording_uri: string | null
          id: string
          improvement_percentage: string | null
          improvements: string[] | null
          key_insights: string[] | null
          original_speech_uri: string | null
          overall_score: number | null
          speaking_quality_score: number | null
          speech_id: string | null
          status: string | null
          strengths: string[] | null
          transcribed_evaluation: string | null
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          ai_feedback?: Json | null
          avg_pause_duration?: string | null
          clarity_score?: number | null
          confidence_score?: number | null
          content_insight_score?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          evaluation_accuracy_score?: number | null
          evaluation_method?: string | null
          evaluation_recording_uri?: string | null
          id?: string
          improvement_percentage?: string | null
          improvements?: string[] | null
          key_insights?: string[] | null
          original_speech_uri?: string | null
          overall_score?: number | null
          speaking_quality_score?: number | null
          speech_id?: string | null
          status?: string | null
          strengths?: string[] | null
          transcribed_evaluation?: string | null
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          ai_feedback?: Json | null
          avg_pause_duration?: string | null
          clarity_score?: number | null
          confidence_score?: number | null
          content_insight_score?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          evaluation_accuracy_score?: number | null
          evaluation_method?: string | null
          evaluation_recording_uri?: string | null
          id?: string
          improvement_percentage?: string | null
          improvements?: string[] | null
          key_insights?: string[] | null
          original_speech_uri?: string | null
          overall_score?: number | null
          speaking_quality_score?: number | null
          speech_id?: string | null
          status?: string | null
          strengths?: string[] | null
          transcribed_evaluation?: string | null
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_speech_id_fkey"
            columns: ["speech_id"]
            isOneToOne: false
            referencedRelation: "speeches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      speeches: {
        Row: {
          ai_feedback: Json | null
          avg_pause_duration: string | null
          category: string | null
          clarity_score: number | null
          confidence_score: number | null
          created_at: string | null
          duration_seconds: number | null
          emotional_delivery_score: number | null
          engagement_score: number | null
          evaluation_criteria: string[] | null
          evaluator_name: string | null
          file_name: string | null
          file_size: number | null
          filler_words_count: number | null
          id: string
          improvement_percentage: string | null
          improvements: string[] | null
          key_insights: string[] | null
          mime_type: string | null
          overall_score: number | null
          pace_score: number | null
          purpose: string | null
          recording_method: string | null
          recording_uri: string | null
          speech_type: string
          status: string | null
          strengths: string[] | null
          suggestions: string[] | null
          target_duration: string | null
          title: string
          transcription: string | null
          updated_at: string | null
          user_id: string
          word_count: number | null
        }
        Insert: {
          ai_feedback?: Json | null
          avg_pause_duration?: string | null
          category?: string | null
          clarity_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          emotional_delivery_score?: number | null
          engagement_score?: number | null
          evaluation_criteria?: string[] | null
          evaluator_name?: string | null
          file_name?: string | null
          file_size?: number | null
          filler_words_count?: number | null
          id?: string
          improvement_percentage?: string | null
          improvements?: string[] | null
          key_insights?: string[] | null
          mime_type?: string | null
          overall_score?: number | null
          pace_score?: number | null
          purpose?: string | null
          recording_method?: string | null
          recording_uri?: string | null
          speech_type: string
          status?: string | null
          strengths?: string[] | null
          suggestions?: string[] | null
          target_duration?: string | null
          title: string
          transcription?: string | null
          updated_at?: string | null
          user_id: string
          word_count?: number | null
        }
        Update: {
          ai_feedback?: Json | null
          avg_pause_duration?: string | null
          category?: string | null
          clarity_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          emotional_delivery_score?: number | null
          engagement_score?: number | null
          evaluation_criteria?: string[] | null
          evaluator_name?: string | null
          file_name?: string | null
          file_size?: number | null
          filler_words_count?: number | null
          id?: string
          improvement_percentage?: string | null
          improvements?: string[] | null
          key_insights?: string[] | null
          mime_type?: string | null
          overall_score?: number | null
          pace_score?: number | null
          purpose?: string | null
          recording_method?: string | null
          recording_uri?: string | null
          speech_type?: string
          status?: string | null
          strengths?: string[] | null
          suggestions?: string[] | null
          target_duration?: string | null
          title?: string
          transcription?: string | null
          updated_at?: string | null
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "speeches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_usage: {
        Row: {
          created_at: string | null
          evaluations_limit: number
          evaluations_used: number | null
          id: string
          month: number
          speeches_limit: number
          speeches_used: number | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string | null
          evaluations_limit: number
          evaluations_used?: number | null
          id?: string
          month: number
          speeches_limit: number
          speeches_used?: number | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string | null
          evaluations_limit?: number
          evaluations_used?: number | null
          id?: string
          month?: number
          speeches_limit?: number
          speeches_used?: number | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          avg_score: number | null
          created_at: string | null
          date: string
          evaluations_count: number | null
          id: string
          speeches_count: number | null
          streak_maintained: boolean | null
          total_practice_time: number | null
          user_id: string
        }
        Insert: {
          avg_score?: number | null
          created_at?: string | null
          date: string
          evaluations_count?: number | null
          id?: string
          speeches_count?: number | null
          streak_maintained?: boolean | null
          total_practice_time?: number | null
          user_id: string
        }
        Update: {
          avg_score?: number | null
          created_at?: string | null
          date?: string
          evaluations_count?: number | null
          id?: string
          speeches_count?: number | null
          streak_maintained?: boolean | null
          total_practice_time?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age_group: string | null
          avatar: string | null
          avatar_style: string | null
          avg_score: number | null
          created_at: string | null
          custom_purpose: string | null
          daily_reminders: boolean | null
          email: string
          gender: string | null
          id: string
          level: number | null
          location: string | null
          name: string
          notifications_enabled: boolean | null
          phone: string | null
          profession: string | null
          purposes: string[] | null
          streak: number | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
          theme_preference: string | null
          total_speeches: number | null
          updated_at: string | null
          weekly_reports: boolean | null
        }
        Insert: {
          age_group?: string | null
          avatar?: string | null
          avatar_style?: string | null
          avg_score?: number | null
          created_at?: string | null
          custom_purpose?: string | null
          daily_reminders?: boolean | null
          email: string
          gender?: string | null
          id: string
          level?: number | null
          location?: string | null
          name: string
          notifications_enabled?: boolean | null
          phone?: string | null
          profession?: string | null
          purposes?: string[] | null
          streak?: number | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          theme_preference?: string | null
          total_speeches?: number | null
          updated_at?: string | null
          weekly_reports?: boolean | null
        }
        Update: {
          age_group?: string | null
          avatar?: string | null
          avatar_style?: string | null
          avg_score?: number | null
          created_at?: string | null
          custom_purpose?: string | null
          daily_reminders?: boolean | null
          email?: string
          gender?: string | null
          id?: string
          level?: number | null
          location?: string | null
          name?: string
          notifications_enabled?: boolean | null
          phone?: string | null
          profession?: string | null
          purposes?: string[] | null
          streak?: number | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          theme_preference?: string | null
          total_speeches?: number | null
          updated_at?: string | null
          weekly_reports?: boolean | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
