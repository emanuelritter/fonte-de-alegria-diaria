## Plano de melhorias funcionais e estratégicas

Aplico 9 correções pontuais — sem mexer no design visual, sem criar gerador de carrossel.

### FIX 1 — Links sociais

Substituir em `Navbar.tsx`, `Footer.tsx`, `Index.tsx`, `Conecte.tsx` (e qualquer outro):

- `https://instagram.com` → `https://www.instagram.com/fontedealegriadiaria/`
- `https://youtube.com` → `https://www.youtube.com/@fontedealegriadiaria`
- Garantir `target="_blank" rel="noreferrer"` em todos.

### FIX 2 — Geolocalização no `CtaFunil`

Em `src/components/CtaFunil.tsx`:

- Adicionar `useState<number>(2)` para `nivel` interno (default 2) usado quando o prop não é passado.
- `useEffect` no mount: chama `navigator.geolocation.getCurrentPosition` silenciosamente.
- Sucesso → calcula Haversine vs Indaiatuba (-23.0896, -47.2183). `<= 80km` → `nivel=1`; senão `nivel=2`.
- Falha/negação → mantém `nivel=2`.
- Função `haversineKm` inline conforme especificação.
- Se a página passou `nivel` por prop (Devocional.tsx faz isso), respeita o prop; caso contrário usa o estado calculado.

### FIX 3 — Campo "interesse_contato" nos formulários

**Migration** nova `supabase/migrations/...interesse_contato.sql`:

```sql
ALTER TABLE public.pedidos_oracao ADD COLUMN interesse_contato boolean NOT NULL DEFAULT false;
ALTER TABLE public.historias ADD COLUMN interesse_contato boolean NOT NULL DEFAULT false;
ALTER TABLE public.pedidos_oracao ADD COLUMN encaminhado_em timestamptz;
ALTER TABLE public.historias ADD COLUMN encaminhado_em timestamptz;
GRANT SELECT (interesse_contato, encaminhado_em) ON public.historias TO anon, authenticated;
```

(Re-conceder grants nas colunas novas de `historias` para manter o padrão column-level já em vigor.)

`**Oracao.tsx**`: adicionar checkbox `interesse_contato` antes do botão; estender schema Zod e estado; incluir no `insert`.

`**Compartilhar.tsx**`: idem, logo após o checkbox de consentimento.

### FIX 4 — Aba "Leads Missionários" no Admin

Em `src/pages/Admin.tsx`:

- Adicionar `<TabsTrigger value="leads">Leads Missionários</TabsTrigger>` entre "oracao" e "leitura".
- Novo componente `AdminLeads`:
  - Query `pedidos_oracao` onde `interesse_contato=true`.
  - Query `historias` onde `interesse_contato=true`.
  - Mescla com campo `source` ("Pedido de Oração" | "História"), ordena por `created_at desc`.
  - Métricas no topo: Total / Pendentes / Encaminhados.
  - Cards com Nome (ou "Anônimo"), Contato (ou "—"), badge source, data pt-BR, badge Encaminhado/Pendente.
  - Botão "Encaminhar" (oculto se `encaminhado_em` setado) → `update({ encaminhado_em: new Date().toISOString() })` na tabela correta + invalidate.

A coluna `encaminhado_em` é criada no mesmo migration do FIX 3.

### FIX 5 — SEO com `react-helmet-async`

- `bun add react-helmet-async`
- `main.tsx`: envolve `<App />` em `<HelmetProvider>`.
- Criar `src/components/SEO.tsx` exatamente como especificado.
- Aplicar `<SEO ... />` em: `Index.tsx`, `Devocional.tsx` (dinâmico, usando `dev?.titulo` e `dev?.meditacao` → strip HTML + slice 155), `Oracao.tsx`, `Historias.tsx`, `Conecte.tsx`, `Sobre.tsx`.

### FIX 6 — Canonical, robots, theme-color

Em `index.html` `<head>`:

```html
<link rel="canonical" href="https://fontedealegria.com.br"/>
<meta name="robots" content="index, follow"/>
<meta property="og:site_name" content="Fonte de Alegria"/>
<meta name="theme-color" content="#C4533A"/>
```

Manter o `<title>` já existente (`Fonte de Alegria — Devocional Diário`).

### FIX 7 — Conteúdo do `Conecte.tsx`

Atualmente o arquivo já tem textos preenchidos (não vazios) mas com conteúdo levemente diferente do solicitado. Vou alinhar com o texto pedido:

- Igreja: descrição, endereço "Rua Ademar de Barros, 1498 — Cidade Nova I, Indaiatuba SP", horário "Sábado 9h00 (Escola Sabatina) e 10:15h (Culto Divino)", botão "Ver no Instagram" → `https://www.instagram.com/iasdcentralindaiatuba/`.
- Novo Tempo: descrição reduzida + 3 itens de lista conforme spec, botão "Acessar Novo Tempo".
- Pequenos Grupos: descrição + 3 itens; botão "Quero participar" usando `<Link to="/oracao">` (componente `Link`, variant outline rounded-full) — substitui o `<a href="https://wa.me/">` atual.

### FIX 8 — Footer

Em `Footer.tsx`, substituir os textos atuais pelos solicitados:

- Parágrafo da marca, título "Explorar" e links da primeira coluna, título "Conecte-se" e links da segunda coluna, copyright "© 2025 Fonte de Alegria. Feito com propósito para a glória de Deus."

### FIX 9 — Navbar brand

Em `Navbar.tsx`, o brand já mostra "fonte de" + "alegria" via duas spans. Confirmar que o conteúdo é exatamente:

- `<span class="text-foreground">fonte de </span>`
- `<span class="text-gradient-warm font-bold">alegria</span>`
(O arquivo atual já está assim; nenhuma mudança real necessária — apenas verificação.)

### O que NÃO será alterado

- Design visual, cores, fontes, gradientes.
- Templates de carrossel/stories (`carrosselTemplate.ts`, `storyTemplate.ts`) — já entregues em iteração anterior.
- Layouts de Devocional, Historias, PlanoLeitura, Auth, Compartilhar (apenas adição do checkbox em Compartilhar e do `<SEO/>` em algumas).
- Estrutura de rotas em `App.tsx`.
- Estrutura da integração Supabase (apenas as 2 colunas novas).

### Detalhes técnicos

- `react-helmet-async` é SSR-safe e leve; necessário envolver com `HelmetProvider`.
- Updates em `historias`/`pedidos_oracao` via Admin já passam pela RLS de admin existente — sem novas policies.
- O `column-level GRANT` precisa ser re-emitido para incluir as colunas novas (caso contrário leitores anon/authenticated não as veem).
- Geolocalização: chamada apenas no client; sem prompt customizado (apenas o nativo do browser).