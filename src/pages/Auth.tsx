import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { PageShell } from "@/components/Layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const credSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255).nonempty(),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72).nonempty(),
});
type Cred = { email: string; password: string };

const Auth = () => {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (!loading && user) nav("/admin", { replace: true });
  }, [user, loading, nav]);

  const signIn = async () => {
    const parsed = credSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data as Cred);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    nav("/admin");
  };

  const signUp = async () => {
    const parsed = credSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      ...(parsed.data as Cred),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Conta criada! Você já pode entrar.");
  };

  return (
    <PageShell>
      <section className="container py-20 max-w-md">
        <div className="text-center mb-8">
          <p className="uppercase tracking-[0.3em] text-xs font-semibold text-coral-deep mb-2">Área da equipe</p>
          <h1 className="font-serif text-4xl">Entrar</h1>
          <p className="text-muted-foreground text-sm mt-2">
            <Link to="/" className="hover:underline">← Voltar para o site</Link>
          </p>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 w-full mb-6 rounded-full">
            <TabsTrigger value="signin" className="rounded-full">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full">Criar conta</TabsTrigger>
          </TabsList>

          {(["signin","signup"] as const).map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="bg-card p-7 rounded-3xl shadow-soft border border-border/50 space-y-4">
                <div>
                  <Label htmlFor={`email-${tab}`}>E-mail</Label>
                  <Input id={`email-${tab}`} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor={`pwd-${tab}`}>Senha</Label>
                  <Input id={`pwd-${tab}`} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <Button
                  onClick={tab === "signin" ? signIn : signUp}
                  disabled={busy}
                  className="w-full rounded-full bg-primary hover:bg-primary-glow"
                >
                  {busy ? "Aguarde…" : tab === "signin" ? "Entrar" : "Criar conta"}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </PageShell>
  );
};

export default Auth;
