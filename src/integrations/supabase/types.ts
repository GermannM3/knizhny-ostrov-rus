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
      automation_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          parameters: Json | null
          project_id: string
          result: Json | null
          scheduled_at: string | null
          status: string | null
          task_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          parameters?: Json | null
          project_id: string
          result?: Json | null
          scheduled_at?: string | null
          status?: string | null
          task_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          parameters?: Json | null
          project_id?: string
          result?: Json | null
          scheduled_at?: string | null
          status?: string | null
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_analysis: {
        Row: {
          analysis_data: Json | null
          backlinks_count: number | null
          competitor_url: string
          created_at: string | null
          domain_authority: number | null
          id: string
          keywords_count: number | null
          project_id: string
          traffic_estimate: number | null
        }
        Insert: {
          analysis_data?: Json | null
          backlinks_count?: number | null
          competitor_url: string
          created_at?: string | null
          domain_authority?: number | null
          id?: string
          keywords_count?: number | null
          project_id: string
          traffic_estimate?: number | null
        }
        Update: {
          analysis_data?: Json | null
          backlinks_count?: number | null
          competitor_url?: string
          created_at?: string | null
          domain_authority?: number | null
          id?: string
          keywords_count?: number | null
          project_id?: string
          traffic_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          content: string
          created_at: string | null
          id: string
          keywords: string[] | null
          project_id: string
          published_at: string | null
          seo_score: number | null
          status: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          project_id: string
          published_at?: string | null
          seo_score?: number | null
          status?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          project_id?: string
          published_at?: string | null
          seo_score?: number | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          created_at: string | null
          id: string
          keyword: string
          position: number | null
          project_id: string
          search_volume: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          keyword: string
          position?: number | null
          project_id: string
          search_volume?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          keyword?: string
          position?: number | null
          project_id?: string
          search_volume?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keywords_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      link_building: {
        Row: {
          anchor_text: string | null
          created_at: string | null
          domain_authority: number | null
          id: string
          project_id: string
          source_type: string | null
          status: string | null
          target_url: string
          updated_at: string | null
        }
        Insert: {
          anchor_text?: string | null
          created_at?: string | null
          domain_authority?: number | null
          id?: string
          project_id: string
          source_type?: string | null
          status?: string | null
          target_url: string
          updated_at?: string | null
        }
        Update: {
          anchor_text?: string | null
          created_at?: string | null
          domain_authority?: number | null
          id?: string
          project_id?: string
          source_type?: string | null
          status?: string | null
          target_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_building_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_credentials: {
        Row: {
          api_key: string
          client_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_tested: string | null
          marketplace: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_tested?: string | null
          marketplace: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          client_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_tested?: string | null
          marketplace?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      position_tracking: {
        Row: {
          checked_at: string | null
          id: string
          keyword: string
          position: number | null
          project_id: string
          search_engine: string | null
          url: string | null
        }
        Insert: {
          checked_at?: string | null
          id?: string
          keyword: string
          position?: number | null
          project_id: string
          search_engine?: string | null
          url?: string | null
        }
        Update: {
          checked_at?: string | null
          id?: string
          keyword?: string
          position?: number | null
          project_id?: string
          search_engine?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "position_tracking_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category: string | null
          created_at: string | null
          current_price: number | null
          external_id: string
          id: string
          image_url: string | null
          marketplace: string
          name: string
          product_url: string | null
          purchase_price: number | null
          sku: string | null
          status: string | null
          stock_quantity: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          current_price?: number | null
          external_id: string
          id?: string
          image_url?: string | null
          marketplace: string
          name: string
          product_url?: string | null
          purchase_price?: number | null
          sku?: string | null
          status?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          current_price?: number | null
          external_id?: string
          id?: string
          image_url?: string | null
          marketplace?: string
          name?: string
          product_url?: string | null
          purchase_price?: number | null
          sku?: string | null
          status?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
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
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_keywords: {
        Row: {
          created_at: string | null
          current_position: number | null
          difficulty: number | null
          id: string
          keyword: string
          project_id: string
          search_volume: number | null
          target_position: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_position?: number | null
          difficulty?: number | null
          id?: string
          keyword: string
          project_id: string
          search_volume?: number | null
          target_position?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_position?: number | null
          difficulty?: number | null
          id?: string
          keyword?: string
          project_id?: string
          search_volume?: number | null
          target_position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_keywords_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          auto_publish: boolean | null
          content_score: number | null
          created_at: string | null
          id: string
          keywords: string[] | null
          last_published: string | null
          load_time: number | null
          meta_quality: string | null
          name: string
          seo_score: number | null
          updated_at: string | null
          user_id: string
          website_url: string
        }
        Insert: {
          auto_publish?: boolean | null
          content_score?: number | null
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          last_published?: string | null
          load_time?: number | null
          meta_quality?: string | null
          name: string
          seo_score?: number | null
          updated_at?: string | null
          user_id: string
          website_url: string
        }
        Update: {
          auto_publish?: boolean | null
          content_score?: number | null
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          last_published?: string | null
          load_time?: number | null
          meta_quality?: string | null
          name?: string
          seo_score?: number | null
          updated_at?: string | null
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      seo_metrics: {
        Row: {
          backlinks_count: number | null
          created_at: string | null
          date: string
          id: string
          organic_traffic: number | null
          project_id: string
          top_10_positions: number | null
          visibility_percentage: number | null
        }
        Insert: {
          backlinks_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          organic_traffic?: number | null
          project_id: string
          top_10_positions?: number | null
          visibility_percentage?: number | null
        }
        Update: {
          backlinks_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          organic_traffic?: number | null
          project_id?: string
          top_10_positions?: number | null
          visibility_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          created_at: string
          id: string
          pages_visited: number
          project_id: string
          status: string
          user_agent: string
          visit_duration: number
          visit_time: string
        }
        Insert: {
          created_at?: string
          id?: string
          pages_visited?: number
          project_id: string
          status?: string
          user_agent: string
          visit_duration?: number
          visit_time?: string
        }
        Update: {
          created_at?: string
          id?: string
          pages_visited?: number
          project_id?: string
          status?: string
          user_agent?: string
          visit_duration?: number
          visit_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_visits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      social_signals: {
        Row: {
          comments_count: number | null
          created_at: string | null
          id: string
          likes_count: number | null
          platform: string
          post_content: string | null
          post_url: string | null
          posted_at: string | null
          project_id: string
          shares_count: number | null
        }
        Insert: {
          comments_count?: number | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          platform: string
          post_content?: string | null
          post_url?: string | null
          posted_at?: string | null
          project_id: string
          shares_count?: number | null
        }
        Update: {
          comments_count?: number | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          platform?: string
          post_content?: string | null
          post_url?: string | null
          posted_at?: string | null
          project_id?: string
          shares_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_signals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          category: string
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          priority: string
          source: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          priority: string
          source?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string
          source?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      technical_audit: {
        Row: {
          audit_data: Json | null
          broken_links_count: number | null
          created_at: string | null
          h1_tags_count: number | null
          id: string
          images_without_alt: number | null
          meta_tags_score: number | null
          mobile_friendly: boolean | null
          page_speed_score: number | null
          project_id: string
          ssl_certificate: boolean | null
        }
        Insert: {
          audit_data?: Json | null
          broken_links_count?: number | null
          created_at?: string | null
          h1_tags_count?: number | null
          id?: string
          images_without_alt?: number | null
          meta_tags_score?: number | null
          mobile_friendly?: boolean | null
          page_speed_score?: number | null
          project_id: string
          ssl_certificate?: boolean | null
        }
        Update: {
          audit_data?: Json | null
          broken_links_count?: number | null
          created_at?: string | null
          h1_tags_count?: number | null
          id?: string
          images_without_alt?: number | null
          meta_tags_score?: number | null
          mobile_friendly?: boolean | null
          page_speed_score?: number | null
          project_id?: string
          ssl_certificate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_audit_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
          website_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          website_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          subscription_status: string | null
          subscription_tier: string | null
          telegram_chat_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          subscription_status?: string | null
          subscription_tier?: string | null
          telegram_chat_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          telegram_chat_id?: string | null
          updated_at?: string | null
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
