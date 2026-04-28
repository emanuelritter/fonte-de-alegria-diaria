import { PageShell } from "@/components/Layout/PageShell";
import { Button } from "@/components/ui/button";
import { Church, Tv, Users, MapPin, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

const Conecte = () => (
  <PageShell>
    <SEO
      title="Conecte-se"
      description="Conheça a IASD Central de Indaiatuba ou estude com a Rede Novo Tempo. Dê o próximo passo na sua fé."
    />
    <section className="bg-gradient-cover text-white py-24">
      <div className="container max-w-3xl text-center">
        <p className="uppercase tracking-[0.3em] text-xs font-semibold text-white/85 mb-3">Conecte-se</p>
        <h1 className="font-serif text-5xl md:text-6xl leading-tight">
          Caminhar com Deus é também caminhar <span className="italic">junto</span>.
        </h1>
      </div>
    </section>

    <section className="container py-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Igreja local */}
      <article className="bg-card rounded-3xl p-8 shadow-soft border border-border/50 hover:shadow-warm transition-all">
        <div className="h-12 w-12 rounded-full bg-gradient-deep text-white flex items-center justify-center mb-5">
          <Church className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl mb-2">IASD Central de Indaiatuba</h2>
        <p className="text-muted-foreground text-sm mb-5">
          Uma comunidade de fé no coração de Indaiatuba, SP. Você é bem-vindo como é.
        </p>
        <ul className="space-y-2 text-sm mb-6">
          <li className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" />
            <span>Rua Ademar de Barros, 1498 — Cidade Nova I, Indaiatuba SP</span>
          </li>
          <li className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" />
            <span>Sábado 9h30 (Escola Sabatina) e 11h (Culto Divino)</span>
          </li>
        </ul>
        <Button asChild variant="outline" className="rounded-full w-full">
          <a href="https://www.instagram.com/iasdcentralindaiatuba/" target="_blank" rel="noreferrer">
            Ver no Instagram <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </article>

      {/* TV Novo Tempo */}
      <article className="bg-card rounded-3xl p-8 shadow-soft border border-border/50 hover:shadow-warm transition-all">
        <div className="h-12 w-12 rounded-full bg-gradient-warm text-white flex items-center justify-center mb-5">
          <Tv className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl mb-2">Rede Novo Tempo</h2>
        <p className="text-muted-foreground text-sm mb-5">
          Estudos bíblicos online e programação cristã para todo o Brasil.
        </p>
        <ul className="space-y-2 text-sm mb-6">
          <li>• Estudos bíblicos gratuitos online</li>
          <li>• Programação 24h com conteúdo cristão</li>
          <li>• Materiais para toda a família</li>
        </ul>
        <Button asChild className="rounded-full w-full bg-coral hover:bg-coral-deep text-white">
          <a href="https://www.novotempo.com" target="_blank" rel="noreferrer">
            Acessar Novo Tempo <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </article>

      {/* Pequenos grupos */}
      <article className="bg-card rounded-3xl p-8 shadow-soft border border-border/50 hover:shadow-warm transition-all md:col-span-2 lg:col-span-1">
        <div className="h-12 w-12 rounded-full bg-sand text-foreground flex items-center justify-center mb-5">
          <Users className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl mb-2">Pequenos Grupos</h2>
        <p className="text-muted-foreground text-sm mb-5">
          Grupos de estudo e comunhão para aprofundar a fé em ambiente íntimo.
        </p>
        <ul className="space-y-2 text-sm mb-6">
          <li>• Encontros semanais em Indaiatuba</li>
          <li>• Grupos para diferentes faixas etárias</li>
          <li>• Contato próximo e oração em grupo</li>
        </ul>
        <Button asChild variant="outline" className="rounded-full w-full">
          <Link to="/oracao">Quero participar</Link>
        </Button>
      </article>
    </section>
  </PageShell>
);

export default Conecte;