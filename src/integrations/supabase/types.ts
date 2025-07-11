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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cylinders: {
        Row: {
          capacity_kg: number
          created_at: string | null
          id: string
          last_hydrostatic_test: string | null
          location: Database["public"]["Enums"]["cylinder_location"]
          manufacture_date: string | null
          next_hydrostatic_test: string | null
          serial_number: string
          state: Database["public"]["Enums"]["cylinder_state"]
          updated_at: string | null
          valve_type: Database["public"]["Enums"]["valve_type"]
        }
        Insert: {
          capacity_kg: number
          created_at?: string | null
          id?: string
          last_hydrostatic_test?: string | null
          location?: Database["public"]["Enums"]["cylinder_location"]
          manufacture_date?: string | null
          next_hydrostatic_test?: string | null
          serial_number: string
          state?: Database["public"]["Enums"]["cylinder_state"]
          updated_at?: string | null
          valve_type?: Database["public"]["Enums"]["valve_type"]
        }
        Update: {
          capacity_kg?: number
          created_at?: string | null
          id?: string
          last_hydrostatic_test?: string | null
          location?: Database["public"]["Enums"]["cylinder_location"]
          manufacture_date?: string | null
          next_hydrostatic_test?: string | null
          serial_number?: string
          state?: Database["public"]["Enums"]["cylinder_state"]
          updated_at?: string | null
          valve_type?: Database["public"]["Enums"]["valve_type"]
        }
        Relationships: []
      }
      fillings: {
        Row: {
          amount_kg: number
          created_at: string | null
          cylinder_id: string
          date_time: string | null
          id: string
          operator: string
          rejection_reason: string | null
          status: string
        }
        Insert: {
          amount_kg: number
          created_at?: string | null
          cylinder_id: string
          date_time?: string | null
          id?: string
          operator: string
          rejection_reason?: string | null
          status: string
        }
        Update: {
          amount_kg?: number
          created_at?: string | null
          cylinder_id?: string
          date_time?: string | null
          id?: string
          operator?: string
          rejection_reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fillings_cylinder_id_fkey"
            columns: ["cylinder_id"]
            isOneToOne: false
            referencedRelation: "cylinders"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          cost: number | null
          created_at: string | null
          cylinder_id: string
          date_performed: string
          description: string
          id: string
          maintenance_type: string
          next_maintenance_date: string | null
          notes: string | null
          parts_replaced: string | null
          status: string
          technician: string
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          cylinder_id: string
          date_performed?: string
          description: string
          id?: string
          maintenance_type: string
          next_maintenance_date?: string | null
          notes?: string | null
          parts_replaced?: string | null
          status?: string
          technician: string
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          cylinder_id?: string
          date_performed?: string
          description?: string
          id?: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          notes?: string | null
          parts_replaced?: string | null
          status?: string
          technician?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_cylinder_id_fkey"
            columns: ["cylinder_id"]
            isOneToOne: false
            referencedRelation: "cylinders"
            referencedColumns: ["id"]
          },
        ]
      }
      tank_inventory: {
        Row: {
          capacity_kg: number
          current_level_kg: number
          id: string
          last_updated: string | null
          notes: string | null
          operator: string | null
        }
        Insert: {
          capacity_kg?: number
          current_level_kg?: number
          id?: string
          last_updated?: string | null
          notes?: string | null
          operator?: string | null
        }
        Update: {
          capacity_kg?: number
          current_level_kg?: number
          id?: string
          last_updated?: string | null
          notes?: string | null
          operator?: string | null
        }
        Relationships: []
      }
      tank_movements: {
        Row: {
          amount_kg: number
          created_at: string | null
          date_time: string | null
          id: string
          movement_type: string
          notes: string | null
          operator: string
          supplier: string | null
        }
        Insert: {
          amount_kg: number
          created_at?: string | null
          date_time?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          operator: string
          supplier?: string | null
        }
        Update: {
          amount_kg?: number
          created_at?: string | null
          date_time?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          operator?: string
          supplier?: string | null
        }
        Relationships: []
      }
      transfers: {
        Row: {
          created_at: string | null
          cylinder_id: string
          date_time: string | null
          from_location: Database["public"]["Enums"]["cylinder_location"]
          id: string
          notes: string | null
          operator: string
          to_location: Database["public"]["Enums"]["cylinder_location"]
        }
        Insert: {
          created_at?: string | null
          cylinder_id: string
          date_time?: string | null
          from_location: Database["public"]["Enums"]["cylinder_location"]
          id?: string
          notes?: string | null
          operator: string
          to_location: Database["public"]["Enums"]["cylinder_location"]
        }
        Update: {
          created_at?: string | null
          cylinder_id?: string
          date_time?: string | null
          from_location?: Database["public"]["Enums"]["cylinder_location"]
          id?: string
          notes?: string | null
          operator?: string
          to_location?: Database["public"]["Enums"]["cylinder_location"]
        }
        Relationships: [
          {
            foreignKeyName: "transfers_cylinder_id_fkey"
            columns: ["cylinder_id"]
            isOneToOne: false
            referencedRelation: "cylinders"
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
      cylinder_location:
        | "dispatch"
        | "filling_station"
        | "maintenance"
        | "out_of_service"
      cylinder_state:
        | "empty"
        | "full"
        | "filling"
        | "maintenance"
        | "out_of_service"
      transfer_direction: "filling_to_dispatch" | "dispatch_to_filling"
      valve_type: "standard" | "safety" | "pressure_relief"
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
      cylinder_location: [
        "dispatch",
        "filling_station",
        "maintenance",
        "out_of_service",
      ],
      cylinder_state: [
        "empty",
        "full",
        "filling",
        "maintenance",
        "out_of_service",
      ],
      transfer_direction: ["filling_to_dispatch", "dispatch_to_filling"],
      valve_type: ["standard", "safety", "pressure_relief"],
    },
  },
} as const
