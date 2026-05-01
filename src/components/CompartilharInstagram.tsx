import { useState } from "react";
import { Download, Images, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { renderStoryPNG } from "@/lib/storyTemplate";
import {
  renderCarrosselZIP,
  carrosselFileName,
  storyFileName,
  type CarrosselSlides,
} from "@/lib/carrosselTemplate";
import { downloadBlob } from "@/lib/canvasUtils";

interface Props {
  id: string;
  data: string;
  titulo: string;
  versiculo: string;
  referencia: string;
  meditacao: string;
  hookCacheado?: string | null;
  carrosselCacheado?: CarrosselSlides | null;
  legendaCacheada?: string | null;
}

export const CompartilharInstagram = (props: Props) => {
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingCarrossel, setLoadingCarrossel] = useState(false);

  const baixarStory = async () => {
    setLoadingStory(true);
    try {
      let hook = props.hookCacheado ?? "";
      if (!hook) {
        const { data, error } = await supabase.functions.invoke("gerar-hook-devocional", {
          body: { devocional_id: props.id },
        });
        if (error) throw new Error(error.message || "Falha ao gerar o hook do Stories.");
        if ((data as any)?.error) throw new Error((data as any).error);
        hook = (data as any)?.hook;
        if (!hook) throw new Error("O servidor não retornou texto para o Stories.");
      }

      const blob = await renderStoryPNG({
        data: props.data,
        titulo: props.titulo,
        versiculo: props.versiculo,
        referencia: props.referencia,
        hook,
      });
      if (!blob) throw new Error("Falha ao gerar a imagem.");
      downloadBlob(blob, storyFileName(props.data, props.titulo));
      toast.success("Arte do Stories baixada!", {
        description: "Poste e marque @fontedealegriadiaria 🌅",
      });
    } catch (e: any) {
      console.error("[Stories] erro:", e);
      toast.error("Não foi possível gerar a arte", {
        description:
          typeof e?.message === "string" && e.message.includes("Failed to fetch")
            ? "Sem conexão com o servidor. Tente novamente."
            : e?.message || "Tente novamente em instantes.",
      });
    } finally {
      setLoadingStory(false);
    }
  };

  const baixarCarrossel = async () => {
    setLoadingCarrossel(true);
    try {
      let slides = props.carrosselCacheado ?? null;
      let legenda = props.legendaCacheada ?? "";
      if (!slides || !legenda) {
        const { data, error } = await supabase.functions.invoke(
          "gerar-carrossel-devocional",
          { body: { devocional_id: props.id } },
        );
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);
        slides = (data as any).slides as CarrosselSlides;
        legenda = (data as any).legenda as string;
      }

      const zip = await renderCarrosselZIP(slides, legenda, props.titulo);
      downloadBlob(zip, carrosselFileName(props.data, props.titulo));
      toast.success("Carrossel pronto!", {
        description: "ZIP baixado com 7 imagens + legenda.txt para colar no Instagram.",
      });
    } catch (e: any) {
      toast.error("Não foi possível gerar o carrossel", {
        description: e?.message || "Tente novamente em instantes.",
      });
    } finally {
      setLoadingCarrossel(false);
    }
  };

  return (
    <>
      <Button
        onClick={baixarStory}
        disabled={loadingStory}
        className="rounded-full bg-gradient-sunrise hover:opacity-90 text-white shadow-warm"
      >
        {loadingStory ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Baixar arte para Stories
      </Button>
      <Button
        onClick={baixarCarrossel}
        disabled={loadingCarrossel}
        variant="outline"
        className="rounded-full border-coral text-coral-deep hover:bg-coral/10"
      >
        {loadingCarrossel ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Images className="mr-2 h-4 w-4" />
        )}
        Gerar carrossel (7 slides)
      </Button>
    </>
  );
};