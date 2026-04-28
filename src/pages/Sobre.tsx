import { PageShell } from "@/components/Layout/PageShell";
import { SEO } from "@/components/SEO";

const Sobre = () => (
  <PageShell>
    <SEO
      title="Sobre o projeto"
      description="Fonte de Alegria é um projeto devocional cristão adventista criado para levar esperança diária através da Palavra."
    />
    <section className="container py-20 max-w-3xl">
      <p className="uppercase tracking-[0.3em] text-xs font-semibold text-coral-deep mb-3">Sobre o projeto</p>
      <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-8">
        Pregar Cristo, no <span className="italic text-gradient-warm">ritmo</span> da vida real.
      </h1>

      <div className="prose prose-lg max-w-none font-serif text-foreground/85 leading-relaxed space-y-5">
        <p>
          O <strong>Fonte de Alegria</strong> é um projeto devocional cristão independente,
          inspirado na Bíblia, no devocional <em>Devocional Diário</em> publicado pela
          Casa Publicadora Brasileira (CPB) e nos princípios da Igreja Adventista do Sétimo Dia.
        </p>
        <p>
          A cada dia, uma meditação curta é compartilhada nas redes sociais como um "gancho"
          que convida pessoas no meio da correria a pausarem, lerem e passarem tempo com Deus.
          O objetivo é simples: pregar o evangelho e conduzir vidas a um relacionamento
          profundo e duradouro com Cristo.
        </p>
      </div>

      <h2 className="font-serif text-3xl mt-14 mb-4">Declaração pastoral</h2>
      <p className="text-foreground/80 leading-relaxed">
        Buscamos conduzir pessoas à Bíblia, à oração, à comunhão com Deus e à vida na igreja local.
        Reconhecemos a autoridade da Bíblia como regra suprema de fé e prática.
      </p>

      <h2 className="font-serif text-3xl mt-14 mb-4">Termos de uso</h2>
      <ul className="space-y-3 text-foreground/80 leading-relaxed list-disc pl-5">
        <li>O conteúdo não substitui aconselhamento pastoral, psicológico, médico ou profissional.</li>
        <li>Não prometemos milagres, curas ou prosperidade financeira. Toda experiência espiritual é pessoal e soberana a Deus.</li>
        <li>Os devocionais são para uso pessoal e espiritual. É proibida a comercialização sem autorização.</li>
        <li>Pedidos de oração são tratados com sigilo e cuidado pastoral.</li>
        <li>Ao usar este site, você declara ciência e concordância com estes termos.</li>
      </ul>

      <h2 className="font-serif text-3xl mt-14 mb-4">Créditos</h2>
      <p className="text-foreground/80 leading-relaxed">
        Inspirado em <em>Devocional Diário</em> de Ellen G. White (Casa Publicadora Brasileira).
        Este é um projeto independente, sem fins lucrativos.
      </p>
    </section>
  </PageShell>
);

export default Sobre;