import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Devocional = {
  id: string;
  data: string;
  titulo: string;
  versiculo: string;
  referencia: string;
  meditacao: string;
  oracao: string | null;
  post_url: string | null;
  cta_nivel: number;
  publicado: boolean;
  hook_stories?: string | null;
  carrossel_textos?: any | null;
  carrossel_legenda?: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);

export const useDevocionalHoje = () =>
  useQuery({
    queryKey: ["devocional", "hoje"],
    queryFn: async (): Promise<Devocional | null> => {
      const { data, error } = await supabase
        .from("devocionais")
        .select("*")
        .eq("publicado", true)
        .lte("data", today())
        .order("data", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Devocional | null;
    },
  });

export const useDevocionalPorData = (data?: string) =>
  useQuery({
    queryKey: ["devocional", data],
    enabled: !!data,
    queryFn: async (): Promise<Devocional | null> => {
      const { data: row, error } = await supabase
        .from("devocionais")
        .select("*")
        .eq("data", data!)
        .eq("publicado", true)
        .lte("data", today())
        .maybeSingle();
      if (error) throw error;
      return row as Devocional | null;
    },
  });

export const useArquivoDevocionais = () =>
  useQuery({
    queryKey: ["devocionais", "arquivo"],
    queryFn: async (): Promise<Devocional[]> => {
      const { data, error } = await supabase
        .from("devocionais")
        .select("*")
        .eq("publicado", true)
        .lte("data", today())
        .order("data", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as Devocional[];
    },
  });