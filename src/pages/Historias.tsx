import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Quote, Plus } from "lucide-react";
import { PageShell } from "@/components/Layout/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Historia = { id: string; nome: string; cidade: string | null; depoimento: string };

const Historias = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["historias", "todas"],
    queryFn: async (): Promise<Historia[]> => {
      const { data, error } = await supabase
        .from("historias")
        .select("id, nome, cidade, depoimento")
        .eq("status", "aprovada")
        .order("destaque", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Historia[];
    },
  });

  return (
    <PageShell>
      <section className="bg-gradient-warm text-white py-20">
        <div className="container max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-white/85 mb-3">
            Histórias de alegria
          </p>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-4">
            O que Deus <span className="italic">muda</span> quando passamos tempo com Ele.
          </h1>
          <p className="text-white/90 text-lg max-w-xl mb-8">
            Depoimentos de pessoas que encontraram esperança, paz e propósito em Cristo.
          </p>
          <Button asChild size="lg" className="rounded-full bg-white text-coral-deep hover:bg-white/90 h-12 px-7 shadow-deep">
            <Link to="/compartilhar">
              <Plus className="mr-2 h-4 w-4" /> Compartilhe a sua história
            </Link>
          </Button>
        </div>
      </section>

      <section className="container py-16">
        {isLoading && <p className="text-muted-foreground">Carregando…</p>}
        {!isLoading && (!data || data.length === 0) && (
          <div className="text-center py-16 bg-secondary/40 rounded-2xl">
            <p className="font-serif text-2xl mb-2">Seja o primeiro a compartilhar.</p>
            <p className="text-muted-foreground">Sua história pode ser luz no caminho de outra pessoa.</p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((h) => (
            <article
              key={h.id}
              className="bg-card rounded-2xl p-7 shadow-soft border border-border/50 hover:shadow-warm hover:-translate-y-1 transition-all"
            >
              <Quote className="h-8 w-8 text-coral mb-4" />
              <p className="text-foreground/85 leading-relaxed mb-6">{h.depoimento}</p>
              <div className="pt-4 border-t border-border/60">
                <p className="font-serif text-lg">{h.nome}</p>
                {h.cidade && <p className="text-xs text-muted-foreground">{h.cidade}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default Historias;