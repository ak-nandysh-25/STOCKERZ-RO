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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      emi_plans: {
        Row: {
          created_at: string
          customer_name: string
          down_payment: number
          id: string
          model: string
          phone: string | null
          shop_id: string
          start_date: string
          tenure_months: number
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_name: string
          down_payment?: number
          id?: string
          model: string
          phone?: string | null
          shop_id: string
          start_date?: string
          tenure_months: number
          total_amount: number
        }
        Update: {
          created_at?: string
          customer_name?: string
          down_payment?: number
          id?: string
          model?: string
          phone?: string | null
          shop_id?: string
          start_date?: string
          tenure_months?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "emi_plans_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          id: string
          low_stock_threshold: number
          model: string
          price: number
          product_type: string | null
          qty: number
          shop_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          low_stock_threshold?: number
          model: string
          price?: number
          product_type?: string | null
          qty?: number
          shop_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          low_stock_threshold?: number
          model?: string
          price?: number
          product_type?: string | null
          qty?: number
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          address: string | null
          created_at: string
          customer_name: string | null
          id: string
          phone: string | null
          price: number
          product_id: string | null
          product_name: string
          product_type: string | null
          qty: number
          sale_date: string
          shop_id: string
          source: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          phone?: string | null
          price?: number
          product_id?: string | null
          product_name: string
          product_type?: string | null
          qty?: number
          sale_date?: string
          shop_id: string
          source: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          phone?: string | null
          price?: number
          product_id?: string | null
          product_name?: string
          product_type?: string | null
          qty?: number
          sale_date?: string
          shop_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      service_items: {
        Row: {
          id: string
          price: number
          product_name: string
          service_id: string
          shop_id: string
        }
        Insert: {
          id?: string
          price?: number
          product_name: string
          service_id: string
          shop_id: string
        }
        Update: {
          id?: string
          price?: number
          product_name?: string
          service_id?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          address: string | null
          created_at: string
          customer_name: string
          id: string
          is_filter_change: boolean
          next_service_date: string | null
          phone: string | null
          service_date: string
          service_type: string
          shop_id: string
          technician_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_name: string
          id?: string
          is_filter_change?: boolean
          next_service_date?: string | null
          phone?: string | null
          service_date?: string
          service_type: string
          shop_id: string
          technician_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          is_filter_change?: boolean
          next_service_date?: string | null
          phone?: string | null
          service_date?: string
          service_type?: string
          shop_id?: string
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          email: string | null
          gst: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          gst?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          gst?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          shop_id: string
          specialization: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          shop_id: string
          specialization?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          shop_id?: string
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
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
      admin_create_shop: {
        Args: {
          _name: string
          _email: string
          _password?: string
          _contact?: string | null
          _gst?: string | null
          _address?: string | null
          _logo_url?: string | null
        }
        Returns: string
      }
      current_shop_id: { Args: never; Returns: string }
      delete_shop_and_user: {
        Args: {
          _shop_id: string
        }
        Returns: void
      }
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
    },
  },
} as const
