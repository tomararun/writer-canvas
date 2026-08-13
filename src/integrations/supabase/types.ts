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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      case_studies: {
        Row: {
          background: string
          client: string
          created_at: string
          featured: boolean
          gallery: Json
          id: string
          implementation: string[]
          learnings: string[]
          metrics: Json
          outcomes: string
          preview_token: string
          problem: string
          process: Json
          published: boolean
          published_at: string | null
          role: string
          scheduled_for: string | null
          slug: string
          status: string
          summary: string
          tags: string[]
          title: string
          updated_at: string
          year: string
        }
        Insert: {
          background?: string
          client?: string
          created_at?: string
          featured?: boolean
          gallery?: Json
          id?: string
          implementation?: string[]
          learnings?: string[]
          metrics?: Json
          outcomes?: string
          preview_token?: string
          problem?: string
          process?: Json
          published?: boolean
          published_at?: string | null
          role?: string
          scheduled_for?: string | null
          slug: string
          status?: string
          summary?: string
          tags?: string[]
          title: string
          updated_at?: string
          year?: string
        }
        Update: {
          background?: string
          client?: string
          created_at?: string
          featured?: boolean
          gallery?: Json
          id?: string
          implementation?: string[]
          learnings?: string[]
          metrics?: Json
          outcomes?: string
          preview_token?: string
          problem?: string
          process?: Json
          published?: boolean
          published_at?: string | null
          role?: string
          scheduled_for?: string | null
          slug?: string
          status?: string
          summary?: string
          tags?: string[]
          title?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      content_audit_log: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          slug: string
          table_name: string
        }
        Insert: {
          action: string
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          slug: string
          table_name: string
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          slug?: string
          table_name?: string
        }
        Relationships: []
      }
      content_revisions: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_email: string
          id: string
          note: string
          slug: string
          snapshot: Json
          table_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_email?: string
          id?: string
          note?: string
          slug: string
          snapshot: Json
          table_name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_email?: string
          id?: string
          note?: string
          slug?: string
          snapshot?: Json
          table_name?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          preview_token: string
          published: boolean
          published_at: string | null
          reflection: string[]
          reflection_md: string
          resources: Json
          scheduled_for: string | null
          slug: string
          status: string
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          preview_token?: string
          published?: boolean
          published_at?: string | null
          reflection?: string[]
          reflection_md?: string
          resources?: Json
          scheduled_for?: string | null
          slug: string
          status?: string
          title: string
          topic?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          preview_token?: string
          published?: boolean
          published_at?: string | null
          reflection?: string[]
          reflection_md?: string
          resources?: Json
          scheduled_for?: string | null
          slug?: string
          status?: string
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string[]
          body_md: string
          category: string
          created_at: string
          date: string
          dek: string
          featured: boolean
          id: string
          preview_token: string
          published: boolean
          published_at: string | null
          reading_time: number
          scheduled_for: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string[]
          body_md?: string
          category?: string
          created_at?: string
          date?: string
          dek?: string
          featured?: boolean
          id?: string
          preview_token?: string
          published?: boolean
          published_at?: string | null
          reading_time?: number
          scheduled_for?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string[]
          body_md?: string
          category?: string
          created_at?: string
          date?: string
          dek?: string
          featured?: boolean
          id?: string
          preview_token?: string
          published?: boolean
          published_at?: string | null
          reading_time?: number
          scheduled_for?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          blurb: string
          case_study: string | null
          created_at: string
          id: string
          link: string | null
          name: string
          slug: string
          status: string
          updated_at: string
          year: string
        }
        Insert: {
          blurb?: string
          case_study?: string | null
          created_at?: string
          id?: string
          link?: string | null
          name: string
          slug: string
          status?: string
          updated_at?: string
          year?: string
        }
        Update: {
          blurb?: string
          case_study?: string | null
          created_at?: string
          id?: string
          link?: string | null
          name?: string
          slug?: string
          status?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      publish_due_content: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
