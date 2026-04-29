import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BookHeart,
  MessageSquare,
  Send,
  Users,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const items = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Visão geral" },
  { to: "/admin?tab=devocionais", icon: BookOpen, label: "Devocionais" },
  { to: "/admin?tab=historias", icon: BookHeart, label: "Histórias" },
  { to: "/admin?tab=oracao", icon: MessageSquare, label: "Pedidos de oração" },
  { to: "/admin?tab=leads", icon: Send, label: "Leads missionários" },
  { to: "/admin?tab=plano", icon: CalendarDays, label: "Plano de leitura" },
  { to: "/admin?tab=usuarios", icon: Users, label: "Usuários" },
];

export function AdminLayout({
  active,
  onChange,
  email,
  children,
}: {
  active: string;
  onChange: (tab: string) => void;
  email?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/40 sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-border">
          <NavLink to="/" className="block">
            <p className="text-[10px] uppercase tracking-[0.3em] text-coral-deep font-semibold">
              Painel
            </p>
            <p className="font-serif text-xl mt-1">Fonte de Alegria</p>
          </NavLink>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const tab = new URL("http://x" + it.to).searchParams.get("tab") ?? "overview";
            const isActive = active === tab || (tab === "overview" && active === "overview");
            const Icon = it.icon;
            return (
              <button
                key={it.label}
                onClick={() => onChange(tab)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {it.label}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground truncate" title={email}>
            {email}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {/* Mobile top tabs */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex gap-1 overflow-x-auto px-3 py-2">
          {items.map((it) => {
            const tab = new URL("http://x" + it.to).searchParams.get("tab") ?? "overview";
            const isActive = active === tab;
            return (
              <button
                key={it.label}
                onClick={() => onChange(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 min-w-0 lg:pt-0 pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}