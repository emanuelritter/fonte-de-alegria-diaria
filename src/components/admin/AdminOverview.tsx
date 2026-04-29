import {
  BookOpen,
  BookHeart,
  MessageSquare,
  Send,
  Users,
  Languages,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { StatCard } from "./shared/StatCard";
import { Button } from "@/components/ui/button";

export function AdminOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { data: s, isLoading, error } = useAdminStats();

  if (isLoading) {
    return <p className="text-muted-foreground">Carregando dados…</p>;
  }
  if (error || !s) {
    return (
      <div className="p-6 rounded-2xl border border-destructive/40 bg-destructive/5">
        <p className="font-semibold text-destructive">Não consegui carregar as estatísticas.</p>
        <p className="text-sm text-muted-foreground mt-1">{(error as any)?.message}</p>
      </div>
    );
  }

  const hojeOk = s.devocional_hoje?.existe && s.devocional_hoje?.publicado;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-coral-deep">
          Painel
        </p>
        <h1 className="font-serif text-4xl mt-1">Visão geral</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Tudo que precisa de atenção hoje em um só lugar.
        </p>
      </header>

      {/* Alerta principal */}
      <div
        className={`rounded-2xl p-5 border flex items-start gap-3 ${
          hojeOk
            ? "border-primary/30 bg-primary/5"
            : "border-destructive/40 bg-destructive/5"
        }`}
      >
        {hojeOk ? (
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
        )}
        <div className="flex-1">
          <p className="font-serif text-lg">
            {hojeOk
              ? `Devocional de hoje publicado: “${s.devocional_hoje.titulo}”`
              : s.devocional_hoje?.existe
                ? `Devocional de hoje está como rascunho: “${s.devocional_hoje.titulo}”`
                : "Nenhum devocional para hoje."}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Próximos 7 dias: {s.proximos_7_dias.publicados} publicados ·{" "}
            {s.proximos_7_dias.preenchidos} preenchidos de 7.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => onNavigate("devocionais")}
        >
          Abrir
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Devocionais"
          value={s.devocionais_total}
          hint={`${s.devocionais_rascunho} em rascunho`}
          icon={BookOpen}
        />
        <StatCard
          label="Histórias pendentes"
          value={s.historias_pendentes}
          hint={`${s.historias_total} no total`}
          icon={BookHeart}
          tone={s.historias_pendentes > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Pedidos de oração"
          value={s.oracao_pendentes}
          hint={`${s.oracao_total} no total`}
          icon={MessageSquare}
          tone={s.oracao_pendentes > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Leads pendentes"
          value={s.leads_pendentes}
          hint="Quem pediu contato"
          icon={Send}
          tone={s.leads_pendentes > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Plano de leitura"
          value={s.plano_total}
          hint="entradas"
          icon={CalendarDays}
        />
        <StatCard
          label="Devocionais fonte"
          value={s.fonte_pendentes}
          hint={`${s.fonte_traduzidos} traduzidos`}
          icon={Languages}
        />
        <StatCard
          label="Usuários"
          value={s.usuarios_total}
          hint={`${s.admins_total} admins`}
          icon={Users}
        />
      </div>

      {/* Ações rápidas */}
      <section>
        <h2 className="font-serif text-2xl mb-3">Ações rápidas</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => onNavigate("devocionais")}>
            Editar devocionais da semana
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => onNavigate("historias")}>
            Aprovar histórias
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => onNavigate("oracao")}>
            Atender pedidos de oração
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => onNavigate("usuarios")}>
            Convidar admin
          </Button>
        </div>
      </section>
    </div>
  );
}