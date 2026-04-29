# Ou Refatoração do /admin + auditoria total no Lovable Cloud

## Objetivo

Reconstruir `/admin` em um dashboard **profissional, claro e rápido** e garantir que **100% do site rode no Lovable Cloud** — banco, auth, IA (via Lovable AI Gateway), edge functions e geração de imagens — sem nenhuma dependência externa (sem APIs de terceiros, sem chaves de OpenAI/Gemini próprias, sem CDNs de fonte além do Google Fonts já usado, sem serviços externos para imagens/PDF).

---

## Estado atual (auditoria rápida)

**Banco (Lovable Cloud)** — tudo já está aqui:

- `devocionais` (91 linhas) · `devocionais_fonte` (365) · `plano_leitura` (5) · `historias` (0) · `pedidos_oracao` (0) · `user_roles` (1).
- RLS configurado corretamente em todas as tabelas, com `has_role()` SECURITY DEFINER.
- Funções: `is_current_user_admin`, `admin_list_historias`, `admin_list_users`, `set_updated_at`, `has_role`.

**Edge Functions** (todas no Cloud, usam apenas `LOVABLE_API_KEY`):

- `gerar-carrossel-editorial` (nova)
- `gerar-carrossel-devocional`
- `gerar-hook-devocional`

**Dependências externas atuais a confirmar / remover:**

- `html2canvas` no client → roda 100% no browser (ok, sem serviço externo).
- Google Fonts (Fraunces/Inter) → CDN pública gratuita, sem chave. Aceitável, mas posso self-hostar se você preferir “zero externo”.

**Problemas reais do /admin atual:**

1. Arquivo único monstro (854 linhas) com 7 sub-componentes.
2. Sem visão geral / dashboard inicial — cai direto numa aba.
3. Nenhuma busca / filtro nas listas (devocionais, leads, usuários).
4. Sem indicação de erros de carregamento (hoje só mostra “Carregando…”).
5. Sem ações em massa (publicar/despublicar, excluir várias linhas).
6. Sem visualização de `devocionais_fonte` (365 linhas paradas no banco).
7. Não dá pra criar um novo admin pelo email — só promove quem já se cadastrou.
8. Sem stats: hoje publicado? quantos rascunhos? gap de dias sem devocional?

---

## O que vou construir

### A. Nova arquitetura do /admin

```
src/pages/Admin.tsx              ← shell + guarda de auth
src/components/admin/
  AdminLayout.tsx                ← sidebar fixa + header com email + logout
  AdminOverview.tsx              ← dashboard inicial (cards + alertas)
  DevocionaisPanel.tsx           ← tabs: Calendário | Avulso | Fonte
  HistoriasPanel.tsx
  OracaoPanel.tsx
  LeadsPanel.tsx
  UsuariosPanel.tsx
  PlanoLeituraPanel.tsx
  shared/EmptyState.tsx
  shared/DataTable.tsx           ← tabela com busca + paginação reutilizável
  shared/StatCard.tsx
src/hooks/admin/
  useAdminStats.ts               ← agrega métricas em uma query
```

Roteamento: `/admin` continua como entrada, mas usa **tabs em URL** (`/admin?tab=devocionais`) para preservar estado ao recarregar.

### B. Dashboard inicial (`AdminOverview`)

Cards no topo:

- Devocional **de hoje**: publicado ✓ ou alerta vermelho “sem devocional para hoje”.
- Próximos 7 dias: x/7 prontos, y publicados.
- Histórias pendentes de aprovação.
- Pedidos de oração não atendidos.
- Leads missionários pendentes.
- Total de usuários · admins.

Lista de **alertas acionáveis** (ex.: “3 dias sem devocional publicado nesta semana → preencher”).

### C. Devocionais — visão calendário

Substitui o modo “Semana” atual por um **calendário mensal**:

- Cada dia mostra status (publicado / rascunho / vazio) com cor.
- Clicar abre drawer lateral com formulário inline (sem mudar de página).
- Botão “Importar de devocionais_fonte” em cada dia → escolhe da fonte e copia para o devocional do dia.
- Aba **Fonte**: lista paginada de `devocionais_fonte` com busca por título/referência, marca `traduzido` e mostra erro se houver.
- Aba **Avulso**: mantém formulário atual, mas reaproveitando `DataTable` na lista.

### D. Histórias / Oração / Leads / Plano

- Filtros por status, busca por nome/conteúdo.
- Ações em massa (aprovar várias histórias, marcar vários pedidos como orados).
- Botão para exportar CSV (gerado 100% no client, sem serviço externo).

### E. Usuários & Admins

- Mantém promote/demote.
- **Novo:** campo “convidar admin por email” → cria usuário via edge function `admin-invite-user` (usa `service_role` do próprio Cloud, gera senha temporária e adiciona role admin).
- Mostra última atividade (`last_sign_in_at`) já disponível em `auth.users`.

### F. Auditoria “zero dependência externa”

Verificações + ações:


| Item                               | Status                      | Ação                                                                                  |
| ---------------------------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| Banco                              | Cloud                       | nada                                                                                  |
| Auth                               | Cloud                       | nada                                                                                  |
| RLS / policies                     | Cloud                       | nada                                                                                  |
| Edge functions IA                  | Lovable AI Gateway          | nada (já usam `LOVABLE_API_KEY`)                                                      |
| Geração de PNG (carrossel/stories) | `html2canvas` no client     | ok                                                                                    |
| Fontes web                         | Google Fonts CDN            | manter (gratuito, sem chave). Se quiser “zero CDN”, baixo .woff2 para `public/fonts/` |
| Imagens                            | nenhuma externa             | confirmar grep                                                                        |
| Analytics / pixel                  | a verificar em `index.html` | remover se houver                                                                     |
| Webhooks / APIs externas           | nenhum encontrado           | confirmar grep final                                                                  |


Vou rodar grep de `https?://` em `src/`, `index.html` e `supabase/functions/` e remover qualquer referência a serviço externo encontrada (relatando antes de remover).

### G. Backend novo (mínimo)

1. **Edge function `admin-invite-user**` — cria usuário e marca como admin. Usa `SUPABASE_SERVICE_ROLE_KEY` (já existe nos secrets do Cloud).
2. **RPC `admin_overview_stats()**` — SECURITY DEFINER, retorna em uma query todas as métricas do dashboard (evita 6 queries paralelas).
3. **RPC `admin_devocional_calendar(mes date)**` — retorna status de cada dia do mês.

Sem mudanças destrutivas no schema. Apenas adições.

---

## Detalhes técnicos

- **State**: continua React Query, com `staleTime: 30s` no overview para não martelar o banco.
- **Tabela reutilizável**: input de busca + ordenação client-side + paginação (50/página). Nada de libs novas — só Tailwind + shadcn `Table`.
- **CSV export**: `Blob` + `URL.createObjectURL` no client.
- **Drawer**: shadcn `Sheet`.
- **Sidebar**: shadcn `Sidebar` (já está em `components/ui/sidebar.tsx`).
- **Sem novas dependências npm.**

---

## O que **não** vou mexer

- Schema das tabelas existentes (só adiciono RPCs).
- `src/integrations/supabase/client.ts` e `types.ts` (auto-gerados).
- Páginas públicas do site (Devocional, Histórias, etc.).
- Edge functions de IA já existentes (continuam funcionando).

---

## Entregáveis

1. `/admin` reestruturado com sidebar + dashboard + 6 painéis modulares.
2. 2 novas RPCs e 1 nova edge function (`admin-invite-user`).
3. Relatório no chat de auditoria “zero externo” com lista do que foi encontrado e removido (se houver).
4. Tudo continua rodando exclusivamente no Lovable Cloud.

Ao aprovar, eu implemento na ordem: (1) RPCs + edge function, (2) componentes base (`AdminLayout`, `DataTable`, `StatCard`), (3) painéis um a um, (4) auditoria final + relatório.