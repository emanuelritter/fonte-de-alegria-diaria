import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, Calendar, Instagram } from "lucide-react";
import { PageShell } from "@/components/Layout/PageShell";
import { Button } from "@/components/ui/button";
import { CtaFunil } from "@/components/CtaFunil";
import { useDevocionalHoje, useDevocionalPorData, useArquivoDevocionais } from "@/hooks/useDevocional";
import { toast } from "sonner";
import { CompartilharInstagram } from "@/components/CompartilharInstagram";
import { SEO } from "@/components/SEO";

const formatDate = (s: string) =>
  new Date(s + "T00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const Devocional = () => {
  const { data: dataParam } = useParams<{ data?: string }>();
  const hoje = useDevocionalHoje();
  const porData = useDevocionalPorData(dataParam);
  const arquivo = useArquivoDevocionais();

  const dev = dataParam ? porData.data : hoje.data;
  const loading = (dataParam ? porData.isLoading : hoje.isLoading);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: dev?.titulo, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  return (
    <PageShell>
      <SEO
        title={dev?.titulo ?? "Devocional do dia"}
        description={
          dev?.meditacao
            ? dev.meditacao.replace(/<[^>]+>/g, "").slice(0, 155) + "..."
            : "Leitura devocional diária."
        }
        type="article"
        url={dev?.data ? `https://fontedealegria.com.br/devocional/${dev.data}` : undefined}
      />
      <section className="bg-gradient-sunrise text-white pb-20">
        <div className="container pt-12">
          <Link to="/devocional" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-6">
            <ArrowLeft className="h-4 w-4" /> Devocional
          </Link>

          {loading && <div className="py-32 text-center text-white/70">Carregando…</div>}

          {!loading && !dev && (
            <div className="py-24 text-center">
              <h1 className="font-serif text-4xl mb-3">Sem devocional para esta data</h1>
              <p className="text-white/80">Volte em breve — novas meditações são publicadas todos os dias.</p>
            </div>
          )}

          {dev && (
            <article className="max-w-3xl mx-auto animate-fade-in-up">
              <p className="uppercase tracking-[0.3em] text-xs font-semibold text-white/85 mb-4 flex items-center gap-2 justify-center">
                <Calendar className="h-3 w-3" />
                {formatDate(dev.data)}
              </p>
              <h1 className="font-serif text-4xl md:text-6xl text-center leading-[1.05] mb-8">
                {dev.titulo}
              </h1>
              <blockquote className="bg-white/15 backdrop-blur-md rounded-2xl p-6 md:p-8 italic text-lg md:text-xl text-center font-serif border border-white/20 shadow-deep">
                "{dev.versiculo}"
                <footer className="not-italic text-sm mt-3 font-sans text-white/80">— {dev.referencia}</footer>
              </blockquote>
            </article>
          )}
        </div>
      </section>

      {dev && (
        <section className="container -mt-12 relative z-10 pb-16">
          <div className="max-w-3xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-deep border border-border/50">
            <div className="prose prose-lg max-w-none font-serif text-foreground/90 leading-relaxed whitespace-pre-line">
              {dev.meditacao}
            </div>

            {dev.oracao && (
              <div className="mt-10 p-6 rounded-2xl bg-secondary/60 border-l-4 border-coral">
                <p className="uppercase tracking-widest text-xs font-semibold text-coral-deep mb-3">Oração</p>
                <p className="font-serif italic text-lg leading-relaxed text-foreground/85 whitespace-pre-line">
                  {dev.oracao}
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-3 pt-6 border-t border-border">
              <CompartilharInstagram
                id={dev.id}
                data={dev.data}
                titulo={dev.titulo}
                versiculo={dev.versiculo}
                referencia={dev.referencia}
                meditacao={dev.meditacao}
                hookCacheado={dev.hook_stories}
                carrosselCacheado={dev.carrossel_textos as any}
                legendaCacheada={dev.carrossel_legenda}
              />
              <Button onClick={share} variant="outline" className="rounded-full">
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar
              </Button>
              {dev.post_url && (
                <Button asChild variant="outline" className="rounded-full">
                  <a href={dev.post_url} target="_blank" rel="noreferrer">
                    <Instagram className="mr-2 h-4 w-4" /> Ver post das redes
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="font-serif text-3xl mb-6 text-center">Continue caminhando</h2>
            <CtaFunil nivel={dev.cta_nivel} />
          </div>
        </section>
      )}

      {/* Arquivo */}
      {arquivo.data && arquivo.data.length > 0 && (
        <section className="container py-16 border-t border-border">
          <h2 className="font-serif text-3xl mb-8">Devocionais anteriores</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {arquivo.data.map((d) => (
              <Link
                key={d.id}
                to={`/devocional/${d.data}`}
                className="block bg-card rounded-2xl p-6 border border-border/50 hover:shadow-warm hover:-translate-y-1 transition-all"
              >
                <p className="text-xs uppercase tracking-widest text-coral-deep font-semibold mb-2">
                  {formatDate(d.data)}
                </p>
                <h3 className="font-serif text-xl mb-1">{d.titulo}</h3>
                <p className="text-sm text-muted-foreground italic line-clamp-1">{d.referencia}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
};

export default Devocional;