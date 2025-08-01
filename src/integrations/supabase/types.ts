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
      ad_assets: {
        Row: {
          created_at: string
          file_size: number
          filename: string
          id: string
          mime_type: string
          status: string
          storage_path: string
          type: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_size: number
          filename: string
          id?: string
          mime_type: string
          status?: string
          storage_path: string
          type: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_size?: number
          filename?: string
          id?: string
          mime_type?: string
          status?: string
          storage_path?: string
          type?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      ad_campaigns: {
        Row: {
          ad_banner_url: string | null
          ad_video_url: string | null
          budget_allocated: number
          campaign_name: string
          cost_per_impression: number | null
          created_at: string
          format: string
          id: string
          runtime_seconds: number | null
          sponsor_id: string
          status: string | null
          target_category: string | null
          target_videos: string[] | null
          updated_at: string
        }
        Insert: {
          ad_banner_url?: string | null
          ad_video_url?: string | null
          budget_allocated: number
          campaign_name: string
          cost_per_impression?: number | null
          created_at?: string
          format: string
          id?: string
          runtime_seconds?: number | null
          sponsor_id: string
          status?: string | null
          target_category?: string | null
          target_videos?: string[] | null
          updated_at?: string
        }
        Update: {
          ad_banner_url?: string | null
          ad_video_url?: string | null
          budget_allocated?: number
          campaign_name?: string
          cost_per_impression?: number | null
          created_at?: string
          format?: string
          id?: string
          runtime_seconds?: number | null
          sponsor_id?: string
          status?: string | null
          target_category?: string | null
          target_videos?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          ad_asset_id: string
          device_fingerprint: string | null
          duration_seconds: number | null
          id: string
          viewed_at: string
          viewer_node_id: string | null
        }
        Insert: {
          ad_asset_id: string
          device_fingerprint?: string | null
          duration_seconds?: number | null
          id?: string
          viewed_at?: string
          viewer_node_id?: string | null
        }
        Update: {
          ad_asset_id?: string
          device_fingerprint?: string | null
          duration_seconds?: number | null
          id?: string
          viewed_at?: string
          viewer_node_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_ad_asset_id_fkey"
            columns: ["ad_asset_id"]
            isOneToOne: false
            referencedRelation: "ad_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_impressions_viewer_node_id_fkey"
            columns: ["viewer_node_id"]
            isOneToOne: false
            referencedRelation: "mesh_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
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
      content_events: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          show_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          show_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          show_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_events_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          bio: string | null
          created_at: string
          creator_name: string
          id: string
          license_type: string | null
          logo_url: string | null
          revenue_enabled: boolean | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          creator_name: string
          id?: string
          license_type?: string | null
          logo_url?: string | null
          revenue_enabled?: boolean | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          creator_name?: string
          id?: string
          license_type?: string | null
          logo_url?: string | null
          revenue_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      mesh_bundles: {
        Row: {
          ad_campaign_ids: string[] | null
          bundle_name: string
          bundle_size_mb: number | null
          bundle_url: string | null
          created_at: string
          geographic_focus: string | null
          id: string
          sponsor_id: string | null
          status: string | null
          ttl_hours: number | null
          updated_at: string
          video_ids: string[]
        }
        Insert: {
          ad_campaign_ids?: string[] | null
          bundle_name: string
          bundle_size_mb?: number | null
          bundle_url?: string | null
          created_at?: string
          geographic_focus?: string | null
          id?: string
          sponsor_id?: string | null
          status?: string | null
          ttl_hours?: number | null
          updated_at?: string
          video_ids: string[]
        }
        Update: {
          ad_campaign_ids?: string[] | null
          bundle_name?: string
          bundle_size_mb?: number | null
          bundle_url?: string | null
          created_at?: string
          geographic_focus?: string | null
          id?: string
          sponsor_id?: string | null
          status?: string | null
          ttl_hours?: number | null
          updated_at?: string
          video_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "mesh_bundles_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
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
      sponsors: {
        Row: {
          budget_remaining: number | null
          budget_total: number | null
          company_name: string
          contact_email: string | null
          created_at: string
          id: string
          logo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_remaining?: number | null
          budget_total?: number | null
          company_name: string
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_remaining?: number | null
          budget_total?: number | null
          company_name?: string
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_usage: {
        Row: {
          bucket_name: string
          id: string
          last_updated: string
          total_files: number | null
          total_size_bytes: number | null
        }
        Insert: {
          bucket_name: string
          id?: string
          last_updated?: string
          total_files?: number | null
          total_size_bytes?: number | null
        }
        Update: {
          bucket_name?: string
          id?: string
          last_updated?: string
          total_files?: number | null
          total_size_bytes?: number | null
        }
        Relationships: []
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
      videos: {
        Row: {
          access_token: string | null
          category: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          distribution_type: string | null
          duration_minutes: number | null
          file_size_bytes: number | null
          id: string
          license_type: string | null
          revenue_enabled: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          verified_creator_content: boolean | null
          video_url: string | null
        }
        Insert: {
          access_token?: string | null
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          distribution_type?: string | null
          duration_minutes?: number | null
          file_size_bytes?: number | null
          id?: string
          license_type?: string | null
          revenue_enabled?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          verified_creator_content?: boolean | null
          video_url?: string | null
        }
        Update: {
          access_token?: string | null
          category?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          distribution_type?: string | null
          duration_minutes?: number | null
          file_size_bytes?: number | null
          id?: string
          license_type?: string | null
          revenue_enabled?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          verified_creator_content?: boolean | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      view_stats: {
        Row: {
          ad_campaign_id: string | null
          ad_watched_duration_seconds: number | null
          device_fingerprint: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          offline_synced: boolean | null
          video_id: string | null
          viewed_at: string
          viewer_node_id: string | null
          watched_duration_seconds: number | null
        }
        Insert: {
          ad_campaign_id?: string | null
          ad_watched_duration_seconds?: number | null
          device_fingerprint?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          offline_synced?: boolean | null
          video_id?: string | null
          viewed_at?: string
          viewer_node_id?: string | null
          watched_duration_seconds?: number | null
        }
        Update: {
          ad_campaign_id?: string | null
          ad_watched_duration_seconds?: number | null
          device_fingerprint?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          offline_synced?: boolean | null
          video_id?: string | null
          viewed_at?: string
          viewer_node_id?: string | null
          watched_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "view_stats_ad_campaign_id_fkey"
            columns: ["ad_campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "view_stats_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_settings: {
        Row: {
          created_at: string
          enabled: boolean | null
          events: string[] | null
          id: string
          updated_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          events?: string[] | null
          id?: string
          updated_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          events?: string[] | null
          id?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_storage_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_name: string
          file_count: number
          total_size: number
        }[]
      }
      discover_nearby_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          category: string
          thumbnail_url: string
          video_url: string
          duration_minutes: number
          file_size_bytes: number
          distance_meters: number
          signal_strength: number
          sender_node: string
        }[]
      }
      get_sponsor_stats: {
        Args: { sponsor_user_id: string }
        Returns: Json
      }
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
