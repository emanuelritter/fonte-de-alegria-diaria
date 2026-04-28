## Resumo

Duas tarefas independentes:
1. Garantir admin `emanuelritter@gmail.com` com senha `R1tter@2026`
2. Criar `/gerar-carrossel`: ferramenta editorial dark de 7 slides 1080×1080 com preview ao vivo, exportação PNG e botão de pré-preenchimento via IA

---

## Passo 1 — Admin

O usuário já existe no banco (`00f0637b-c3dc-4752-9620-b32ba11f832a`). Migration única:

- `UPDATE auth.users SET encrypted_password = crypt('R1tter@2026', gen_salt('bf')), email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE id = '00f0637b-...'`
- `INSERT INTO public.user_roles (user_id, role) VALUES ('00f0637b-...', 'admin') ON CONFLICT DO NOTHING`

Após rodar você já entra em `/auth` com essa senha. Recomendo trocar depois pela tela "Esqueci minha senha" (posso adicionar essa tela em outro momento se quiser).

---

## Passo 2 — Página `/gerar-carrossel`

### Roteamento e proteção

- Nova rota `/gerar-carrossel` em `src/App.tsx`.
- Guarda via `useAuth`: enquanto `loading` mostra placeholder; se `!user` redireciona para `/auth?redirect=/gerar-carrossel`.
- Link "Carrossel" no `Navbar` (desktop e mobile drawer), visível **apenas** quando `user` está autenticado (não exige admin — qualquer usuário logado usa).

### Arquivos a criar

```
src/pages/GerarCarrossel.tsx              ← página + form + estado + export
src/components/carrossel/SlideCanvas.tsx  ← um único slide 1080×1080
src/components/carrossel/SlidePreview.tsx ← painel direito (canvas escalado + nav)
src/lib/carrosselSlides.ts                ← tipo CarrosselData + parser do *destaque*
supabase/functions/gerar-carrossel-editorial/index.ts  ← nova edge function (7 campos)
supabase/config.toml                       ← adicionar function (verify_jwt = true)
```

A page atual `/compartilhar` e o template antigo (`carrosselTemplate.ts`, edge function `gerar-carrossel-devocional`) **ficam intactos** — convivem.

### Layout

```
┌─────────────────────────────────────────────┐
│ Navbar                                      │
├──────────────┬──────────────────────────────┤
│ FORM 420px   │  PREVIEW (bg #1A1B19)        │
│ scrollable   │  ┌──────────────┐            │
│              │  │  1080x1080   │  scale fit │
│ Identificação│  │  slide canvas│            │
│ Conteúdo     │  └──────────────┘            │
│ Gerar com IA │  ● ● ● ● ● ● ●  (dots 1..7)  │
│ Limpar       │  ← Anterior   Próximo →      │
│              │  [ Baixar slides ]           │
└──────────────┴──────────────────────────────┘
```

Mobile (<768px): empilhado, form em cima, preview embaixo (preview com `position: sticky` no desktop).

### Componente SlideCanvas

Div `1080×1080`, `transform: scale(var(--s))` para caber no painel. Render fiel para html2canvas. Implementa as 4 partes:
- bg `#0E0F0D`, padding 72px
- linha de acento (top 72/left 72, 44×2, gold #C8963A)
- brand mark "Fonte de Alegria" (bottom 52, left 72, Fraunces ital 13, #3A3530)
- contador "01/07" (bottom 52, right 72, mono 13, #4A4540)

Renderiza o conteúdo de cada slide (1 a 7) exatamente como especificado: tipografia, cores, espaçamentos, divisores, borda esquerda dourada no slide 3, parser de `*palavra*` → `<span style={{color:'#C8963A'}}>` no slide 4, lista com `—` no slide 5.

Fonte Fraunces injetada via `<link>` dentro do componente (montagem condicional única), Inter já existe no projeto. Antes de exportar, `await document.fonts.ready`.

### Estado e formulário

Tipo:
```ts
type CarrosselData = {
  data: string; titulo: string;
  gancho: string; contexto: string;
  versiculo: string; referencia: string;
  reflexao: string; aplicacao: string;
  pergunta: string;
};
```

- React state controlado, sincronizado com `localStorage["fda-carousel-draft"]` em todo `onChange` (debounce 300ms).
- "Limpar tudo" abre `<AlertDialog>` shadcn → confirma → reset + remove do localStorage.

### Pré-preenchimento via IA (botão opcional)

Bloco "Gerar com IA" no topo do form:
- Select "Devocional do banco" (lista os últimos 30 publicados via `supabase.from('devocionais').select`) **OU** campo livre "tema/versículo".
- Botão "Gerar com IA" → `supabase.functions.invoke('gerar-carrossel-editorial', { body: { devocional_id } | { tema, versiculo } })`.
- Edge function `gerar-carrossel-editorial`:
  - JWT verificado, exige usuário autenticado.
  - Chama Lovable AI Gateway (`google/gemini-2.5-flash`) com tool calling para retornar exatamente os 7 campos do novo layout (gancho ≤12 palavras, contexto ≤30, versículo curto, reflexão com `*palavra*` marcando o destaque dourado, aplicação com 3 linhas separadas por `\n`, pergunta ≤15 palavras).
  - Trata 429 e 402 com mensagens específicas.
  - Não persiste nada — só devolve JSON; o front faz `setForm(data)`.
- Toasts via `sonner`.

### Navegação

- 7 dots clicáveis (active `#C8963A`, inactive `#2A2520`).
- Botões Prev/Next (shadcn Button ghost).
- Estado `currentSlide: 1..7`.

### Exportação PNG

- `bun add html2canvas`.
- Botão "Baixar slides":
  1. `await document.fonts.ready`
  2. Renderiza temporariamente os 7 slides em DOM offscreen (visibility hidden, no scale) ou itera mostrando cada um.
  3. Para cada um: `html2canvas(node, { scale: 1, backgroundColor: '#0E0F0D', useCORS: true })` → blob → download `fda-slide-01.png` ... `fda-slide-07.png`.
  4. Estado de progresso: "Exportando 3 de 7…" no botão.
  5. Sucesso → `toast.success("7 slides baixados com sucesso!")`.

### Tokens de design

Cores hardcoded **dentro do SlideCanvas** (são tokens de marca do post, não do app — não vão para `index.css`). Tudo o que é UI ao redor (botões, inputs, painéis) usa os tokens semânticos existentes do projeto.

---

## O que NÃO muda

- Página `/compartilhar` atual permanece.
- Edge function `gerar-carrossel-devocional` permanece (usada pela `/compartilhar`).
- `carrosselTemplate.ts` permanece.
- Schema do banco não muda.

---

## Ordem de execução

1. Migration: senha admin + role.
2. Criar nova edge function `gerar-carrossel-editorial` + entrada no `config.toml`.
3. Instalar `html2canvas`.
4. Criar `carrosselSlides.ts`, `SlideCanvas.tsx`, `SlidePreview.tsx`, `GerarCarrossel.tsx`.
5. Adicionar rota em `App.tsx` e link no `Navbar.tsx`.
6. QA visual no preview (1000×770) e validar export PNG.
