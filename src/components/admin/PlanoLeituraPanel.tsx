import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { EmptyState } from "./shared/EmptyState";

export function PlanoLeituraPanel() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ data: today, titulo: "", referencia: "", descricao: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leitura"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plano_leitura").select("*").order("data", { ascending: true });
      if (error) throw error; return data ?? [];
    },
  });

  const add = async () => {
    if (!form.titulo || !form.referencia) { toast.error("Título e referência são obrigatórios."); return; }
    const { error } = await supabase.from("plano_leitura").insert({ ...form, descricao: form.descricao || null });
    if (error) { toast.error(error.message); return; }
    setForm({ data: today, titulo: "", referencia: "", descricao: "" });
    qc.invalidateQueries({ queryKey: ["admin", "leitura"] });
    qc.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
    qc.invalidateQueries({ queryKey: ["plano-leitura"] });
  };
  const del = async (id: string) => {
    await supabase.from("plano_leitura").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "leitura"] });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-coral-deep">Conteúdo</p>
        <h1 className="font-serif text-4xl mt-1">Plano de leitura</h1>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-soft space-y-4">
          <h2 className="font-serif text-2xl">Nova leitura</h2>
          <div><Label>Data</Label><Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></div>
          <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
          <div><Label>Referência</Label><Input placeholder="Ex.: João 1.1-18" value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} /></div>
          <div><Label>Descrição (opcional)</Label><Textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
          <Button onClick={add} className="rounded-full bg-primary hover:bg-primary-glow"><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
        </div>
        <div className="space-y-3">
          <h2 className="font-serif text-2xl">Plano</h2>
          {isLoading ? <p className="text-muted-foreground">Carregando…</p> :
            (data ?? []).length === 0 ? <EmptyState icon={CalendarDays} title="Plano vazio" /> :
            data!.map((d: any) => (
              <div key={d.id} className="bg-card p-4 rounded-2xl border border-border/50 flex justify-between gap-3">
                <div>
                  <p className="text-xs text-coral-deep font-semibold">{new Date(d.data + "T00:00").toLocaleDateString("pt-BR")}</p>
                  <p className="font-serif">{d.titulo}</p>
                  <p className="text-xs text-muted-foreground italic">{d.referencia}</p>
                </div>
                <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => del(d.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}