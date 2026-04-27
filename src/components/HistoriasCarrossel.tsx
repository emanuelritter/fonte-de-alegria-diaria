import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Historia = {
  id: string;
  nome: string;
  cidade: string | null;
  depoimento: string;
};

export const HistoriasCarrossel = () => {
  const { data } = useQuery({
    queryKey: ["historias", "destaque"],
    queryFn: async (): Promise<Historia[]> => {
      const { data, error } = await supabase
        .from("historias")
        .select("id, nome, cidade, depoimento")
        .eq("status", "aprovada")
        .order("destaque", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as Historia[];
    },
  });

  return (
    <section className="container py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="uppercase tracking-[0.25em] text-xs text-coral-deep font-semibold mb-3">
          Histórias de alegria
        </p>
        <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
          Vidas que <span className="italic text-gradient-warm">encontraram</span> a fonte
        </h2>
        <p className="text-muted-foreground">
          Pessoas reais compartilhando o que muda quando se passa tempo com Deus todos os dias.
        </p>
      </div>

      {data && data.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((h, idx) => (
            <article
              key={h.id}
              className="bg-card rounded-2xl p-7 shadow-soft border border-border/50 hover:shadow-warm hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <Quote className="h-8 w-8 text-coral mb-4" />
              <p className="text-foreground/85 leading-relaxed mb-6 line-clamp-6">
                {h.depoimento}
              </p>
              <div className="pt-4 border-t border-border/60">
                <p className="font-serif text-lg">{h.nome}</p>
                {h.cidade && (
                  <p className="text-xs text-muted-foreground">{h.cidade}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/40 rounded-2xl">
          <p className="text-muted-foreground mb-4">
            Em breve, histórias de pessoas tocadas por Deus aparecerão aqui.
          </p>
        </div>
      )}

      <div className="text-center mt-12">
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link to="/compartilhar">Compartilhe a sua história</Link>
        </Button>
      </div>
    </section>
  );
};