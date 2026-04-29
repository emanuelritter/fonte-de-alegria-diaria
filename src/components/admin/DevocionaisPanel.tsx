import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, FileText, Languages, Plus, Trash2, CircleCheck, CircleDashed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SearchInput } from "./shared/SearchInput";
import { EmptyState } from "./shared/EmptyState";

/* ---------- helpers ---------- */
const fmtBR = (iso: string) =>
  new Date(iso + "T00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
const segundaDaSemana = (d: Date) => {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dow);
  x.setHours(0, 0, 0, 0);
  return x;
};
const isoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export function DevocionaisPanel() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-coral-deep">Conteúdo</p>
        <h1 className="font-serif text-4xl mt-1">Devocionais</h1>
      </header>
      <Tabs defaultValue="semana">
        <TabsList className="rounded-full">
          <TabsTrigger value="semana" className="rounded-full">
            <CalendarDays className="h-4 w-4 mr-2" /> Semana
          </TabsTrigger>
          <TabsTrigger value="avulso" className="rounded-full">
            <FileText className="h-4 w-4 mr-2" /> Avulso
          </TabsTrigger>
          <TabsTrigger value="fonte" className="rounded-full">
            <Languages className="h-4 w-4 mr-2" /> Fonte
          </TabsTrigger>
        </TabsList>
        <TabsContent value="semana"><Semana /></TabsContent>
        <TabsContent value="avulso"><Avulso /></TabsContent>
        <TabsContent value="fonte"><Fonte /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ===== Semana ===== */
type SemanaItem = {
  data: string; id?: string; titulo: string; versiculo: string;
  referencia: string; meditacao: string; oracao: string; publicado: boolean;
};

function Semana() {
  const qc = useQueryClient();
  const [inicio, setInicio] = useState<string>(() => isoDate(segundaDaSemana(new Date())));
  const datas = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio + "T00:00"); d.setDate(d.getDate() + i); return isoDate(d);
  });
  const { data: existentes } = useQuery({
    queryKey: ["admin", "semana", inicio],
    queryFn: async () => {
      const { data, error } = await supabase.from("devocionais").select("*").in("data", datas);
      if (error) throw error; return data ?? [];
    },
  });
  const [itens, setItens] = useState<SemanaItem[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!existentes) return;
    setItens(datas.map((data) => {
      const ex = existentes.find((e: any) => e.data === data);
      return ex
        ? { data, id: ex.id, titulo: ex.titulo, versiculo: ex.versiculo, referencia: ex.referencia, meditacao: ex.meditacao, oracao: ex.oracao ?? "", publicado: ex.publicado }
        : { data, titulo: "", versiculo: "", referencia: "", meditacao: "", oracao: "", publicado: false };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existentes, inicio]);

  const navegar = (dias: number) => {
    const d = new Date(inicio + "T00:00"); d.setDate(d.getDate() + dias); setInicio(isoDate(d));
  };
  const update = (i: number, patch: Partial<SemanaItem>) =>
    setItens((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const salvar = async (publicar: boolean) => {
    const validos = itens.filter((i) => i.titulo.trim() && i.versiculo.trim() && i.referencia.trim() && i.meditacao.trim());
    if (validos.length === 0) { toast.error("Preencha pelo menos um devocional completo."); return; }
    setSalvando(true);
    try {
      const payload = validos.map((i) => ({
        ...(i.id ? { id: i.id } : {}),
        data: i.data, titulo: i.titulo, versiculo: i.versiculo, referencia: i.referencia,
        meditacao: i.meditacao, oracao: i.oracao || null,
        publicado: publicar ? true : i.publicado, cta_nivel: 1,
      }));
      const { error } = await supabase.from("devocionais").upsert(payload, { onConflict: "data" });
      if (error) throw error;
      toast.success(`${validos.length} devocional(is) salvo(s)${publicar ? " e publicado(s)" : ""}.`);
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["devocional"] });
      qc.invalidateQueries({ queryKey: ["devocionais"] });
    } catch (e: any) { toast.error(e.message ?? "Falha ao salvar"); }
    finally { setSalvando(false); }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">Devocionais da semana</h2>
          <p className="text-sm text-muted-foreground">Preencha os 7 dias e publique tudo de uma vez.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => navegar(-7)}>← Anterior</Button>
          <Input type="date" className="w-44" value={inicio}
            onChange={(e) => setInicio(isoDate(segundaDaSemana(new Date(e.target.value + "T00:00"))))} />
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => navegar(7)}>Próxima →</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {itens.map((it, i) => (
          <div key={it.data} className="bg-card p-5 rounded-2xl border border-border/50 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-coral-deep font-semibold">{fmtBR(it.data)}</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {it.id ? (it.publicado ? <><CircleCheck className="h-3 w-3 text-primary" /> publicado</> : <><CircleDashed className="h-3 w-3" /> rascunho</>) : <><CircleDashed className="h-3 w-3 opacity-50" /> vazio</>}
              </span>
            </div>
            <Input placeholder="Título" value={it.titulo} onChange={(e) => update(i, { titulo: e.target.value })} />
            <Textarea rows={2} placeholder="Versículo" value={it.versiculo} onChange={(e) => update(i, { versiculo: e.target.value })} />
            <Input placeholder="Referência" value={it.referencia} onChange={(e) => update(i, { referencia: e.target.value })} />
            <Textarea rows={6} placeholder="Meditação" value={it.meditacao} onChange={(e) => update(i, { meditacao: e.target.value })} />
            <Textarea rows={2} placeholder="Oração (opcional)" value={it.oracao} onChange={(e) => update(i, { oracao: e.target.value })} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <Button onClick={() => salvar(false)} disabled={salvando} variant="outline" className="rounded-full">Salvar como rascunho</Button>
        <Button onClick={() => salvar(true)} disabled={salvando} className="rounded-full bg-primary hover:bg-primary-glow">Salvar e publicar semana</Button>
      </div>
    </div>
  );
}

/* ===== Avulso ===== */
function Avulso() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const empty = { id: "", data: today, titulo: "", versiculo: "", referencia: "", meditacao: "", oracao: "", post_url: "", cta_nivel: 1, publicado: true };
  const [form, setForm] = useState<typeof empty>(empty);
  const [busca, setBusca] = useState("");

  const { data: devs } = useQuery({
    queryKey: ["admin", "devocionais", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("devocionais").select("*").order("data", { ascending: false }).limit(120);
      if (error) throw error; return data ?? [];
    },
  });
  const filtrados = (devs ?? []).filter((d: any) => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return d.titulo?.toLowerCase().includes(q) || d.referencia?.toLowerCase().includes(q) || d.data?.includes(q);
  });

  const reset = () => setForm(empty);
  const save = async () => {
    if (!form.titulo || !form.versiculo || !form.referencia || !form.meditacao || !form.data) {
      toast.error("Preencha data, título, versículo, referência e meditação."); return;
    }
    const payload = {
      data: form.data, titulo: form.titulo, versiculo: form.versiculo, referencia: form.referencia,
      meditacao: form.meditacao, oracao: form.oracao || null, post_url: form.post_url || null,
      cta_nivel: form.cta_nivel, publicado: form.publicado,
    };
    const { error } = form.id
      ? await supabase.from("devocionais").update(payload).eq("id", form.id)
      : await supabase.from("devocionais").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Devocional salvo!");
    qc.invalidateQueries({ queryKey: ["admin", "devocionais", "all"] });
    qc.invalidateQueries({ queryKey: ["devocional"] });
    reset();
  };
  const edit = (d: any) => setForm({ id: d.id, data: d.data, titulo: d.titulo, versiculo: d.versiculo, referencia: d.referencia, meditacao: d.meditacao, oracao: d.oracao ?? "", post_url: d.post_url ?? "", cta_nivel: d.cta_nivel, publicado: d.publicado });
  const del = async (id: string) => {
    if (!confirm("Apagar este devocional?")) return;
    const { error } = await supabase.from("devocionais").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "devocionais", "all"] });
    if (form.id === id) reset();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-soft space-y-4">
        <h2 className="font-serif text-2xl">{form.id ? "Editar devocional" : "Novo devocional"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Data</Label><Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></div>
          <div>
            <Label>Nível CTA</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.cta_nivel} onChange={(e) => setForm({ ...form, cta_nivel: Number(e.target.value) })}>
              <option value={1}>1 — Oração e Bíblia</option>
              <option value={2}>2 — Estudos / Novo Tempo</option>
              <option value={3}>3 — Igreja e PGs</option>
            </select>
          </div>
        </div>
        <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
        <div><Label>Versículo</Label><Textarea rows={2} value={form.versiculo} onChange={(e) => setForm({ ...form, versiculo: e.target.value })} /></div>
        <div><Label>Referência</Label><Input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} /></div>
        <div><Label>Meditação</Label><Textarea rows={8} value={form.meditacao} onChange={(e) => setForm({ ...form, meditacao: e.target.value })} /></div>
        <div><Label>Oração final (opcional)</Label><Textarea rows={3} value={form.oracao} onChange={(e) => setForm({ ...form, oracao: e.target.value })} /></div>
        <div><Label>Link do post (opcional)</Label><Input value={form.post_url} onChange={(e) => setForm({ ...form, post_url: e.target.value })} /></div>
        <div className="flex items-center gap-3">
          <Switch checked={form.publicado} onCheckedChange={(v) => setForm({ ...form, publicado: v })} />
          <Label className="font-normal cursor-pointer">Publicado</Label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={save} className="rounded-full bg-primary hover:bg-primary-glow"><Plus className="mr-1 h-4 w-4" />{form.id ? "Salvar" : "Criar"}</Button>
          {form.id && <Button onClick={reset} variant="outline" className="rounded-full">Cancelar</Button>}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-serif text-2xl">Recentes</h2>
          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por título, referência, data" />
        </div>
        {filtrados.length === 0 ? (
          <EmptyState title="Nada por aqui" description="Nenhum devocional corresponde à busca." />
        ) : filtrados.map((d: any) => (
          <div key={d.id} className="bg-card p-4 rounded-2xl border border-border/50 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-coral-deep font-semibold">{new Date(d.data + "T00:00").toLocaleDateString("pt-BR")} · {d.publicado ? "publicado" : "rascunho"}</p>
              <p className="font-serif text-lg truncate">{d.titulo}</p>
              <p className="text-xs text-muted-foreground italic truncate">{d.referencia}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => edit(d)}>Editar</Button>
              <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => del(d.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Fonte ===== */
function Fonte() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "pendente" | "traduzido">("pendente");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "fonte", filtro],
    queryFn: async () => {
      let q = supabase.from("devocionais_fonte").select("*").order("data", { ascending: false }).limit(200);
      if (filtro === "traduzido") q = q.eq("traduzido", true);
      if (filtro === "pendente") q = q.eq("traduzido", false);
      const { data, error } = await q;
      if (error) throw error; return data ?? [];
    },
  });
  const filtrados = (data ?? []).filter((d: any) => {
    if (!busca.trim()) return true;
    const q = busca.toLowerCase();
    return d.titulo?.toLowerCase().includes(q) || d.referencia?.toLowerCase().includes(q);
  });

  const marcarTraduzido = async (id: string, valor: boolean) => {
    const { error } = await supabase.from("devocionais_fonte").update({ traduzido: valor }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "fonte"] });
  };

  return (
    <div className="mt-6 space-y-4">
      <div>
        <h2 className="font-serif text-2xl">Devocionais fonte (acervo)</h2>
        <p className="text-sm text-muted-foreground">Material de origem para tradução/adaptação.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por título ou referência" />
        <div className="flex gap-1">
          {(["pendente", "traduzido", "todos"] as const).map((f) => (
            <button key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 text-xs rounded-full ${filtro === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {f === "pendente" ? "Pendentes" : f === "traduzido" ? "Traduzidos" : "Todos"}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando…</p> :
        filtrados.length === 0 ? <EmptyState title="Nada encontrado" /> :
        <div className="space-y-2">
          {filtrados.map((d: any) => (
            <article key={d.id} className="bg-card p-4 rounded-2xl border border-border/50 flex items-start gap-3 justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{d.data} · {d.referencia} {d.traduzido && <span className="text-primary font-semibold ml-2">✓ traduzido</span>}</p>
                <p className="font-serif text-base truncate">{d.titulo}</p>
                {d.erro && <p className="text-xs text-destructive mt-1">erro: {d.erro}</p>}
              </div>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => marcarTraduzido(d.id, !d.traduzido)}>
                {d.traduzido ? "Marcar pendente" : "Marcar traduzido"}
              </Button>
            </article>
          ))}
        </div>
      }
    </div>
  );
}