import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, ShieldOff } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { DevocionaisPanel } from "@/components/admin/DevocionaisPanel";
import { HistoriasPanel } from "@/components/admin/HistoriasPanel";
import { OracaoPanel } from "@/components/admin/OracaoPanel";
import { LeadsPanel } from "@/components/admin/LeadsPanel";
import { PlanoLeituraPanel } from "@/components/admin/PlanoLeituraPanel";
import { UsuariosPanel } from "@/components/admin/UsuariosPanel";

const VALID_TABS = new Set(["overview", "devocionais", "historias", "oracao", "leads", "plano", "usuarios"]);

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab") ?? "overview";
  const [active, setActive] = useState(VALID_TABS.has(tabParam) ? tabParam : "overview");

  useEffect(() => {
    const t = params.get("tab") ?? "overview";
    setActive(VALID_TABS.has(t) ? t : "overview");
  }, [params]);

  const setTab = (t: string) => {
    const next = VALID_TABS.has(t) ? t : "overview";
    setActive(next);
    if (next === "overview") setParams({}, { replace: true });
    else setParams({ tab: next }, { replace: true });
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <section className="max-w-lg text-center">
          <ShieldOff className="h-12 w-12 mx-auto mb-4 text-coral" />
          <h1 className="font-serif text-3xl mb-2">Acesso restrito</h1>
          <p className="text-muted-foreground mb-2">Sua conta não tem permissão de administrador.</p>
          <p className="text-xs text-muted-foreground mb-6">
            Conta: <strong>{user.email}</strong>
          </p>
          <Button onClick={() => supabase.auth.signOut()} variant="outline" className="rounded-full">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </section>
      </div>
    );
  }

  return (
    <AdminLayout active={active} onChange={setTab} email={user.email ?? undefined}>
      {active === "overview" && <AdminOverview onNavigate={setTab} />}
      {active === "devocionais" && <DevocionaisPanel />}
      {active === "historias" && <HistoriasPanel />}
      {active === "oracao" && <OracaoPanel />}
      {active === "leads" && <LeadsPanel />}
      {active === "plano" && <PlanoLeituraPanel />}
      {active === "usuarios" && <UsuariosPanel currentUserId={user.id} />}
    </AdminLayout>
  );
}