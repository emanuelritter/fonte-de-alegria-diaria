
## Objetivo

Transformar os carrosséis de "editorial dark minimalista" em **artes vibrantes, virais e curiosas**, usando a paleta solar do projeto (coral nascente, teal profundo, areia, dourado), e corrigir o botão de Stories que está apresentando o aviso `Unable to restore scroll position for cloned document` durante a captura.

---

## 1. Novo design dos carrosséis (7 slides 1080×1080)

### Paleta — alinhada com `index.css`
- Coral `#F1684E` / Coral deep `#D5482E` — energia, urgência, fundo principal
- Teal `#0F4451` / Teal deep `#0B3640` — profundidade, autoridade
- Areia `#FFE9C7` / Areia quente `#F4D9A6` — calor, leitura confortável
- Dourado `#F4C04D` / Dourado claro `#FFD77A` — destaque, fé, luz
- Off-white `#FFF6E8` — texto sobre fundos escuros

### Sistema visual (viralidade controlada)
Cada slide alterna **fundo cheio de cor** + **tipografia editorial gigante** + **elementos gráficos** (arcos solares, círculos concêntricos, blocos diagonais) puxados do template do Stories. Não é mais "tudo preto com texto bege".

**Slide 1 — GANCHO** (mais importante, precisa parar o scroll)
- Fundo coral pleno com gradiente sunrise no rodapé
- Sol nascendo (arcos dourados concêntricos) atrás do texto
- Pergunta-gancho em Fraunces itálico **bold gigante** (até 110px), branco creme
- Selo "DEVOCIONAL · [DATA]" no topo em cápsula dourada
- "Deslize →" piscando no rodapé com seta animada (estática no PNG)

**Slide 2 — CONTEXTO**
- Fundo areia (`#FFE9C7`) com bloco coral diagonal cobrindo 40% à direita
- Label "ONDE VOCÊ ESTÁ" em cápsula teal
- Texto em Fraunces itálico 60px, teal profundo

**Slide 3 — VERSÍCULO** (peça-chave compartilhável)
- Fundo teal profundo com textura de gradient deep
- Card central com borda dourada dupla (arquetípico de pôster bíblico)
- Versículo em Fraunces itálico 38px, branco creme
- Referência em cápsula dourada sólida com texto teal

**Slide 4 — REFLEXÃO**
- Fundo coral deep com bloco de areia atravessando na diagonal inferior
- Reflexão em Fraunces 56px, branco; palavra `*destacada*` em **dourado com sublinhado ondulado**
- Aspas decorativas grandes em dourado translúcido (200px) atrás do texto

**Slide 5 — PARA HOJE** (ações práticas)
- Fundo areia com 3 cards empilhados, cada um com cor diferente (coral, teal, dourado)
- Cada ação numerada (01, 02, 03) em mono grande do lado esquerdo
- Texto da ação em Inter 32px bold

**Slide 6 — PENSE NISSO** (engajamento)
- Fundo gradient sunrise (coral→dourado→teal vertical)
- Pergunta em Fraunces itálico bold 68px, branco creme
- Ícone marcador de página dourado + "Salve · Comente · Compartilhe" em rodapé

**Slide 7 — CTA** (conversão para o site)
- Fundo teal deep com sol grande dourado no canto
- "Leia o devocional completo" em Fraunces 60px branco
- URL `fontedealegria.com.br` em cápsula coral grande, clicável visualmente
- `@fontedealegriadiaria` abaixo em dourado
- Microcopy: "Toque no link da bio →"

### Elementos decorativos consistentes (todos os slides)
- Selo "01/07" em cápsula no topo direito (não monoespaçada, mais visível)
- Logo "Fonte de Alegria" em script dourado no rodapé esquerdo
- Linha dourada decorativa sutil em pelo menos um eixo

---

## 2. Correção do botão "Baixar arte para Stories"

**Sintoma observado nos console logs:** múltiplas mensagens `Unable to restore scroll position for cloned document` vindas do `html2canvas`. Isso é um warning não-fatal, mas indica que algo na geração está demorando ou falhando silenciosamente.

**Causa real (após inspeção do código):** o componente `CompartilharInstagram` usa `renderStoryPNG` (Canvas2D nativo, **não html2canvas**). Os warnings vêm provavelmente do **carrossel antigo** (`gerar-carrossel-devocional` + `renderCarrosselZIP`), não do Story.

**Correções:**
1. Verificar e corrigir o fluxo do botão Stories: garantir que `ensureFonts()` aguarde corretamente Fraunces+Inter antes do desenho (já faz, mas adicionar `document.fonts.ready` como segundo gate).
2. Tratamento de erro mais visível: hoje, se o asset `sun-icon.png` falhar, o Story renderiza sem o sol mas sem aviso. Adicionar log no toast quando o sol não carrega.
3. Atualizar o template do Story para refletir a **mesma linguagem visual nova** dos carrosséis (consistência de marca): manter estrutura atual mas reforçar paleta com mais dourado, melhorar contraste do hook.
4. **Remover o html2canvas do fluxo dos novos carrosséis** — substituir por renderização Canvas2D nativa (igual o Story), o que elimina os warnings, melhora qualidade do PNG (texto vetorial nítido) e a velocidade.

---

## 3. Mudanças técnicas

| Arquivo | Mudança |
|---|---|
| `src/components/carrossel/SlideCanvas.tsx` | Reescrever com nova paleta, fundos por slide e elementos gráficos |
| `src/lib/carrosselSlides.ts` | Adicionar tokens de cor centralizados (CARROSSEL_COLORS) |
| `src/lib/carrosselCanvas.ts` (novo) | Renderização Canvas2D nativa para export PNG (substitui html2canvas) |
| `src/pages/GerarCarrossel.tsx` | Trocar export de html2canvas por renderização canvas; preview continua React/DOM |
| `src/components/carrossel/SlidePreview.tsx` | Atualizar fundo do panel para tom areia em vez de quase-preto |
| `src/lib/storyTemplate.ts` | Reforçar paleta, melhorar hierarquia, garantir contraste do hook |
| `src/components/CompartilharInstagram.tsx` | Melhorar mensagens de erro e estado de loading |
| `package.json` | Remover `html2canvas` (não será mais necessário) |

---

## 4. Critérios de pronto

- Cada slide tem **identidade visual distinta** mas coesa (mesmo selo, mesma assinatura, mesma família tipográfica)
- Slide 1 é "instagrammável" — alguém vê no feed e para
- Slide 3 (versículo) funciona como peça compartilhável standalone
- Slide 7 deixa **claro** que tem mais conteúdo no site
- Story baixa sem warnings no console
- PNG exportado tem texto nítido (vetorial, não rasterizado pelo html2canvas)
- Tudo renderiza igual entre preview e PNG final (single source of truth: `carrosselCanvas.ts` desenha; React mostra a mesma coisa via espelho DOM)
