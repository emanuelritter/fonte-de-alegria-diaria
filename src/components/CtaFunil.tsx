import { Link } from "react-router-dom";
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

export const CtaFunil = ({ nivel }: { nivel?: number }) => {
  const ordered = nivel ? [...ctas].sort((a, b) => {
    const order = nivel === 1 ? [0,1,2] : nivel === 2 ? [1,0,2] : [2,1,0];
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