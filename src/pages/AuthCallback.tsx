import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageShell } from "@/components/Layout/PageShell";

const AuthCallback = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          toast.error("Erro na autenticação: " + error.message);
          setTimeout(() => nav("/auth"), 2000);
          return;
        }

        if (data.session) {
          toast.success("Autenticado com sucesso!");
          // Redirect to admin after short delay
          setTimeout(() => nav("/admin", { replace: true }), 500);
        } else {
          setError("Nenhuma sessão encontrada");
          toast.error("Erro: nenhuma sessão encontrada");
          setTimeout(() => nav("/auth"), 2000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
        toast.error("Erro: " + message);
        setTimeout(() => nav("/auth"), 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [nav]);

  return (
    <PageShell>
      <section className="container py-20 max-w-md text-center">
        {loading ? (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl">Autenticando...</h2>
            <p className="text-muted-foreground">Por favor, aguarde enquanto processamos sua autenticação.</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-red-600">Erro de autenticação</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">Você será redirecionado em breve...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl">Sucesso!</h2>
            <p className="text-muted-foreground">Você será redirecionado para o painel de administração.</p>
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default AuthCallback;
