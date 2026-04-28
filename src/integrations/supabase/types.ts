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
      devocionais: {
        Row: {
          carrossel_legenda: string | null
          carrossel_textos: Json | null
          created_at: string
          cta_nivel: number
          data: string
          hook_stories: string | null
          id: string
          meditacao: string
          oracao: string | null
          post_url: string | null
          publicado: boolean
          referencia: string
          titulo: string
          updated_at: string
          versiculo: string
        }
        Insert: {
          carrossel_legenda?: string | null
          carrossel_textos?: Json | null
          created_at?: string
          cta_nivel?: number
          data: string
          hook_stories?: string | null
          id?: string
          meditacao: string
          oracao?: string | null
          post_url?: string | null
          publicado?: boolean
          referencia: string
          titulo: string
          updated_at?: string
          versiculo: string
        }
        Update: {
          carrossel_legenda?: string | null
          carrossel_textos?: Json | null
          created_at?: string
          cta_nivel?: number
          data?: string
          hook_stories?: string | null
          id?: string
          meditacao?: string
          oracao?: string | null
          post_url?: string | null
          publicado?: boolean
          referencia?: string
          titulo?: string
          updated_at?: string
          versiculo?: string
        }
        Relationships: []
      }
      devocionais_fonte: {
        Row: {
          created_at: string
          data: string
          erro: string | null
          id: string
          meditacao: string
          referencia: string
          titulo: string
          traduzido: boolean
          updated_at: string
          versiculo: string
        }
        Insert: {
          created_at?: string
          data: string
          erro?: string | null
          id?: string
          meditacao: string
          referencia?: string
          titulo: string
          traduzido?: boolean
          updated_at?: string
          versiculo: string
        }
        Update: {
          created_at?: string
          data?: string
          erro?: string | null
          id?: string
          meditacao?: string
          referencia?: string
          titulo?: string
          traduzido?: boolean
          updated_at?: string
          versiculo?: string
        }
        Relationships: []
      }
      historias: {
        Row: {
          cidade: string | null
          consentimento: boolean
          contato: string | null
          created_at: string
          depoimento: string
          destaque: boolean
          encaminhado_em: string | null
          id: string
          interesse_contato: boolean
          nome: string
          status: Database["public"]["Enums"]["historia_status"]
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          consentimento?: boolean
          contato?: string | null
          created_at?: string
          depoimento: string
          destaque?: boolean
          encaminhado_em?: string | null
          id?: string
          interesse_contato?: boolean
          nome: string
          status?: Database["public"]["Enums"]["historia_status"]
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          consentimento?: boolean
          contato?: string | null
          created_at?: string
          depoimento?: string
          destaque?: boolean
          encaminhado_em?: string | null
          id?: string
          interesse_contato?: boolean
          nome?: string
          status?: Database["public"]["Enums"]["historia_status"]
          updated_at?: string
        }
        Relationships: []
      }
      pedidos_oracao: {
        Row: {
          anonimo: boolean
          atendido: boolean
          contato: string | null
          created_at: string
          encaminhado_em: string | null
          id: string
          interesse_contato: boolean
          nome: string | null
          pedido: string
        }
        Insert: {
          anonimo?: boolean
          atendido?: boolean
          contato?: string | null
          created_at?: string
          encaminhado_em?: string | null
          id?: string
          interesse_contato?: boolean
          nome?: string | null
          pedido: string
        }
        Update: {
          anonimo?: boolean
          atendido?: boolean
          contato?: string | null
          created_at?: string
          encaminhado_em?: string | null
          id?: string
          interesse_contato?: boolean
          nome?: string | null
          pedido?: string
        }
        Relationships: []
      }
      plano_leitura: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          id: string
          referencia: string
          titulo: string
        }
        Insert: {
          created_at?: string
          data: string
          descricao?: string | null
          id?: string
          referencia: string
          titulo: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          referencia?: string
          titulo?: string
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
      admin_list_historias: {
        Args: never
        Returns: {
          cidade: string | null
          consentimento: boolean
          contato: string | null
          created_at: string
          depoimento: string
          destaque: boolean
          encaminhado_em: string | null
          id: string
          interesse_contato: boolean
          nome: string
          status: Database["public"]["Enums"]["historia_status"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "historias"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          is_admin: boolean
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_current_user_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      historia_status: "pendente" | "aprovada" | "rejeitada"
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
      historia_status: ["pendente", "aprovada", "rejeitada"],
    },
  },
} as const
