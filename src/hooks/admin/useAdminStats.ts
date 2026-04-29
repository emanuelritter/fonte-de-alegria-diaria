import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OverviewStats = {
  devocional_hoje: { existe: boolean; publicado: boolean; titulo: string | null; id: string | null };
  proximos_7_dias: { preenchidos: number; publicados: number };
  devocionais_total: number;
  devocionais_rascunho: number;
  historias_pendentes: number;
  historias_total: number;
  oracao_pendentes: number;
  oracao_total: number;
  leads_pendentes: number;
  usuarios_total: number;
  admins_total: number;
  fonte_traduzidos: number;
  fonte_pendentes: number;
  plano_total: number;
};

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin", "overview-stats"],
    queryFn: async (): Promise<OverviewStats> => {
      const { data, error } = await supabase.rpc("admin_overview_stats");
      if (error) throw error;
      return data as unknown as OverviewStats;
    },
    staleTime: 30_000,
  });