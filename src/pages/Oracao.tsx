import { useState } from "react";
import { z } from "zod";
import { PageShell } from "@/components/Layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, ShieldCheck } from "lucide-react";

const schema = z.object({
  nome: z.string().trim().max(100).optional().or(z.literal("")),
  contato: z.string().trim().max(200).optional().or(z.literal("")),
  pedido: z.string().trim().min(5, "Compartilhe um pouco mais sobre o pedido.").max(2000),
  anonimo: z.boolean(),
});

const Oracao = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ nome: "", contato: "", pedido: "", anonimo: false });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.from("pedidos_oracao").insert({
      nome: parsed.data.anonimo ? null : (parsed.data.nome || null),
      contato: parsed.data.anonimo ? null : (parsed.data.contato || null),
      pedido: parsed.data.pedido,
      anonimo: parsed.data.anonimo,
    });
    setLoading(false);
    if (error) { toast.error("Não foi possível enviar agora. Tente novamente."); return; }
    setDone(true);
    setForm({ nome: "", contato: "", pedido: "", anonimo: false });
  };

  return (
    <PageShell>
      <section className="bg-gradient-deep text-white py-20">
        <div className="container max-w-3xl">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-white/70 mb-3">Pedidos de oração</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-4">
            Você não <span className="italic text-coral">precisa</span> orar sozinho.
          </h1>
          <p className="text-white/85 text-lg">
            Envie seu pedido com a confiança de que oraremos por você. Tudo é tratado com sigilo —
            nenhum pedido é publicado no site.
          </p>
        </div>
      </section>

      <section className="container py-16 max-w-2xl">
        {done ? (
          <div className="bg-card rounded-3xl p-10 shadow-soft border border-border/50 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 fill-coral text-coral" />
            <h2 className="font-serif text-3xl mb-3">Recebemos seu pedido.</h2>
            <p className="text-muted-foreground mb-6">
              Nosso Pai conhece o seu coração e ouve cada oração. Que a paz de Cristo te encontre hoje.
            </p>
            <Button onClick={() => setDone(false)} variant="outline" className="rounded-full">Enviar outro pedido</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 bg-card rounded-3xl p-8 shadow-soft border border-border/50">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/60 mb-4">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Seu pedido é confidencial. Não prometemos respostas específicas — apontamos sempre para Deus como nossa fonte de consolo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="anon" checked={form.anonimo} onCheckedChange={(v) => setForm({ ...form, anonimo: !!v })} />
              <Label htmlFor="anon" className="cursor-pointer font-normal">Quero enviar de forma anônima</Label>
            </div>

            {!form.anonimo && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Seu nome (opcional)</Label>
                  <Input id="nome" maxLength={100} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="contato">Contato (opcional)</Label>
                  <Input id="contato" maxLength={200} placeholder="e-mail ou WhatsApp" value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="pedido">Seu pedido *</Label>
              <Textarea
                id="pedido" required rows={7} maxLength={2000}
                value={form.pedido}
                onChange={(e) => setForm({ ...form, pedido: e.target.value })}
                placeholder="Compartilhe o que está no seu coração."
              />
              <p className="text-xs text-muted-foreground mt-1">{form.pedido.length}/2000</p>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full rounded-full bg-primary hover:bg-primary-glow shadow-deep h-12">
              <Heart className="mr-2 h-4 w-4" />
              {loading ? "Enviando…" : "Enviar pedido de oração"}
            </Button>
          </form>
        )}
      </section>
    </PageShell>
  );
};

export default Oracao;