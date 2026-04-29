import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Star, Trash2, BookHeart } from "lucide-react";
import { SearchInput } from "./shared/SearchInput";
import { EmptyState } from "./shared/EmptyState";

export function HistoriasPanel() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "pendente" | "aprovada" | "rejeitada">("pendente");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "historias"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_historias");
      if (error) throw error; return (data ?? []) as any[];
    },
  });

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("historias").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "historias"] });
    qc.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
  };
  const del = async (id: string) => {
    if (!confirm("Apagar esta história?")) return;
    const { error } = await supabase.from("historias").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "historias"] });
  };

  const filtradas = (data ?? []).filter((h: any) => {
    if (filtro !== "todas" && h.status !== filtro) return false;
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return h.nome?.toLowerCase().includes(q) || h.depoimento?.toLowerCase().includes(q) || h.cidade?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-coral-deep">Comunidade</p>
        <h1 className="font-serif text-4xl mt-1">Histórias</h1>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome, cidade ou trecho" />
        <div className="flex gap-1">
          {(["pendente", "aprovada", "rejeitada", "todas"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 text-xs rounded-full capitalize ${filtro === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando…</p> :
        filtradas.length === 0 ? <EmptyState icon={BookHeart} title="Nenhuma história" description="Quando alguém compartilhar um depoimento, ele aparece aqui." /> :
        <div className="space-y-3">
          {filtradas.map((h: any) => (
            <article key={h.id} className="bg-card p-5 rounded-2xl border border-border/50">
              <div className="flex flex-wrap justify-between gap-3 mb-3">
                <div>
                  <p className="font-serif text-lg">{h.nome} {h.cidade && <span className="text-sm text-muted-foreground">· {h.cidade}</span>}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleString("pt-BR")} · status: <strong>{h.status}</strong>
                    {h.contato && <> · contato: {h.contato}</>}
                  </p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {h.status !== "aprovada" && <Button size="sm" className="rounded-full bg-primary" onClick={() => update(h.id, { status: "aprovada" })}><Check className="h-4 w-4 mr-1" />Aprovar</Button>}
                  {h.status !== "rejeitada" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => update(h.id, { status: "rejeitada" })}><X className="h-4 w-4" /></Button>}
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => update(h.id, { destaque: !h.destaque })}>
                    <Star className={`h-4 w-4 ${h.destaque ? "fill-coral text-coral" : ""}`} />
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => del(h.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-sm text-foreground/85 whitespace-pre-line">{h.depoimento}</p>
            </article>
          ))}
        </div>}
    </div>
  );
}