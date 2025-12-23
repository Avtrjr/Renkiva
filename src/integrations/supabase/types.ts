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
      mesh_channel_invites: {
        Row: {
          channel_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          invite_code: string
          max_uses: number | null
          used_by: string[] | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code: string
          max_uses?: number | null
          used_by?: string[] | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          max_uses?: number | null
          used_by?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "mesh_channel_invites_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "mesh_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      mesh_channels: {
        Row: {
          channel_name: string
          created_at: string | null
          description: string | null
          device_limit: number | null
          id: string
          is_private: boolean | null
          owner_id: string | null
          passphrase_hint: string | null
        }
        Insert: {
          channel_name: string
          created_at?: string | null
          description?: string | null
          device_limit?: number | null
          id?: string
          is_private?: boolean | null
          owner_id?: string | null
          passphrase_hint?: string | null
        }
        Update: {
          channel_name?: string
          created_at?: string | null
          description?: string | null
          device_limit?: number | null
          id?: string
          is_private?: boolean | null
          owner_id?: string | null
          passphrase_hint?: string | null
        }
        Relationships: []
      }
      mesh_fragments: {
        Row: {
          device_id: string
          fragment_count: number | null
          fragment_hash: string
          id: string
          last_seen: string | null
          total_size_mb: number | null
          video_title: string
        }
        Insert: {
          device_id: string
          fragment_count?: number | null
          fragment_hash: string
          id?: string
          last_seen?: string | null
          total_size_mb?: number | null
          video_title: string
        }
        Update: {
          device_id?: string
          fragment_count?: number | null
          fragment_hash?: string
          id?: string
          last_seen?: string | null
          total_size_mb?: number | null
          video_title?: string
        }
        Relationships: []
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
      mesh_packets: {
        Row: {
          created_at: string
          flags: Json
          id: string
          packet_type: number
          payload: string
          processed_by_node: string | null
          receiver_id: string
          sender_id: string
          timestamp: string
          ttl: number
        }
        Insert: {
          created_at?: string
          flags?: Json
          id?: string
          packet_type: number
          payload: string
          processed_by_node?: string | null
          receiver_id: string
          sender_id: string
          timestamp: string
          ttl: number
        }
        Update: {
          created_at?: string
          flags?: Json
          id?: string
          packet_type?: number
          payload?: string
          processed_by_node?: string | null
          receiver_id?: string
          sender_id?: string
          timestamp?: string
          ttl?: number
        }
        Relationships: []
      }
      mesh_streams: {
        Row: {
          category: string | null
          checksum: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_complete: boolean | null
          sender_node: string
          started_at: string
          stream_id: string
          title: string | null
          total_fragments: number | null
        }
        Insert: {
          category?: string | null
          checksum?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_complete?: boolean | null
          sender_node: string
          started_at: string
          stream_id: string
          title?: string | null
          total_fragments?: number | null
        }
        Update: {
          category?: string | null
          checksum?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_complete?: boolean | null
          sender_node?: string
          started_at?: string
          stream_id?: string
          title?: string | null
          total_fragments?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accepted_legal: boolean | null
          avatar_url: string | null
          bio: string | null
          consent_given_at: string | null
          created_at: string
          data_export_requested_at: string | null
          display_name: string | null
          id: string
          legal_accepted_at: string | null
          location_consent: boolean | null
          updated_at: string
          username: string
        }
        Insert: {
          accepted_legal?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          consent_given_at?: string | null
          created_at?: string
          data_export_requested_at?: string | null
          display_name?: string | null
          id: string
          legal_accepted_at?: string | null
          location_consent?: boolean | null
          updated_at?: string
          username: string
        }
        Update: {
          accepted_legal?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          consent_given_at?: string | null
          created_at?: string
          data_export_requested_at?: string | null
          display_name?: string | null
          id?: string
          legal_accepted_at?: string | null
          location_consent?: boolean | null
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
      stream_fragments: {
        Row: {
          data: string
          fragment_index: number
          id: string
          received_at: string
          received_from_node: string
          stream_id: string
          total_fragments: number
        }
        Insert: {
          data: string
          fragment_index: number
          id?: string
          received_at?: string
          received_from_node: string
          stream_id: string
          total_fragments: number
        }
        Update: {
          data?: string
          fragment_index?: number
          id?: string
          received_at?: string
          received_from_node?: string
          stream_id?: string
          total_fragments?: number
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
        Args: never
        Returns: {
          bucket_name: string
          file_count: number
          total_size: number
        }[]
      }
      cleanup_old_location_data: { Args: never; Returns: undefined }
      cleanup_old_view_stats: { Args: never; Returns: undefined }
      discover_nearby_content: {
        Args: never
        Returns: {
          category: string
          description: string
          distance_meters: number
          duration_minutes: number
          file_size_bytes: number
          id: string
          sender_node: string
          signal_strength: number
          thumbnail_url: string
          title: string
          video_url: string
        }[]
      }
      get_sponsor_stats: { Args: { sponsor_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
