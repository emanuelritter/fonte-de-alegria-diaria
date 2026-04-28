import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen, Tv, Church, ArrowRight } from "lucide-react";

type Cta = {
  icon: typeof BookOpen;
  title: string;
  desc: string;
  href: string;
  external?: boolean;
  tone: "coral" | "sand" | "primary";
};

const ctas: Cta[] = [
  {
    icon: BookOpen,
    title: "Ore e leia a Bíblia",
    desc: "Comece pequeno: cinco minutos com Deus já mudam o seu dia.",
    href: "/plano-de-leitura",
    tone: "coral",
  },
  {
    icon: Tv,
    title: "Estude com a Novo Tempo",
    desc: "Estudos bíblicos online, programas e conteúdos para aprofundar a fé.",
    href: "https://www.novotempo.com",
    external: true,
    tone: "sand",
  },
  {
    icon: Church,
    title: "Caminhe em comunhão",
    desc: "Conheça a IASD Central de Indaiatuba e nossos pequenos grupos.",
    href: "/conecte-se",
    tone: "primary",
  },
];

const toneClasses: Record<Cta["tone"], string> = {
  coral: "bg-gradient-warm text-white",
  sand: "bg-sand text-foreground",
  primary: "bg-gradient-deep text-white",
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const CtaFunil = ({ nivel }: { nivel?: number }) => {
  const [autoNivel, setAutoNivel] = useState<number>(2);

  useEffect(() => {
    if (nivel) return; // prop wins
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversineKm(pos.coords.latitude, pos.coords.longitude, -23.0896, -47.2183);
        setAutoNivel(dist <= 80 ? 1 : 2);
      },
      () => {
        // denied/unavailable: keep default 2, no UI error
      },
      { timeout: 8000, maximumAge: 600000 }
    );
  }, [nivel]);

  const effectiveNivel = nivel ?? autoNivel;
  const ordered = effectiveNivel ? [...ctas].sort((a, b) => {
    const order = effectiveNivel === 1 ? [0,1,2] : effectiveNivel === 2 ? [1,0,2] : [2,1,0];
    return order.indexOf(ctas.indexOf(a)) - order.indexOf(ctas.indexOf(b));
  }) : ctas;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {ordered.map((c) => {
        const Icon = c.icon;
        const inner = (
          <div className={`h-full rounded-2xl p-8 ${toneClasses[c.tone]} shadow-soft hover:shadow-warm transition-all duration-300 group hover:-translate-y-1`}>
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-5">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl mb-2 leading-tight">{c.title}</h3>
            <p className="text-sm opacity-90 mb-6">{c.desc}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
              Entrar <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        );
        return c.external ? (
          <a key={c.title} href={c.href} target="_blank" rel="noreferrer">{inner}</a>
        ) : (
          <Link key={c.title} to={c.href}>{inner}</Link>
        );
      })}
    </div>
  );
};