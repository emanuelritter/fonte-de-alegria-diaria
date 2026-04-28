import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, Sparkles, Instagram } from "lucide-react";
import heroImg from "@/assets/hero-sunrise.jpg";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/Layout/PageShell";
import { CtaFunil } from "@/components/CtaFunil";
import { HistoriasCarrossel } from "@/components/HistoriasCarrossel";
import { useDevocionalHoje } from "@/hooks/useDevocional";
import { SEO } from "@/components/SEO";

const Index = () => {
  const { data: devocional } = useDevocionalHoje();

  return (
    <PageShell>
      <SEO
        title="Devocional diário cristão"
        description="Leituras diárias para nutrir sua fé, compartilhar histórias e encontrar alegria em Deus todos os dias."
      />
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <img
          src={heroImg}
          alt="Sol nascente sobre as águas"
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/95" />

        <div className="container relative z-10 pb-20 md:pb-28">
          <div className="max-w-3xl animate-fade-in-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/85 backdrop-blur px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-coral-deep mb-6 shadow-soft">
              <Sparkles className="h-3.5 w-3.5" />
              Devocional diário
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-white drop-shadow-lg">
              <span className="italic font-medium">fonte de</span>
              <br />
              <span className="font-bold">alegria</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/95 max-w-xl drop-shadow-md leading-relaxed">
              Uma pausa diária para encontrar Cristo no meio da correria.
              Comunhão, esperança e graça — uma meditação por vez.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-coral hover:bg-coral-deep text-white shadow-warm h-12 px-7">
                <Link to="/devocional">
                  Leia o devocional de hoje <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-white/10 backdrop-blur border-white/40 text-white hover:bg-white hover:text-primary h-12 px-7">
                <a href="https://www.instagram.com/fontedealegriadiaria/" target="_blank" rel="noreferrer">
                  <Instagram className="mr-2 h-4 w-4" /> Siga nas redes
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* DEVOCIONAL DE HOJE */}
      <section className="container py-20">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <p className="uppercase tracking-[0.25em] text-xs text-coral-deep font-semibold mb-3">
              Hoje
            </p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-5">
              Beba da <span className="italic text-gradient-warm">fonte</span> antes do mundo te chamar.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Cada manhã uma meditação curta — para você respirar, abrir a Bíblia
              e lembrar quem você é em Cristo.
            </p>
            <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary-glow shadow-deep h-12 px-7">
              <Link to="/devocional">
                <BookOpenCheck className="mr-2 h-4 w-4" />
                Abrir devocional
              </Link>
            </Button>
          </div>

          <div className="lg:col-span-3">
            <article className="bg-card rounded-3xl p-8 md:p-10 shadow-deep border border-border/50 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-warm opacity-20 blur-3xl" />
              {devocional ? (
                <div className="relative">
                  <p className="text-xs uppercase tracking-widest text-coral-deep font-semibold mb-3">
                    {new Date(devocional.data + "T00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                  </p>
                  <h3 className="font-serif text-3xl md:text-4xl mb-4 leading-tight">
                    {devocional.titulo}
                  </h3>
                  <blockquote className="border-l-4 border-coral pl-4 italic text-foreground/80 mb-5">
                    "{devocional.versiculo}"
                    <footer className="text-xs not-italic mt-1 text-muted-foreground">
                      — {devocional.referencia}
                    </footer>
                  </blockquote>
                  <p className="text-foreground/85 leading-relaxed line-clamp-5 mb-6">
                    {devocional.meditacao}
                  </p>
                  <Link
                    to={`/devocional/${devocional.data}`}
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all"
                  >
                    Ler completo <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="relative text-center py-10">
                  <p className="font-serif text-2xl mb-2">Em breve, sua meditação diária.</p>
                  <p className="text-muted-foreground">
                    Os devocionais começarão a ser publicados muito em breve.
                    Enquanto isso, comece um plano de leitura bíblica.
                  </p>
                </div>
              )}
            </article>
          </div>
        </div>
      </section>

      {/* FUNIL */}
      <section className="bg-secondary/40 py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="uppercase tracking-[0.25em] text-xs text-coral-deep font-semibold mb-3">
              Próximos passos
            </p>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
              Uma jornada, <span className="italic text-gradient-warm">três passos</span>.
            </h2>
            <p className="text-muted-foreground text-lg">
              Da primeira oração ao encontro com a comunidade — caminhe no seu tempo.
            </p>
          </div>
          <CtaFunil />
        </div>
      </section>

      {/* HISTÓRIAS */}
      <HistoriasCarrossel />
    </PageShell>
  );
};

export default Index;
