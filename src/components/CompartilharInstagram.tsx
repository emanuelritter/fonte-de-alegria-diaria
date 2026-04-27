import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  titulo: string;
  versiculo: string;
  referencia: string;
  meditacao: string;
  oracao?: string | null;
}

const HANDLE = "@fontedealegriadiaria";
const PROFILE_URL = "https://www.instagram.com/fontedealegriadiaria";

const buildText = (p: Props) => {
  const med = p.meditacao.length > 280
    ? p.meditacao.slice(0, 280).trimEnd() + "…"
    : p.meditacao;
  const partes = [
    `📖 ${p.titulo}`,
    "",
    `"${p.versiculo}"`,
    `— ${p.referencia}`,
    "",
    med,
  ];
  if (p.oracao) {
    partes.push("", `🙏 ${p.oracao}`);
  }
  partes.push("", `✨ Devocional do dia em fontedealegria.com`, HANDLE);
  return partes.join("\n");
};

const isMobile = () =>
  typeof navigator !== "undefined" &&
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const CompartilharInstagram = (props: Props) => {
  const handle = async () => {
    const text = buildText(props);
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      // sem clipboard, segue
    }

    // Web Share API (mobile moderno) — tenta primeiro
    if (isMobile() && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: props.titulo,
          text,
        });
        return;
      } catch {
        // usuário cancelou ou não suportou — segue para fallback
      }
    }

    if (copied) {
      toast.success("Texto copiado!", {
        description: "Cole no seu story marcando @fontedealegriadiaria 🌅",
        duration: 5000,
      });
    } else {
      toast.info("Abrindo Instagram", {
        description: "Marque @fontedealegriadiaria no seu story.",
      });
    }

    // Tenta abrir o app nativo no mobile, senão o perfil web
    if (isMobile()) {
      window.location.href = "instagram://story-camera";
      // fallback se app não estiver instalado
      setTimeout(() => {
        window.open(PROFILE_URL, "_blank");
      }, 800);
    } else {
      window.open(PROFILE_URL, "_blank");
    }
  };

  return (
    <Button
      onClick={handle}
      className="rounded-full bg-gradient-sunrise hover:opacity-90 text-white shadow-warm"
    >
      <Instagram className="mr-2 h-4 w-4" />
      Compartilhar no Stories
    </Button>
  );
};