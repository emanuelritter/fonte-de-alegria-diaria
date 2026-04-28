# Simplificar autenticação para apenas e-mail/senha

Sua aplicação **já usa apenas e-mail/senha** na página de login (`src/pages/Auth.tsx`). O que existe de Google/OAuth é apenas código morto deixado pela infraestrutura do Lovable Cloud. Vou remover esse código residual e a dependência relacionada.

Sobre a **migração para Hostinger + Supabase próprio**: isso é uma mudança de infraestrutura externa (criar um projeto Supabase na sua conta, atualizar as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, e fazer deploy do build estático na Hostinger). O código abaixo já fica 100% compatível com qualquer projeto Supabase padrão — basta trocar as credenciais quando você for migrar.

## O que será feito

1. **Remover o módulo OAuth do Lovable**
  - Apagar a pasta `src/integrations/lovable/` (não é importada por nenhum componente).
  - Remover a dependência `@lovable.dev/cloud-auth-js` do `package.json`.
2. **Remover a página de callback OAuth não utilizada**
  - Apagar `src/pages/AuthCallback.tsx` (não está registrada em nenhuma rota).
3. **Manter intactos os fluxos atuais**
  - `src/pages/Auth.tsx`: já tem apenas abas "Entrar" e "Criar conta" com e-mail/senha — sem alterações.
  - `src/hooks/useAuth.ts`: usa apenas `supabase.auth` padrão — sem alterações.
  - `src/components/Layout/Navbar.tsx`: botões Entrar / Admin / Sair continuam funcionando — sem alterações.
  - Banco, RLS, função `is_current_user_admin` e painel Admin: sem alterações.

## Detalhes técnicos

Arquivos removidos:

- `src/integrations/lovable/index.ts`
- `src/pages/AuthCallback.tsx`

`package.json`: remover a linha `"@lovable.dev/cloud-auth-js": "^1.1.2"`.

Resultado: codebase de auth fica enxuto, sem dependências de OAuth, e totalmente portável para um Supabase hospedado na sua conta. Para a migração futura, você só precisará atualizar `.env` com a URL e a chave anônima do novo projeto Supabase — nenhuma mudança de código será necessária.

## Próximo passo (depois desta limpeza)

Quando você criar o projeto Supabase na sua conta e quiser migrar, me avise. Eu te oriento a:

- Exportar o schema atual (tabelas, RLS, funções) como SQL.
- Importar no novo Supabase.
- Atualizar as variáveis de ambiente no build da Hostinger.

Aprove o plano e eu aplico a limpeza.