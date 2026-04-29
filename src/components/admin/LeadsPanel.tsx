import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, MessageSquare, BookHeart, CircleCheck, CircleDashed } from "lucide-react";
import { EmptyState } from "./shared/EmptyState";

type Lead = {
  id: string;
  source: "Pedido de Oração" | "História";
  table: "pedidos_oracao" | "historias";
  nome: string | null;
  contato: string | null;
  anonimo: boolean;
  created_at: string;
  encaminhado_em: string | null;
  conteudo: string;
};

export function LeadsPanel() {
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["admin", "leads"],
    queryFn: async () => {
      const [oracao, historias] = await Promise.all([
        supabase.from("pedidos_oracao")
          .select("id, nome, contato, anonimo, created_at, encaminhado_em, pedido, interesse_contato")
          .eq("interesse_contato", true)
          .order("created_at", { ascending: false }),
        supabase.rpc("admin_list_historias"),
      ]);
      if (oracao.error) throw oracao.error;
      if (historias.error) throw historias.error;

      const o: Lead[] = (oracao.data ?? []).map((p: any) => ({
        id: p.id, source: "Pedido de Oração", table: "pedidos_oracao",
        nome: p.anonimo ? null : p.nome, contato: p.anonimo ? null : p.contato,
        anonimo: !!p.anonimo, created_at: p.created_at, encaminhado_em: p.encaminhado_em, conteudo: p.pedido,
      }));
      const h: Lead[] = (historias.data ?? []).filter((x: any) => x.interesse_contato === true).map((x: any) => ({
        id: x.id, source: "História", table: "historias",
        nome: x.nome, contato: x.contato, anonimo: false,
        created_at: x.created_at, encaminhado_em: x.encaminhado_em, conteudo: x.depoimento,
      }));
      return [...o, ...h].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    },
  });

  const total = leads.length;
  const pendentes = leads.filter((l) => !l.encaminhado_em).length;
  const encaminhados = total - pendentes;

  const encaminhar = async (lead: Lead) => {
    const { error } = await supabase.from(lead.table).update({ encaminhado_em: new Date().toISOString() }).eq("id", lead.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Lead marcado como encaminhado.");
    qc.invalidateQueries({ queryKey: ["admin", "leads"] });
    qc.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-coral-deep">Missionário</p>
        <h1 className="font-serif text-4xl mt-1">Leads</h1>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card p-4 rounded-2xl border border-border/50">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Total</p>
          <p className="font-serif text-3xl mt-1">{total}</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-coral/30 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-coral-deep font-semibold">Pendentes</p>
          <p className="font-serif text-3xl mt-1">{pendentes}</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border/50">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">Encaminhados</p>
          <p className="font-serif text-3xl mt-1">{encaminhados}</p>
        </div>
      </div>

      {isLoading ? <p className="text-muted-foreground">Carregando…</p> :
        leads.length === 0 ? <EmptyState icon={Send} title="Nenhum lead missionário ainda" description="Quem marca interesse de contato em um pedido ou história aparece aqui." /> :
        <div className="space-y-3">
          {leads.map((lead) => {
            const isEnc = !!lead.encaminhado_em;
            const Icon = lead.source === "Pedido de Oração" ? MessageSquare : BookHeart;
            return (
              <article key={`${lead.table}-${lead.id}`}
                className={`p-5 rounded-2xl border ${isEnc ? "bg-secondary/40 border-border" : "bg-card border-coral/30 shadow-soft"}`}>
                <div className="flex flex-wrap justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-serif text-lg">{lead.anonimo ? "Anônimo" : (lead.nome || "Sem nome")}</p>
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground/80">
                        <Icon className="h-3 w-3" /> {lead.source}
                      </span>
                      {isEnc ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                          <CircleCheck className="h-3 w-3" /> Encaminhado · {new Date(lead.encaminhado_em!).toLocaleDateString("pt-BR")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-coral/15 text-coral-deep font-semibold">
                          <CircleDashed className="h-3 w-3" /> Pendente
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Contato: <strong>{lead.contato || "—"}</strong> · {new Date(lead.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {!isEnc && (
                    <Button size="sm" className="rounded-full bg-primary hover:bg-primary-glow" onClick={() => encaminhar(lead)}>
                      <Send className="h-4 w-4 mr-1" /> Encaminhar
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground/85 whitespace-pre-line line-clamp-4">{lead.conteudo}</p>
              </article>
            );
          })}
        </div>}
    </div>
  );
}