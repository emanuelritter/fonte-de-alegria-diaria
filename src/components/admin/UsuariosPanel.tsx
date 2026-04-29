import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldCheck, Users, UserPlus, ShieldOff } from "lucide-react";
import { SearchInput } from "./shared/SearchInput";

type AppUser = { user_id: string; email: string; created_at: string; is_admin: boolean };

export function UsuariosPanel({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePass, setInvitePass] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(true);
  const [inviting, setInviting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error; return (data ?? []) as AppUser[];
    },
  });

  const promote = async (u: AppUser) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: u.user_id, role: "admin" });
    if (error) { toast.error(error.message); return; }
    toast.success(`${u.email} agora é admin.`);
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
    qc.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
  };
  const demote = async (u: AppUser) => {
    if (!confirm(`Remover permissão de admin de ${u.email}?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", u.user_id).eq("role", "admin");
    if (error) { toast.error(error.message); return; }
    toast.success(`${u.email} não é mais admin.`);
    qc.invalidateQueries({ queryKey: ["admin", "users"] });
    qc.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
  };

  const convidar = async () => {
    if (!inviteEmail.trim()) { toast.error("Informe o email."); return; }
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-invite-user", {
        body: { email: inviteEmail.trim(), password: invitePass.trim() || undefined, make_admin: makeAdmin },
      });
      if (error) throw error;
      const r = data as any;
      if (r?.password_set) {
        toast.success(`Usuário criado. Senha temporária: ${r.password_set}`, { duration: 15000 });
      } else {
        toast.success(`Usuário ${makeAdmin ? "promovido a admin" : "criado"}.`);
      }
      setInviteEmail(""); setInvitePass("");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "overview-stats"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao convidar");
    } finally {
      setInviting(false);
    }
  };

  const users = (data ?? []).filter((u) =>
    !busca.trim() || u.email.toLowerCase().includes(busca.toLowerCase()),
  );
  const admins = users.filter((u) => u.is_admin);
  const nonAdmins = users.filter((u) => !u.is_admin);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-coral-deep">Acesso</p>
        <h1 className="font-serif text-4xl mt-1">Usuários & administradores</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Promova, revogue ou convide novos administradores. Você não pode remover seu próprio acesso.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card p-4 rounded-2xl border border-border/50 text-center">
          <Users className="h-5 w-5 mx-auto text-coral-deep mb-1" />
          <p className="text-2xl font-serif">{(data ?? []).length}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border/50 text-center">
          <ShieldCheck className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-serif">{admins.length}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Admins</p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border/50 text-center">
          <Shield className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-serif">{nonAdmins.length}</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Comuns</p>
        </div>
      </div>

      {/* Convidar */}
      <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-soft space-y-4">
        <h2 className="font-serif text-2xl">Convidar usuário</h2>
        <p className="text-xs text-muted-foreground">
          Cria a conta direto na plataforma e — se marcado — já dá acesso de admin. Se a senha ficar em branco, geramos uma temporária.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2"><Label>Email</Label><Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="pessoa@email.com" /></div>
          <div><Label>Senha (opcional)</Label><Input type="text" value={invitePass} onChange={(e) => setInvitePass(e.target.value)} placeholder="—" /></div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={makeAdmin} onCheckedChange={setMakeAdmin} />
          <Label className="font-normal cursor-pointer">Conceder acesso de administrador</Label>
        </div>
        <Button onClick={convidar} disabled={inviting} className="rounded-full bg-primary hover:bg-primary-glow">
          <UserPlus className="h-4 w-4 mr-2" /> {inviting ? "Criando…" : "Convidar"}
        </Button>
      </div>

      {/* Lista */}
      <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por email" />

      {isLoading ? <p className="text-muted-foreground">Carregando usuários…</p> :
        <div className="space-y-2">
          {users.map((u) => {
            const isSelf = u.user_id === currentUserId;
            return (
              <article key={u.user_id} className="bg-card p-4 rounded-2xl border border-border/50 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-base truncate">{u.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Cadastrado em {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    {u.is_admin && <span className="ml-2 inline-flex items-center gap-1 text-primary font-semibold"><ShieldCheck className="h-3 w-3" /> admin</span>}
                    {isSelf && <span className="ml-2 text-coral-deep">· você</span>}
                  </p>
                </div>
                <div className="flex gap-1">
                  {u.is_admin ? (
                    <Button size="sm" variant="outline" disabled={isSelf} className="rounded-full" onClick={() => demote(u)}>
                      <ShieldOff className="h-4 w-4 mr-1" /> Revogar admin
                    </Button>
                  ) : (
                    <Button size="sm" className="rounded-full bg-primary hover:bg-primary-glow" onClick={() => promote(u)}>
                      <ShieldCheck className="h-4 w-4 mr-1" /> Tornar admin
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>}
    </div>
  );
}