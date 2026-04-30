import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Trash2 } from "lucide-react";

import { PageShell } from "@/components/Layout/PageShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  CarrosselData,
  DRAFT_KEY,
  EMPTY_CARROSSEL,
  TOTAL_SLIDES,
} from "@/lib/carrosselSlides";
import { SlidePreview } from "@/components/carrossel/SlidePreview";
import { renderSlidePNG } from "@/lib/carrosselCanvas";
import { downloadBlob, slugify } from "@/lib/canvasUtils";

type DevocionalRow = {
  id: string;
  data: string;
  titulo: string;
};

const GerarCarrossel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<CarrosselData>(EMPTY_CARROSSEL);
  const [current, setCurrent] = useState(1);
  const [devocionais, setDevocionais] = useState<DevocionalRow[]>([]);
  const [selectedDev, setSelectedDev] = useState<string>("");
  const [aiBusy, setAiBusy] = useState(false);
  const [exporting, setExporting] = useState({ active: false, current: 0, total: TOTAL_SLIDES });

  // Auth gate
  useEffect(() => {
    if (!loading && !user) {
      navigate(`/auth?redirect=${encodeURIComponent("/gerar-carrossel")}`, { replace: true });
    }
  }, [user, loading, navigate]);

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm({ ...EMPTY_CARROSSEL, ...parsed });
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Save draft (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(id);
  }, [form]);

  // Load devocionais for the AI selector
  useEffect(() => {
    if (!user) return;
    supabase
      .from("devocionais")
      .select("id, data, titulo")
      .eq("publicado", true)
      .order("data", { ascending: false })
      .limit(30)
      .then(({ data }) => setDevocionais((data ?? []) as DevocionalRow[]));
  }, [user]);

  const update = <K extends keyof CarrosselData>(k: K, v: CarrosselData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const limpar = () => {
    setForm(EMPTY_CARROSSEL);
    localStorage.removeItem(DRAFT_KEY);
    setCurrent(1);
    toast.success("Rascunho limpo.");
  };

  const gerarComIA = async () => {
    if (!selectedDev) {
      toast.error("Escolha um devocional para gerar.");
      return;
    }
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-carrossel-editorial", {
        body: { devocional_id: selectedDev },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const next: Partial<CarrosselData> = data?.slides ?? {};
      const dev = devocionais.find((d) => d.id === selectedDev);
      setForm((f) => ({
        ...f,
        data: dev?.data ?? f.data,
        titulo: dev?.titulo ?? f.titulo,
        gancho: next.gancho ?? f.gancho,
        contexto: next.contexto ?? f.contexto,
        versiculo: next.versiculo ?? f.versiculo,
        referencia: next.referencia ?? f.referencia,
        reflexao: next.reflexao ?? f.reflexao,
        aplicacao: next.aplicacao ?? f.aplicacao,
        pergunta: next.pergunta ?? f.pergunta,
      }));
      toast.success("Slides preenchidos. Edite o que quiser.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao gerar.";
      toast.error(msg);
    } finally {
      setAiBusy(false);
    }
  };

  const baixarSlides = async () => {
    setExporting({ active: true, current: 0, total: TOTAL_SLIDES });
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const baseName = `fda-${form.data || "carrossel"}-${slugify(form.titulo || "slide")}`;
      for (let i = 1; i <= TOTAL_SLIDES; i++) {
        setExporting({ active: true, current: i, total: TOTAL_SLIDES });
        const blob = await renderSlidePNG(form, i);
        downloadBlob(blob, `${baseName}-${String(i).padStart(2, "0")}.png`);
        // pequena pausa para o navegador respirar entre downloads
        await new Promise((r) => setTimeout(r, 120));
      }
      toast.success(`${TOTAL_SLIDES} slides baixados com sucesso!`);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao exportar. Tente novamente.");
    } finally {
      setExporting({ active: false, current: 0, total: TOTAL_SLIDES });
    }
  };

  if (loading || !user) {
    return (
      <PageShell>
        <div className="container py-20 text-center text-muted-foreground">Carregando…</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="pt-16 lg:pt-20">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
          {/* FORM */}
          <aside className="w-full lg:w-[420px] lg:flex-shrink-0 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto border-r border-border bg-background">
            <div className="p-6 space-y-7">
              <header>
                <p className="uppercase tracking-[0.3em] text-xs font-semibold text-coral-deep mb-1">
                  Ferramenta interna
                </p>
                <h1 className="font-serif text-3xl">Gerar carrossel</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Editorial dark, 7 slides 1080×1080, prontos para o feed.
                </p>
              </header>

              {/* GERAR COM IA */}
              <section className="space-y-3 p-4 rounded-2xl bg-secondary/40 border border-border/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider">Gerar com IA</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Escolha um devocional publicado e a IA pré-preenche os 7 slides. Você ainda edita tudo manualmente.
                </p>
                <Select value={selectedDev} onValueChange={setSelectedDev}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um devocional…" />
                  </SelectTrigger>
                  <SelectContent>
                    {devocionais.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.data} — {d.titulo}
                      </SelectItem>
                    ))}
                    {devocionais.length === 0 && (
                      <div className="px-2 py-3 text-xs text-muted-foreground">
                        Nenhum devocional publicado.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={gerarComIA}
                  disabled={aiBusy || !selectedDev}
                  className="w-full rounded-full"
                >
                  {aiBusy ? "Gerando…" : "Gerar com IA"}
                </Button>
              </section>

              {/* IDENTIFICAÇÃO */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Identificação
                </h2>
                <div>
                  <Label htmlFor="data">Data do devocional</Label>
                  <Input
                    id="data"
                    type="date"
                    value={form.data}
                    onChange={(e) => update("data", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="titulo">Título / tema do dia</Label>
                  <Input
                    id="titulo"
                    value={form.titulo}
                    onChange={(e) => update("titulo", e.target.value)}
                    placeholder="Ex: A alegria que sustenta"
                  />
                </div>
              </section>

              {/* CONTEÚDO */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Conteúdo dos slides
                </h2>

                <div>
                  <Label htmlFor="gancho">Gancho (slide 1)</Label>
                  <Textarea
                    id="gancho"
                    rows={3}
                    value={form.gancho}
                    onChange={(e) => update("gancho", e.target.value)}
                    placeholder="Uma pergunta ou afirmação que para o scroll."
                  />
                </div>

                <div>
                  <Label htmlFor="contexto">Contexto (slide 2)</Label>
                  <Textarea
                    id="contexto"
                    rows={4}
                    value={form.contexto}
                    onChange={(e) => update("contexto", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="versiculo">Versículo (slide 3)</Label>
                  <Textarea
                    id="versiculo"
                    rows={3}
                    value={form.versiculo}
                    onChange={(e) => update("versiculo", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="referencia">Referência bíblica (slide 3)</Label>
                  <Input
                    id="referencia"
                    value={form.referencia}
                    onChange={(e) => update("referencia", e.target.value)}
                    placeholder="João 15:11"
                  />
                </div>

                <div>
                  <Label htmlFor="reflexao">Reflexão (slide 4)</Label>
                  <Textarea
                    id="reflexao"
                    rows={4}
                    value={form.reflexao}
                    onChange={(e) => update("reflexao", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use *asteriscos* em volta da palavra que deve ficar dourada.
                  </p>
                </div>

                <div>
                  <Label htmlFor="aplicacao">Aplicação prática (slide 5)</Label>
                  <Textarea
                    id="aplicacao"
                    rows={4}
                    value={form.aplicacao}
                    onChange={(e) => update("aplicacao", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    3 ações, uma por linha. Ex: Ore antes de abrir o celular.
                  </p>
                </div>

                <div>
                  <Label htmlFor="pergunta">Pergunta de reflexão (slide 6)</Label>
                  <Textarea
                    id="pergunta"
                    rows={2}
                    value={form.pergunta}
                    onChange={(e) => update("pergunta", e.target.value)}
                    placeholder="Uma pergunta que convida ao comentário."
                  />
                </div>
              </section>

              {/* AÇÕES */}
              <section className="pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar tudo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar todos os campos?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O rascunho salvo será apagado. Essa ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={limpar}>Limpar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </section>
            </div>
          </aside>

          {/* PREVIEW */}
          <main className="flex-1 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <SlidePreview
              data={form}
              current={current}
              setCurrent={setCurrent}
              onExport={baixarSlides}
              exporting={exporting}
            />
          </main>
        </div>
      </div>
    </PageShell>
  );
};

export default GerarCarrossel;