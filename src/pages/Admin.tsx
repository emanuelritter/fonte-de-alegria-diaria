import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/Layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LogOut, ShieldOff, Plus, Trash2, Check, X, Star } from "lucide-react";
import { Download, RefreshCw, Eye, EyeOff } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <PageShell><div className="container py-20 text-center text-muted-foreground">Carregando…</div></PageShell>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <PageShell>
        <section className="container py-20 max-w-lg text-center">
          <ShieldOff className="h-12 w-12 mx-auto mb-4 text-coral" />
          <h1 className="font-serif text-3xl mb-2">Acesso restrito</h1>
          <p className="text-muted-foreground mb-2">Sua conta ainda não tem permissão de administrador.</p>
          <p className="text-xs text-muted-foreground mb-6">
            Conta atual: <strong>{user.email}</strong> · ID: <code className="bg-secondary px-1 rounded">{user.id}</code>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Peça ao responsável do projeto para conceder permissão de admin a este usuário.
          </p>
          <Button onClick={() => supabase.auth.signOut()} variant="outline" className="rounded-full">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="container py-12">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs font-semibold text-coral-deep mb-2">Painel</p>
            <h1 className="font-serif text-4xl">Administração</h1>
          </div>
          <Button onClick={() => supabase.auth.signOut()} variant="outline" className="rounded-full">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>

        <Tabs defaultValue="devocionais">
          <TabsList className="rounded-full">
            <TabsTrigger value="devocionais" className="rounded-full">Devocionais</TabsTrigger>
            <TabsTrigger value="importacao" className="rounded-full">Importação</TabsTrigger>
            <TabsTrigger value="historias" className="rounded-full">Histórias</TabsTrigger>
            <TabsTrigger value="oracao" className="rounded-full">Oração</TabsTrigger>
            <TabsTrigger value="leitura" className="rounded-full">Plano</TabsTrigger>
          </TabsList>
          <TabsContent value="devocionais"><AdminDevocionais /></TabsContent>
          <TabsContent value="importacao"><AdminImportacao /></TabsContent>
          <TabsContent value="historias"><AdminHistorias /></TabsContent>
          <TabsContent value="oracao"><AdminOracao /></TabsContent>
          <TabsContent value="leitura"><AdminLeitura /></TabsContent>
        </Tabs>
      </section>
    </PageShell>
  );
};

/* ---------------- Importação automática ---------------- */
const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const AdminImportacao = () => {
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);

  const { data: progresso, refetch } = useQuery({
    queryKey: ["admin", "importacao-progresso"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devocionais_fonte")
        .select("data, traduzido, erro");
      if (error) throw error;
      const total = data.length;
      const feitos = data.filter((d: any) => d.traduzido).length;
      const pendentes = total - feitos;
      const erros = data.filter((d: any) => d.erro && !d.traduzido).length;
      // Por mês
      const porMes = MESES.map((nome, i) => {
        const mes = i + 1;
        const itens = data.filter((d: any) => parseInt(d.data.slice(5, 7)) === mes);
        const ok = itens.filter((d: any) => d.traduzido).length;
        return { mes, nome, total: itens.length, ok };
      });
      return { total, feitos, pendentes, erros, porMes };
    },
    refetchInterval: 8000,
  });

  const { data: porMesPub } = useQuery({
    queryKey: ["admin", "publicados-por-mes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devocionais")
        .select("data, publicado");
      if (error) throw error;
      return MESES.map((_, i) => {
        const mes = i + 1;
        const itens = data.filter((d: any) => parseInt(d.data.slice(5, 7)) === mes);
        return {
          mes,
          total: itens.length,
          publicados: itens.filter((d: any) => d.publicado).length,
        };
      });
    },
    refetchInterval: 8000,
  });

  const trigger = async () => {
    setRunning(true);
    try {
      const { error } = await supabase.functions.invoke("processar-devocionais", {
        body: {},
      });
      if (error) throw error;
      toast.success("Lote disparado", { description: "15 devocionais sendo traduzidos agora." });
      setTimeout(() => refetch(), 2000);
    } catch (e: any) {
      toast.error(e.message || "Falha ao disparar");
    } finally {
      setRunning(false);
    }
  };

  const togglePublicarMes = async (mes: number, publicar: boolean) => {
    const ini = `2026-${String(mes).padStart(2, "0")}-01`;
    const fim = mes === 12
      ? "2026-12-31"
      : `2026-${String(mes + 1).padStart(2, "0")}-01`;
    const { error } = await supabase
      .from("devocionais")
      .update({ publicado: publicar })
      .gte("data", ini)
      [mes === 12 ? "lte" : "lt"]("data", fim);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(publicar ? `${MESES[mes - 1]} publicado!` : `${MESES[mes - 1]} despublicado.`);
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["devocional"] });
  };

  const pct = progresso ? Math.round((progresso.feitos / Math.max(progresso.total, 1)) * 100) : 0;

  return (
    <div className="mt-6 space-y-8">
      <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-serif text-2xl mb-1">Importação automática — Radiant Religion 2026</h2>
            <p className="text-sm text-muted-foreground">
              Os 365 devocionais do livro são traduzidos para o português e ganham uma oração pastoral adventista
              gerada por IA. O processo roda sozinho em segundo plano (a cada 2 minutos).
            </p>
          </div>
          <Button
            onClick={trigger}
            disabled={running || (progresso?.pendentes ?? 0) === 0}
            className="rounded-full bg-primary hover:bg-primary-glow"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${running ? "animate-spin" : ""}`} />
            Processar lote agora (15)
          </Button>
        </div>

        {progresso && (
          <>
            <div className="flex flex-wrap gap-6 text-sm mb-4">
              <div><span className="text-muted-foreground">Traduzidos:</span> <strong className="text-coral-deep">{progresso.feitos}</strong>/{progresso.total}</div>
              <div><span className="text-muted-foreground">Pendentes:</span> <strong>{progresso.pendentes}</strong></div>
              {progresso.erros > 0 && (
                <div><span className="text-muted-foreground">Com erro (vão tentar de novo):</span> <strong className="text-destructive">{progresso.erros}</strong></div>
              )}
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-sunrise transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{pct}% concluído</p>
          </>
        )}
      </div>

      <div>
        <h3 className="font-serif text-xl mb-3">Por mês</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Devocionais entram como <strong>rascunho</strong> (não publicados). Revise e publique mês a mês quando estiver pronto.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {progresso?.porMes.map((m) => {
            const pub = porMesPub?.find((p) => p.mes === m.mes);
            const traduzidoCompleto = m.total > 0 && m.ok === m.total;
            const publicadoCompleto = pub && pub.total > 0 && pub.publicados === pub.total;
            return (
              <div key={m.mes} className="bg-card p-4 rounded-2xl border border-border/50">
                <div className="flex justify-between items-baseline mb-2">
                  <p className="font-serif text-lg">{m.nome}</p>
                  <p className="text-xs text-muted-foreground">{m.ok}/{m.total} traduzidos</p>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-coral" style={{ width: `${(m.ok / Math.max(m.total, 1)) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Publicados: <strong>{pub?.publicados ?? 0}</strong>/{pub?.total ?? 0}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full flex-1"
                    disabled={!traduzidoCompleto || publicadoCompleto}
                    onClick={() => togglePublicarMes(m.mes, true)}
                  >
                    <Eye className="mr-1 h-3 w-3" /> Publicar
                  </Button>
                  {publicadoCompleto && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => togglePublicarMes(m.mes, false)}
                    >
                      <EyeOff className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Devocionais ---------------- */
const AdminDevocionais = () => {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    id: "" as string | "",
    data: today, titulo: "", versiculo: "", referencia: "",
    meditacao: "", oracao: "", post_url: "", cta_nivel: 1, publicado: true,
  });

  const { data: devs } = useQuery({
    queryKey: ["admin", "devocionais"],
    queryFn: async () => {
      const { data, error } = await supabase.from("devocionais").select("*").order("data", { ascending: false }).limit(60);
      if (error) throw error; return data ?? [];
    },
  });

  const reset = () => setForm({ id: "", data: today, titulo: "", versiculo: "", referencia: "", meditacao: "", oracao: "", post_url: "", cta_nivel: 1, publicado: true });

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
    qc.invalidateQueries({ queryKey: ["admin", "devocionais"] });
    qc.invalidateQueries({ queryKey: ["devocional"] });
    reset();
  };

  const edit = (d: any) => setForm({
    id: d.id, data: d.data, titulo: d.titulo, versiculo: d.versiculo, referencia: d.referencia,
    meditacao: d.meditacao, oracao: d.oracao ?? "", post_url: d.post_url ?? "", cta_nivel: d.cta_nivel, publicado: d.publicado,
  });

  const del = async (id: string) => {
    if (!confirm("Apagar este devocional?")) return;
    const { error } = await supabase.from("devocionais").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "devocionais"] });
    if (form.id === id) reset();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 mt-6">
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
        <div><Label>Referência</Label><Input placeholder="Ex.: Salmos 23.1" value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} /></div>
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
        <h2 className="font-serif text-2xl mb-2">Recentes</h2>
        {devs?.map((d: any) => (
          <div key={d.id} className="bg-card p-4 rounded-2xl border border-border/50 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-coral-deep font-semibold">{new Date(d.data + "T00:00").toLocaleDateString("pt-BR")} · {d.publicado ? "publicado" : "rascunho"}</p>
              <p className="font-serif text-lg truncate">{d.titulo}</p>
              <p className="text-xs text-muted-foreground italic truncate">{d.referencia}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => edit(d)}>Editar</Button>
              <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => del(d.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- Histórias ---------------- */
const AdminHistorias = () => {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "historias"],
    queryFn: async () => {
      const { data, error } = await supabase.from("historias").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });

  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("historias").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "historias"] });
    qc.invalidateQueries({ queryKey: ["historias"] });
  };

  const del = async (id: string) => {
    if (!confirm("Apagar esta história?")) return;
    const { error } = await supabase.from("historias").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "historias"] });
  };

  return (
    <div className="space-y-3 mt-6">
      {data?.length === 0 && <p className="text-muted-foreground">Nenhuma história enviada ainda.</p>}
      {data?.map((h: any) => (
        <article key={h.id} className="bg-card p-5 rounded-2xl border border-border/50">
          <div className="flex flex-wrap justify-between gap-3 mb-3">
            <div>
              <p className="font-serif text-lg">{h.nome} {h.cidade && <span className="text-sm text-muted-foreground">· {h.cidade}</span>}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(h.created_at).toLocaleString("pt-BR")} · status: <strong>{h.status}</strong>
                {h.contato && <> · contato: {h.contato}</>}
              </p>
            </div>
            <div className="flex gap-1">
              {h.status !== "aprovada" && (
                <Button size="sm" className="rounded-full bg-primary" onClick={() => update(h.id, { status: "aprovada" })}><Check className="h-4 w-4 mr-1" />Aprovar</Button>
              )}
              {h.status !== "rejeitada" && (
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => update(h.id, { status: "rejeitada" })}><X className="h-4 w-4" /></Button>
              )}
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => update(h.id, { destaque: !h.destaque })}>
                <Star className={`h-4 w-4 ${h.destaque ? "fill-coral text-coral" : ""}`} />
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full text-destructive" onClick={() => del(h.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <p className="text-sm text-foreground/85 whitespace-pre-line">{h.depoimento}</p>
        </article>
      ))}
    </div>
  );
};

/* ---------------- Oração ---------------- */
const AdminOracao = () => {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "oracao"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pedidos_oracao").select("*").order("atendido", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error; return data ?? [];
    },
  });

  const toggle = async (id: string, atendido: boolean) => {
    await supabase.from("pedidos_oracao").update({ atendido: !atendido }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "oracao"] });
  };
  const del = async (id: string) => {
    if (!confirm("Apagar este pedido?")) return;
    await supabase.from("pedidos_oracao").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "oracao"] });
  };

  return (
    <div className="space-y-3 mt-6">
      <p className="text-xs text-muted-foreground">Tratar com sigilo. Estes pedidos nunca aparecem no site.</p>
      {data?.length === 0 && <p className="text-muted-foreground">Nenhum pedido recebido.</p>}
      {data?.map((p: any) => (
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
    </div>
  );
};

/* ---------------- Leitura ---------------- */
const AdminLeitura = () => {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ data: today, titulo: "", referencia: "", descricao: "" });
  const { data } = useQuery({
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
    qc.invalidateQueries({ queryKey: ["plano-leitura"] });
  };
  const del = async (id: string) => {
    await supabase.from("plano_leitura").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "leitura"] });
    qc.invalidateQueries({ queryKey: ["plano-leitura"] });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 mt-6">
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
        {data?.map((d: any) => (
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
  );
};

export default Admin;