## Objetivo

Você quer continuar no Lovable Cloud por enquanto, mas ter pronto o **SQL de schema** para subir no seu Supabase próprio (projeto `czffqtxddysupajuiqea`) quando migrar para Hostinger. Nada no app muda — só geramos um artefato para download.

## O que será entregue

Um único arquivo: `/mnt/documents/schema-migracao-supabase.sql`

Conteúdo (estrutura vazia, sem dados):

1. **Enums**
   - `app_role` (admin, moderator, user)
   - `historia_status` (pendente, aprovada, etc. — confirmado via query)

2. **Tabelas** (com colunas, defaults, NOT NULL e PKs)
   - `user_roles`
   - `devocionais`
   - `devocionais_fonte`
   - `historias`
   - `pedidos_oracao`
   - `plano_leitura`

3. **Funções** (SECURITY DEFINER, com `search_path = public`)
   - `set_updated_at()`
   - `has_role(uuid, app_role)`
   - `is_current_user_admin()`
   - `admin_list_historias()`
   - `admin_list_users()`

4. **RLS** — `ENABLE ROW LEVEL SECURITY` + todas as policies de cada tabela exatamente como estão hoje.

5. **Comentário no topo** com instruções:
   - Rodar no SQL Editor do projeto `czffqtxddysupajuiqea`.
   - Criar manualmente o usuário admin (`emanuelritter@gmail.com`) via Authentication → Users.
   - Depois inserir a role: `INSERT INTO user_roles (user_id, role) VALUES ('<uuid-do-novo-admin>', 'admin');`
   - Configurar os secrets das edge functions (`LOVABLE_API_KEY` precisará virar `OPENAI_API_KEY` ou similar quando você sair do Cloud — fica para depois, conforme combinado).
   - Atualizar `.env` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`) no projeto hospedado na Hostinger apontando para o novo Supabase.

## O que NÃO será feito agora

- Não altero `.env`, `client.ts` nem desconecto o Lovable Cloud (quebraria o app em produção).
- Não migro dados (devocionais, histórias, pedidos, usuários). Quando quiser migrar dados também, é só pedir e eu gero um segundo SQL com `INSERT`s.
- Não mexo nas edge functions agora (vão continuar funcionando no Cloud).

## Passos técnicos da implementação

1. Consultar via `supabase--read_query` os enums (`pg_type`) para pegar todos os valores de `historia_status` e confirmar `app_role`.
2. Montar o `.sql` na ordem correta (extensions opcionais → enums → funções sem dependência de tabelas → tabelas → demais funções → policies).
3. Salvar em `/mnt/documents/schema-migracao-supabase.sql`.
4. Entregar via `<lov-artifact>` para download.

## Próximo passo (quando você quiser)

Quando estiver pronto para efetivamente migrar:
- Te ajudo a desconectar o Lovable Cloud, trocar `.env`/`client.ts` para o Supabase próprio, e reescrever as edge functions com sua própria chave de IA.
