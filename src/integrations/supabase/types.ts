export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      broadcast_sessions: {
        Row: {
          broadcaster_node_id: string | null
          created_at: string
          ended_at: string | null
          fragments_sent: number | null
          id: string
          is_active: boolean | null
          session_name: string | null
          show_id: string | null
          started_at: string | null
          total_fragments: number | null
          updated_at: string
          viewer_count: number | null
        }
        Insert: {
          broadcaster_node_id?: string | null
          created_at?: string
          ended_at?: string | null
          fragments_sent?: number | null
          id?: string
          is_active?: boolean | null
          session_name?: string | null
          show_id?: string | null
          started_at?: string | null
          total_fragments?: number | null
          updated_at?: string
          viewer_count?: number | null
        }
        Update: {
          broadcaster_node_id?: string | null
          created_at?: string
          ended_at?: string | null
          fragments_sent?: number | null
          id?: string
          is_active?: boolean | null
          session_name?: string | null
          show_id?: string | null
          started_at?: string | null
          total_fragments?: number | null
          updated_at?: string
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_sessions_broadcaster_node_id_fkey"
            columns: ["broadcaster_node_id"]
            isOneToOne: false
            referencedRelation: "mesh_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_sessions_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      fragment_receipts: {
        Row: {
          fragment_id: string | null
          id: string
          received_at: string | null
          receiver_node_id: string | null
          verified: boolean | null
        }
        Insert: {
          fragment_id?: string | null
          id?: string
          received_at?: string | null
          receiver_node_id?: string | null
          verified?: boolean | null
        }
        Update: {
          fragment_id?: string | null
          id?: string
          received_at?: string | null
          receiver_node_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fragment_receipts_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: false
            referencedRelation: "video_fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragment_receipts_receiver_node_id_fkey"
            columns: ["receiver_node_id"]
            isOneToOne: false
            referencedRelation: "mesh_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      mesh_nodes: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          is_active: boolean | null
          last_seen: string | null
          latitude: number | null
          longitude: number | null
          node_name: string
          signal_strength: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          latitude?: number | null
          longitude?: number | null
          node_name: string
          signal_strength?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          is_active?: boolean | null
          last_seen?: string | null
          latitude?: number | null
          longitude?: number | null
          node_name?: string
          signal_strength?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mesh_nodes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      shows: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          file_size_bytes: number | null
          id: string
          is_public: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_size_bytes?: number | null
          id?: string
          is_public?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          file_size_bytes?: number | null
          id?: string
          is_public?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_shows_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      video_fragments: {
        Row: {
          broadcast_session_id: string | null
          checksum: string
          created_at: string
          fragment_size: number
          id: string
          sender_node_id: string | null
          sequence_number: number
          total_fragments: number
          video_id: string
        }
        Insert: {
          broadcast_session_id?: string | null
          checksum: string
          created_at?: string
          fragment_size: number
          id?: string
          sender_node_id?: string | null
          sequence_number: number
          total_fragments: number
          video_id: string
        }
        Update: {
          broadcast_session_id?: string | null
          checksum?: string
          created_at?: string
          fragment_size?: number
          id?: string
          sender_node_id?: string | null
          sequence_number?: number
          total_fragments?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_fragments_broadcast_session_id_fkey"
            columns: ["broadcast_session_id"]
            isOneToOne: false
            referencedRelation: "broadcast_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_fragments_sender_node_id_fkey"
            columns: ["sender_node_id"]
            isOneToOne: false
            referencedRelation: "mesh_nodes"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
