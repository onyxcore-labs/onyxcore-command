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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      founder_credentials: {
        Row: {
          handle: string
          passcode_hash: string
          updated_at: string
        }
        Insert: {
          handle: string
          passcode_hash: string
          updated_at?: string
        }
        Update: {
          handle?: string
          passcode_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      founder_sessions: {
        Row: {
          expires_at: string
          handle: string
          token_hash: string
        }
        Insert: {
          expires_at?: string
          handle: string
          token_hash: string
        }
        Update: {
          expires_at?: string
          handle?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_sessions_handle_fkey"
            columns: ["handle"]
            isOneToOne: false
            referencedRelation: "founder_credentials"
            referencedColumns: ["handle"]
          },
        ]
      }
      founder_status: {
        Row: {
          blocker: string | null
          completed_milestones: Json
          current_task: string
          full_name: string
          handle: string
          is_online: boolean
          last_active: string
          progress_pct: number
          role: string
        }
        Insert: {
          blocker?: string | null
          completed_milestones?: Json
          current_task?: string
          full_name: string
          handle: string
          is_online?: boolean
          last_active?: string
          progress_pct?: number
          role: string
        }
        Update: {
          blocker?: string | null
          completed_milestones?: Json
          current_task?: string
          full_name?: string
          handle?: string
          is_online?: boolean
          last_active?: string
          progress_pct?: number
          role?: string
        }
        Relationships: []
      }
      hardware_inventory: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          part_name: string
          quantity_available: number
          specs: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          id?: string
          part_name: string
          quantity_available?: number
          specs?: string
          status?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          part_name?: string
          quantity_available?: number
          specs?: string
          status?: string
        }
        Relationships: []
      }
      project_ideas: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          source_url: string
          submitted_by: string
          title: string
          upvotes: number
          verdict: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          source_url?: string
          submitted_by: string
          title: string
          upvotes?: number
          verdict?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          source_url?: string
          submitted_by?: string
          title?: string
          upvotes?: number
          verdict?: string
        }
        Relationships: []
      }
      security_audit: {
        Row: {
          action: string
          created_at: string
          handle: string
          id: string
        }
        Insert: {
          action: string
          created_at?: string
          handle: string
          id?: string
        }
        Update: {
          action?: string
          created_at?: string
          handle?: string
          id?: string
        }
        Relationships: []
      }
      squad_messages: {
        Row: {
          channel: string
          content: string
          created_at: string
          id: string
          sender_handle: string
          sender_name: string
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          id?: string
          sender_handle: string
          sender_name: string
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          id?: string
          sender_handle?: string
          sender_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      founder_change_passcode: {
        Args: { p_current: string; p_new: string; p_token: string }
        Returns: undefined
      }
      founder_login: {
        Args: { p_handle: string; p_passcode: string }
        Returns: string
      }
      founder_logout: { Args: { p_token: string }; Returns: undefined }
      founder_session_handle: { Args: { p_token: string }; Returns: string }
      upvote_project_idea: { Args: { p_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
