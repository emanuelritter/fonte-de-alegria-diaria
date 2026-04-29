import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Trash2 } from "lucide-react";
import { SearchInput } from "./shared/SearchInput";
import { EmptyState } from "./shared/EmptyState";

export function OracaoPanel() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [mostrar, setMostrar] = useState<"abertos" | "todos">("abertos");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "oracao"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pedidos_oracao")
        .select("*").order("atendido", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });

  const toggle = async (id: string, atendido: boolean) => {
    await supabase.from("pedidos_oracao").update({ atendido: !atendido }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "oracao"] });
    qc.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
  };
  const del = async (id: string) => {
    if (!confirm("Apagar este pedido?")) return;
    await supabase.from("pedidos_oracao").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "oracao"] });
  };

  const filtrados = (data ?? []).filter((p: any) => {
    if (mostrar === "abertos" && p.atendido) return false;
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return p.pedido?.toLowerCase().includes(q) || p.nome?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-coral-deep">Cuidado pastoral</p>
        <h1 className="font-serif text-4xl mt-1">Pedidos de oração</h1>
        <p className="text-xs text-muted-foreground mt-2">Tratar com sigilo. Estes pedidos nunca aparecem no site.</p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar pedidos…" />
        <div className="flex gap-1">
          {(["abertos", "todos"] as const).map((f) => (
            <button key={f} onClick={() => setMostrar(f)}
              className={`px-3 py-1.5 text-xs rounded-full capitalize ${mostrar === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando…</p> :
        filtrados.length === 0 ? <EmptyState icon={MessageSquare} title="Nenhum pedido" /> :
        <div className="space-y-3">
          {filtrados.map((p: any) => (
            <article key={p.id} className={`p-5 rounded-2xl border ${p.atendido ? "bg-secondary/40 border-border" : "bg-card border-coral/30 shadow-soft"}`}>
              <div className="flex flex-wrap justify-between gap-3 mb-2">
                <div>
                  <p className="font-serif text-lg">{p.anonimo ? "Anônimo" : (p.nome || "Sem nome")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleString("pt-BR")}
                    {p.contato && !p.anonimo && <> · {p.contato}</>}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant={p.atendido ? "outline" : "default"} className="rounded-full" onClick={() => toggle(p.id, p.atendido)}>
                    {p.atendido ? "Reabrir" : "Marcar como orado"}
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => del(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-sm whitespace-pre-line">{p.pedido}</p>
            </article>
          ))}
        </div>}
    </div>
  );
}