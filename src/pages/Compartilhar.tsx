import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { PageShell } from "@/components/Layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const schema = z.object({
  nome: z.string().trim().min(2, "Diga seu nome (ou um apelido).").max(100),
  cidade: z.string().trim().max(100).optional().or(z.literal("")),
  contato: z.string().trim().max(200).optional().or(z.literal("")),
  depoimento: z.string().trim().min(20, "Conte com pelo menos 20 caracteres.").max(3000),
  consentimento: z.literal(true, { errorMap: () => ({ message: "É preciso autorizar a publicação." }) }),
  interesse_contato: z.boolean(),
});

const Compartilhar = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: "", cidade: "", contato: "", depoimento: "", consentimento: false, interesse_contato: false });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("historias").insert({
      nome: parsed.data.nome,
      cidade: parsed.data.cidade || null,
      contato: parsed.data.contato || null,
      depoimento: parsed.data.depoimento,
      consentimento: parsed.data.consentimento,
      status: "pendente",
      interesse_contato: parsed.data.interesse_contato,
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
      return;
    }
    toast.success("História enviada! Vamos ler com carinho antes de publicar.");
    nav("/historias");
  };

  return (
    <PageShell>
      <section className="container py-16 max-w-2xl">
        <p className="uppercase tracking-[0.3em] text-xs font-semibold text-coral-deep mb-3">
          Compartilhe sua história
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
          Sua experiência pode ser <span className="italic text-gradient-warm">luz</span> para outra pessoa.
        </h1>
        <p className="text-muted-foreground mb-10">
          Conte como Deus tem trabalhado em você. Vamos ler com cuidado pastoral antes de publicar.
        </p>

        <form onSubmit={submit} className="space-y-5 bg-card rounded-3xl p-8 shadow-soft border border-border/50">
          <div>
            <Label htmlFor="nome">Seu nome *</Label>
            <Input id="nome" required maxLength={100} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade (opcional)</Label>
              <Input id="cidade" maxLength={100} value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="contato">Contato (opcional)</Label>
              <Input id="contato" maxLength={200} placeholder="e-mail ou Instagram" value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="depoimento">Sua história *</Label>
            <Textarea
              id="depoimento"
              required
              rows={8}
              maxLength={3000}
              value={form.depoimento}
              onChange={(e) => setForm({ ...form, depoimento: e.target.value })}
              placeholder="Como Deus mudou seu coração? O que mudou desde que você começou a passar tempo com Ele?"
            />
            <p className="text-xs text-muted-foreground mt-1">{form.depoimento.length}/3000</p>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/60">
            <Checkbox
              id="consent"
              checked={form.consentimento}
              onCheckedChange={(v) => setForm({ ...form, consentimento: !!v })}
            />
            <Label htmlFor="consent" className="text-sm font-normal leading-relaxed cursor-pointer">
              Autorizo a publicação do meu relato no site Fonte de Alegria, com meu nome e cidade (se informados).
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="interesse_contato"
              checked={form.interesse_contato}
              onCheckedChange={(v) => setForm({ ...form, interesse_contato: !!v })}
            />
            <Label htmlFor="interesse_contato" className="text-sm font-normal leading-relaxed cursor-pointer">
              Gostaria de receber contato de um líder cristão para conversar mais sobre a fé
            </Label>
          </div>
          <Button type="submit" disabled={loading} size="lg" className="w-full rounded-full bg-coral hover:bg-coral-deep text-white shadow-warm h-12">
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Enviando…" : "Enviar minha história"}
          </Button>
        </form>
      </section>
    </PageShell>
  );
};

export default Compartilhar;