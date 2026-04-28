## Aba "Usuários & Admins" no painel — gestão de papéis

### Diagnóstico do erro 503 atual

Os 503 (`PGRST002 / Could not query the database for the schema cache`) que apareceram no replay são **transitórios** — acontecem por alguns segundos após uma migration enquanto o PostgREST rebuilda o cache do schema (acabamos de adicionar 4 colunas). Validei agora consultando o banco e ele já está respondendo normal. Não é um bug do código; resolve sozinho. **Não precisa de mudança para isso.**

### O que está faltando funcionalmente

Hoje só existe uma forma de virar admin: rodando SQL manualmente. O painel não lista usuários nem permite promover/rebaixar. Vou adicionar isso.

### Mudanças

**1. Backend — função SECURITY DEFINER `admin_list_users()`**

Como a tabela `auth.users` não pode ser lida via PostgREST a partir do client, criar uma RPC que retorna a união de `auth.users` + `public.user_roles`, restrita a admins:

```sql
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz, is_admin boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
    SELECT u.id, u.email::text, u.created_at,
           EXISTS(SELECT 1 FROM public.user_roles r
                  WHERE r.user_id = u.id AND r.role = 'admin') AS is_admin
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
```

A RLS de `user_roles` já bloqueia inserts/deletes de não-admins (policy restritiva existente), então o INSERT/DELETE direto pelo client funciona apenas para admins logados. **Sem novas policies necessárias.**

**2. Frontend — nova aba "Usuários" no Admin**

- Adicionar `<TabsTrigger value="usuarios">Usuários</TabsTrigger>` (entre "Leads Missionários" e "Plano").
- Novo componente `AdminUsuarios`:
  - Query: `supabase.rpc("admin_list_users")` → lista todos os usuários com flag `is_admin`.
  - Métricas no topo: **Total de usuários** / **Admins** / **Pendentes** (não-admins).
  - Cards/linhas por usuário mostrando:
    - Email
    - Data de cadastro (pt-BR)
    - Badge: verde "Admin" ou cinza "Usuário"
    - **Botão "Tornar admin"** (visível quando `!is_admin`) → `insert` em `user_roles`.
    - **Botão "Remover admin"** (visível quando `is_admin` e o usuário não é o próprio logado, para evitar lockout) → `delete` em `user_roles` filtrando `user_id` + `role='admin'`.
  - Após cada ação, invalidar a query.
  - Toast de sucesso/erro.

**3. Salvaguardas**

- Não permitir que o admin remova o próprio status (botão escondido quando `user_id === user.id`) — evita auto-lockout.
- O `useAuth` continua chamando `is_current_user_admin` (sem mudança), e o gate de acesso à página admin segue funcionando.

### Detalhes técnicos
- Sem nova policy em `user_roles` — as existentes ("Admins can manage roles" + restritiva de INSERT) já cobrem o uso.
- A função usa `SECURITY DEFINER` porque `auth.users` não é exposto via PostgREST direto; o check `has_role` interno garante que só admins veem a lista.
- Erros 503 transitórios pós-migration: documentados, não há fix de código.
