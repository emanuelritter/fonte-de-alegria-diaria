## Objetivo

Quatro correções pontuais, sem mudar o design geral do site nem dos carrosséis.

---

### 1. Botão "Baixar arte para Stories" parou de funcionar

**Causa provável:** `renderStoryPNG` (em `src/lib/storyTemplate.ts`) carrega `@/assets/sun-icon.png`. Se esse asset estiver ausente/corrompido, ou se a edge function `gerar-hook-devocional` falhar, o botão "trava" sem baixar.

**Correções em `src/components/CompartilharInstagram.tsx` e `src/lib/storyTemplate.ts`:**
- Garantir que `loadImage` realmente continue silenciosamente quando o ícone do sol falhar (já tem `try/catch`, mas confirmar e adicionar fallback visual: desenhar um sol vetorial simples se a imagem não vier).
- Em `baixarStory`, logar o erro real no console com `console.error("[Stories]", e)` e mostrar mensagem específica para cada caso (sem hook gerado, falha no canvas, falha no asset).
- Acrescentar `await ensureFonts()` antes de qualquer `measureText` (já existe, mas validar a ordem) e um `try/finally` que libere o `setLoadingStory(false)` mesmo em re-render.

### 2. Em `/gerar-carrossel`, baixar os 7 slides em ZIP (não 7 downloads separados)

**Estado atual em `src/pages/GerarCarrossel.tsx`:** Loop dispara `downloadBlob(...)` 7×, e o navegador (especialmente Chrome/Safari) bloqueia downloads múltiplos automáticos — só o último passa.

**Correção:**
- Importar `JSZip` (já instalado).
- Em `baixarSlides`, gerar os 7 PNGs com `renderSlidePNG(form, i)`, adicionar cada um ao zip como `slide-01.png` … `slide-07.png`.
- Adicionar também `legenda.txt` com um placeholder (ex.: título + data + link), para alinhar com o ZIP do gerador da página de devocionais.
- Baixar o `.zip` final via `downloadBlob` com nome `fda-{data}-{slug}.zip`.
- Atualizar o estado `exporting` para mostrar "Empacotando…" no último passo.

### 3. Slide 1 do carrossel da página Devocionais — texto sobrepõe a arte

**Estado atual em `src/lib/carrosselTemplate.ts` → `slide1`:** O hook é centralizado verticalmente em cima do sol grande (480–520px no centro). Em devocionais com hook longo, o texto cobre o sol e fica ilegível.

**Correção (apenas ajuste, sem rebuild):**
- Em `drawSplitHero`: reduzir o sol para ~360px e movê-lo para a parte de baixo (centro do bloco teal inferior, em torno de `H * 0.72`), mantendo a divisão coral/teal.
- Em `slide1`: posicionar o hook na **metade superior coral** (entre y≈260 e y≈H/2 - 40), com `textBaseline = "middle"` e auto-shrink já existente (`size = hook.length > 70 ? 64 : ...`), reduzindo um degrau (`56 / 70 / 84`) para garantir folga.
- Adicionar uma faixa coral-deep semi-transparente atrás do hook (rounded-rect com `rgba(11,54,64,0.18)` e `blur` simulado por sombra) para reforçar contraste em qualquer cenário.
- Manter a etiqueta "DEVOCIONAL DO DIA" e o "arrasta →" onde estão.

Importante: este é o **template 1080×1350** usado pelo botão da página `/devocional/:data` (via `CompartilharInstagram`). O gerador de `/gerar-carrossel` (template 1080×1080 em `carrosselCanvas.ts`) **não é tocado** — os dois geradores continuam coexistindo, conforme pedido.

### 4. Home — palavra "fonte de alegria" some no sol branco

**Estado atual em `src/pages/Index.tsx`:** O `<h1>` é `text-white drop-shadow-lg` sobre `heroImg` (sol nascente). Quando o sol cai atrás do título, o branco no branco apaga.

**Correção:**
- Adicionar **gradient overlay** mais forte atrás do título: substituir o `bg-gradient-to-b from-transparent via-transparent to-background/95` por um gradiente diagonal que escureça também a parte esquerda inferior onde mora o título. Ex.: combinar duas camadas — uma `from-tealDeep/45 via-transparent` (esquerda → direita) e a atual de baixo.
- Trocar `drop-shadow-lg` por uma sombra mais densa no título (`[text-shadow:0_4px_24px_rgba(11,54,64,0.55)]` via classe arbitrária Tailwind), garantindo legibilidade em qualquer posição do sol.
- Manter cor branca (preserva a identidade visual).

---

## Arquivos editados

- `src/components/CompartilharInstagram.tsx` — mensagens de erro e logging do botão Stories.
- `src/lib/storyTemplate.ts` — fallback do ícone do sol.
- `src/pages/GerarCarrossel.tsx` — exportação em ZIP único.
- `src/lib/carrosselTemplate.ts` — `slide1` reposicionado para legibilidade.
- `src/pages/Index.tsx` — overlay e text-shadow do hero.

Nenhuma migração de banco. Nenhuma edge function alterada.
