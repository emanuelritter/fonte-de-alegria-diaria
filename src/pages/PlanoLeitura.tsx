import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, BookOpenText } from "lucide-react";
import { PageShell } from "@/components/Layout/PageShell";
import { supabase } from "@/integrations/supabase/client";

type Leitura = { id: string; data: string; titulo: string; referencia: string; descricao: string | null };

const STORAGE_KEY = "fa.plano.lidos.v1";

const PlanoLeitura = () => {
  const [lidos, setLidos] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLidos(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setLidos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["plano-leitura"],
    queryFn: async (): Promise<Leitura[]> => {
      const { data, error } = await supabase
        .from("plano_leitura")
        .select("*")
        .order("data", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Leitura[];
    },
  });

  const progresso = data && data.length > 0
    ? Math.round((data.filter((d) => lidos.has(d.id)).length / data.length) * 100)
    : 0;

  return (
    <PageShell>
      <section className="bg-gradient-deep text-white py-20">
        <div className="container max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-white/70 mb-3">
            Plano de leitura bíblica
          </p>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-4">
            Caminhe pela <span className="italic text-coral">Palavra</span>, um dia por vez.
          </h1>
          <p className="text-white/80 text-lg max-w-xl">
            Leituras curtas que acompanham o devocional. Marque as concluídas — seu progresso fica salvo neste dispositivo.
          </p>
          {data && data.length > 0 && (
            <div className="mt-8 max-w-md">
              <div className="flex justify-between text-sm mb-2 text-white/80">
                <span>{progresso}% concluído</span>
                <span>{data.filter((d) => lidos.has(d.id)).length}/{data.length}</span>
              </div>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-coral transition-all duration-500"
                  style={{ width: `${progresso}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="container py-16 max-w-3xl">
        {isLoading && <p className="text-muted-foreground">Carregando…</p>}
        {!isLoading && (!data || data.length === 0) && (
          <div className="text-center py-16 bg-secondary/40 rounded-2xl">
            <BookOpenText className="h-12 w-12 mx-auto mb-4 text-coral" />
            <p className="font-serif text-2xl mb-2">Em breve, seu plano de leitura.</p>
            <p className="text-muted-foreground">As leituras diárias serão publicadas aqui.</p>
          </div>
        )}
        <ul className="space-y-3">
          {data?.map((d) => {
            const done = lidos.has(d.id);
            return (
              <li key={d.id}>
                <button
                  onClick={() => toggle(d.id)}
                  className={`w-full text-left flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                    done
                      ? "bg-secondary/60 border-coral/40"
                      : "bg-card border-border hover:shadow-soft"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-6 w-6 text-coral flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-coral-deep font-semibold mb-1">
                      {new Date(d.data + "T00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                    </p>
                    <h3 className={`font-serif text-xl mb-1 ${done ? "line-through opacity-60" : ""}`}>
                      {d.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">{d.referencia}</p>
                    {d.descricao && <p className="text-sm mt-2 text-foreground/80">{d.descricao}</p>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </PageShell>
  );
};

export default PlanoLeitura;