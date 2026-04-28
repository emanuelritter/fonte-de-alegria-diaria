# Mostrar acesso de admin no menu

Hoje a página `/auth` (login) e `/admin` existem, mas não há link visível para elas — só quem digita a URL chega lá. Vamos adicionar um item no menu (tanto na barra do topo no desktop quanto no menu de 3 barras no mobile) que muda conforme o estado do usuário.

## Comportamento

Usando o hook `useAuth` (já existe em `src/hooks/useAuth.ts`), o item exibido será:

- **Não logado** → "Entrar" → leva para `/auth`
- **Logado e admin** → "Admin" (com ícone de escudo) → leva para `/admin`
- **Logado mas não admin** → "Sair" → faz `supabase.auth.signOut()` e volta para `/`

Isso evita poluir o menu para visitantes comuns e ao mesmo tempo dá um caminho claro para a equipe entrar e administrar.

## Onde aparece

- **Desktop (≥ lg):** como último item da `<nav>` no `Navbar`, visualmente destacado (botão arredondado em vez de link de texto) para diferenciar das páginas públicas.
- **Mobile (menu hamburguer):** dentro da gaveta que abre, abaixo dos demais links, com um separador sutil acima.

## Mudanças técnicas

Arquivo único: `src/components/Layout/Navbar.tsx`

- Importar `useAuth` e `supabase`.
- Importar ícones `LogIn`, `Shield`, `LogOut` do `lucide-react`.
- Adicionar um helper `AuthAction` interno que decide qual item renderizar com base em `loading`, `user`, `isAdmin`.
- Reutilizar o mesmo componente nas duas seções (desktop e mobile) com uma prop `variant` para ajustar o estilo (pill no desktop, item de lista no mobile).
- Enquanto `loading` for `true`, não renderizar nada (evita flicker mostrando "Entrar" e depois "Admin").

## O que NÃO muda

- Nenhuma alteração em rotas, design geral, cores, tipografia.
- Nenhuma mudança no backend, RLS ou na lógica de `is_current_user_admin`.
- Os links públicos (Devocional, Plano, Histórias, Oração, Conecte, Sobre) continuam iguais.
