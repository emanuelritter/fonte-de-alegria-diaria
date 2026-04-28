import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
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
import { LogOut, ShieldOff, Plus, Trash2, Check, X, Star, Send, MessageSquare, BookHeart, Shield, ShieldCheck, Users } from "lucide-react";
import { CalendarDays, FileText, CircleCheck, CircleDashed } from "lucide-react";

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
            <TabsTrigger value="historias" className="rounded-full">Histórias</TabsTrigger>
            <TabsTrigger value="oracao" className="rounded-full">Oração</TabsTrigger>
            <TabsTrigger value="leads" className="rounded-full">Leads Missionários</TabsTrigger>
            <TabsTrigger value="usuarios" className="rounded-full">Usuários</TabsTrigger>
            <TabsTrigger value="leitura" className="rounded-full">Plano</TabsTrigger>
          </TabsList>
          <TabsContent value="devocionais"><AdminDevocionais /></TabsContent>
          <TabsContent value="historias"><AdminHistorias /></TabsContent>
          <TabsContent value="oracao"><AdminOracao /></TabsContent>
          <TabsContent value="leads"><AdminLeads /></TabsContent>
          <TabsContent value="usuarios"><AdminUsuarios currentUserId={user.id} /></TabsContent>
          <TabsContent value="leitura"><AdminLeitura /></TabsContent>
        </Tabs>
      </section>
    </PageShell>
  );
};

/* ---------------- Devocionais ---------------- */
const AdminDevocionais = () => {
  return (
    <div className="mt-6">
      <Tabs defaultValue="semana">
        <TabsList className="rounded-full">
          <TabsTrigger value="semana" className="rounded-full">
            <CalendarDays className="mr-2 h-4 w-4" /> Semana
          </TabsTrigger>
          <TabsTrigger value="avulso" className="rounded-full">
            <FileText className="mr-2 h-4 w-4" /> Avulso
          </TabsTrigger>
        </TabsList>
        <TabsContent value="semana"><AdminSemana /></TabsContent>
        <TabsContent value="avulso"><AdminAvulso /></TabsContent>
      </Tabs>
    </div>
  );
};

/* ---------- Modo Semana: 7 cards lado a lado ---------- */
const fmtBR = (iso: string) =>
  new Date(iso + "T00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

/** Retorna a segunda-feira da semana de uma data. */
const segundaDaSemana = (d: Date) => {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // 0 = segunda
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

type SemanaItem = {
  data: string;
  id?: string;
  titulo: string;
  versiculo: string;
  referencia: string;
  meditacao: string;
  oracao: string;
  publicado: boolean;
};

const AdminSemana = () => {
  const qc = useQueryClient();
  const [inicio, setInicio] = useState<string>(() => {
    const seg = segundaDaSemana(new Date());
    return isoDate(seg);
  });

  const datas = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio + "T00:00");
    d.setDate(d.getDate() + i);
    return isoDate(d);
  });

  const { data: existentes } = useQuery({
    queryKey: ["admin", "semana", inicio],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devocionais")
        .select("*")
        .in("data", datas);
      if (error) throw error;
      return data ?? [];
    },
  });

  const [itens, setItens] = useState<SemanaItem[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Sincroniza estado local com dados do banco quando muda a semana ou chegam dados
  useEffect(() => {
    if (!existentes) return;
    const inicial = datas.map((data) => {
      const ex = existentes.find((e: any) => e.data === data);
      return ex
        ? {
            data,
            id: ex.id,
            titulo: ex.titulo,
            versiculo: ex.versiculo,
            referencia: ex.referencia,
            meditacao: ex.meditacao,
            oracao: ex.oracao ?? "",
            publicado: ex.publicado,
          }
        : { data, titulo: "", versiculo: "", referencia: "", meditacao: "", oracao: "", publicado: false };
    });
    setItens(inicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existentes, inicio]);

  const recarregar = (novoInicio: string) => {
    setInicio(novoInicio);
    qc.invalidateQueries({ queryKey: ["admin", "semana"] });
  };

  const navegar = (dias: number) => {
    const d = new Date(inicio + "T00:00");
    d.setDate(d.getDate() + dias);
    recarregar(isoDate(d));
  };

  const update = (i: number, patch: Partial<SemanaItem>) => {
    setItens((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  };

  const salvarTudo = async (publicar: boolean) => {
    const validos = itens.filter(
      (i) => i.titulo.trim() && i.versiculo.trim() && i.referencia.trim() && i.meditacao.trim(),
    );
    if (validos.length === 0) {
      toast.error("Preencha pelo menos um devocional completo (título, versículo, referência, meditação).");
      return;
    }
    setSalvando(true);
    try {
      const payload = validos.map((i) => ({
        ...(i.id ? { id: i.id } : {}),
        data: i.data,
        titulo: i.titulo,
        versiculo: i.versiculo,
        referencia: i.referencia,
        meditacao: i.meditacao,
        oracao: i.oracao || null,
        publicado: publicar ? true : i.publicado,
        cta_nivel: 1,
      }));
      const { error } = await supabase.from("devocionais").upsert(payload, { onConflict: "data" });
      if (error) throw error;
      toast.success(`${validos.length} devocionais salvos${publicar ? " e publicados" : " como rascunho"}.`);
      qc.invalidateQueries({ queryKey: ["admin", "semana"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["devocional"] });
      qc.invalidateQueries({ queryKey: ["devocionais"] });
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">Devocionais da semana</h2>
          <p className="text-sm text-muted-foreground">
            Preencha os 7 dias com os textos do livro. Salve como rascunho, revise, e publique tudo no fim.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => navegar(-7)}>← Anterior</Button>
          <Input
            type="date"
            className="w-44"
            value={inicio}
            onChange={(e) => {
              const d = new Date(e.target.value + "T00:00");
              recarregar(isoDate(segundaDaSemana(d)));
            }}
          />
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => navegar(7)}>Próxima →</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {itens.map((it, i) => (
          <div key={it.data} className="bg-card p-5 rounded-2xl border border-border/50 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-coral-deep font-semibold">
                {fmtBR(it.data)}
              </p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {it.id ? (
                  it.publicado ? (
                    <><CircleCheck className="h-3 w-3 text-primary" /> publicado</>
                  ) : (
                    <><CircleDashed className="h-3 w-3" /> rascunho</>
                  )
                ) : (
                  <><CircleDashed className="h-3 w-3 opacity-50" /> vazio</>
                )}
              </span>
            </div>
            <Input
              placeholder="Título"
              value={it.titulo}
              onChange={(e) => update(i, { titulo: e.target.value })}
            />
            <Textarea
              rows={2}
              placeholder="Versículo"
              value={it.versiculo}
              onChange={(e) => update(i, { versiculo: e.target.value })}
            />
            <Input
              placeholder="Referência (ex.: Salmos 23.1)"
              value={it.referencia}
              onChange={(e) => update(i, { referencia: e.target.value })}
            />
            <Textarea
              rows={6}
              placeholder="Meditação"
              value={it.meditacao}
              onChange={(e) => update(i, { meditacao: e.target.value })}
            />
            <Textarea
              rows={2}
              placeholder="Oração (opcional)"
              value={it.oracao}
              onChange={(e) => update(i, { oracao: e.target.value })}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <Button
          onClick={() => salvarTudo(false)}
          disabled={salvando}
          variant="outline"
          className="rounded-full"
        >
          Salvar como rascunho
        </Button>
        <Button
          onClick={() => salvarTudo(true)}
          disabled={salvando}
          className="rounded-full bg-primary hover:bg-primary-glow"
        >
          Salvar e publicar semana
        </Button>
      </div>
    </div>
  );
};

/* ---------- Modo Avulso (formulário individual) ---------- */
const AdminAvulso = () => {
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
      // Use admin RPC so contato (sensitive) is delivered only after
      // a server-side has_role check.
      const { data, error } = await supabase.rpc("admin_list_historias");
      if (error) throw error;
      return (data ?? []) as any[];
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

/* ---------------- Leads Missionários ---------------- */
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

const AdminLeads = () => {
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["admin", "leads"],
    queryFn: async () => {
      const [oracao, historias] = await Promise.all([
        supabase
          .from("pedidos_oracao")
          .select("id, nome, contato, anonimo, created_at, encaminhado_em, pedido, interesse_contato")
          .eq("interesse_contato", true)
          .order("created_at", { ascending: false }),
        supabase.rpc("admin_list_historias"),
      ]);
      if (oracao.error) throw oracao.error;
      if (historias.error) throw historias.error;

      const oracaoLeads: Lead[] = (oracao.data ?? []).map((p: any) => ({
        id: p.id,
        source: "Pedido de Oração",
        table: "pedidos_oracao",
        nome: p.anonimo ? null : p.nome,
        contato: p.anonimo ? null : p.contato,
        anonimo: !!p.anonimo,
        created_at: p.created_at,
        encaminhado_em: p.encaminhado_em,
        conteudo: p.pedido,
      }));

      const historiasLeads: Lead[] = (historias.data ?? [])
        .filter((h: any) => h.interesse_contato === true)
        .map((h: any) => ({
          id: h.id,
          source: "História",
          table: "historias",
          nome: h.nome,
          contato: h.contato,
          anonimo: false,
          created_at: h.created_at,
          encaminhado_em: h.encaminhado_em,
          conteudo: h.depoimento,
        }));

      return [...oracaoLeads, ...historiasLeads].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    },
  });

  const total = leads.length;
  const pendentes = leads.filter((l) => !l.encaminhado_em).length;
  const encaminhados = total - pendentes;

  const encaminhar = async (lead: Lead) => {
    const { error } = await supabase
      .from(lead.table)
      .update({ encaminhado_em: new Date().toISOString() })
      .eq("id", lead.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Lead marcado como encaminhado.");
    qc.invalidateQueries({ queryKey: ["admin", "leads"] });
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card p-5 rounded-2xl border border-border/50">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Total de leads</p>
          <p className="font-serif text-3xl mt-1">{total}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-coral/30 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-coral-deep font-semibold">Pendentes</p>
          <p className="font-serif text-3xl mt-1">{pendentes}</p>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border/50">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">Encaminhados</p>
          <p className="font-serif text-3xl mt-1">{encaminhados}</p>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Carregando…</p>}
      {!isLoading && leads.length === 0 && (
        <p className="text-muted-foreground">Nenhum lead missionário ainda.</p>
      )}

      <div className="space-y-3">
        {leads.map((lead) => {
          const isEnc = !!lead.encaminhado_em;
          const SourceIcon = lead.source === "Pedido de Oração" ? MessageSquare : BookHeart;
          return (
            <article
              key={`${lead.table}-${lead.id}`}
              className={`p-5 rounded-2xl border ${
                isEnc ? "bg-secondary/40 border-border" : "bg-card border-coral/30 shadow-soft"
              }`}
            >
              <div className="flex flex-wrap justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-serif text-lg">{lead.anonimo ? "Anônimo" : (lead.nome || "Sem nome")}</p>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground/80">
                      <SourceIcon className="h-3 w-3" /> {lead.source}
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
      </div>
    </div>
  );
};