# Melhorias nas artes de Stories, Carrossel e domínio

## 1. Story — fim das sobreposições + arte mais marcante

**Problema atual:** o título, card de versículo e hook usam posições parcialmente fixas (`titleY + 200`, `H - SAFE_BOTTOM - 240`). Em dias com versículo longo (1 Pedro 4:12,13), o card cresce e invade o hook.

**Solução — layout por blocos empilhados com altura medida:**
1. Reescrever `renderStoryPNG` em `src/lib/storyTemplate.ts` usando um layout sequencial: cada bloco (etiqueta de data → título → card de versículo → hook → rodapé) é medido primeiro e empilhado com gaps mínimos garantidos.
2. Calcular o espaço disponível para o card do versículo dinamicamente (`H - rodapé - hook - título - paddings`), reduzindo automaticamente a fonte do versículo se ele ainda exceder (degraus: 38 → 34 → 30 → 26px).
3. Reduzir a fonte do hook de 38 para 34px e limitar a 2 linhas (truncar com "…" se passar) para manter área protegida estável.
4. Garantir gap mínimo de 60px entre o final do card e o início do hook; se faltar espaço, encolher título e versículo em mais um degrau.

**Arte mais marcante (menos gradiente, mais identidade):**
1. Trocar o gradiente vertical contínuo por **dois blocos de cor sólidos** com diagonal: topo coral vibrante (`#F1684E` / `#D5482E`) ocupando ~65%, base teal profundo (`#0B3640` / `#0F4451`) com uma diagonal suave separando — visual mais "pôster".
2. Adicionar **formas geométricas decorativas** (anéis concêntricos finos em dourado `#F4C04D` no canto superior direito, e um arco fino na base) para reforçar o estilo jovem.
3. Embutir o **sol PNG da identidade** (`src/assets/sun-icon.png`) carregado via `Image` no canvas e desenhado:
   - Pequeno (80px) como selo no topo, ao lado da etiqueta "DEVOCIONAL DO DIA".
   - Grande (380px) atrás do card de versículo, com `globalAlpha 0.18`, criando textura de marca em vez do gradiente radial atual.
4. Manter o card do versículo translúcido, mas com borda dourada fina (em vez de branca) para destacar.
5. Rodapé com bloco teal sólido (faixa inferior) onde aparecem `fontedealegria.com.br` + handle, mais legível.

## 2. Carrossel — estilo geométrico + cores vibrantes

Editar `src/lib/carrosselTemplate.ts`:

1. **Backgrounds geométricos** (substituem os gradientes atuais):
   - Slide 1 (hook): metade superior coral sólido + metade inferior teal sólido com **círculo dourado gigante** (sol estilizado) cortado pela divisão — alto contraste.
   - Slides 2, 3, 5, 6 (texto): fundo creme com **3 faixas verticais finas** (coral / dourado / teal) na lateral esquerda, e um grande círculo coral semi-transparente sangrando do canto.
   - Slide 4 (versículo): teal sólido com **grade de pequenos triângulos** dourados decorativos no topo e base; sem mais "estrelas aleatórias".
   - Slide 7 (CTA): fundo coral sólido + faixa teal inferior + sol dourado central (PNG da marca).
2. **Tipografia mais geométrica:** rótulos ("PARA PENSAR", "RESPIRA"...) em uppercase com letter-spacing largo (`0.25em` simulado por inserir espaços) e barra dourada espessa de 6px sob eles.
3. **Numerador "1/7" como pílula** colorida no canto superior direito em vez de texto solto.
4. **Cores mais vibrantes:** trocar `creamDark` por dourado mais saturado nas separações; usar `gold #F4C04D` como cor de acento real em todos os slides (linhas, números, bordas).

## 3. Slide 7 (CTA) — ícones Instagram + logotipo

Substituir as três pílulas "Compartilhe / Envie / Salve" por:

1. **Três ícones do Instagram** desenhados como SVG paths nativos no canvas (sem dependência externa):
   - Avião de papel (Send/Direct)
   - Coração contornado (Compartilhar via Stories) — opcional substituir por ícone "compartilhar" (seta curva)
   - Ícone de bookmark (Salvar)
   
   Renderizados como linhas brancas espessas (stroke 6px), tamanho ~110px, espaçados horizontalmente, sem caixas/pílulas — só os ícones limpos como aparecem na barra do Instagram.

2. **Abaixo dos ícones:** o logotipo "fonte de alegria" estilizado (igual ao da Navbar):
   - Sol PNG (`sun-icon.png`) à esquerda, ~120px, dentro de um círculo com gradiente coral (replicando o badge da navbar).
   - Texto "fonte de" em fonte serif itálica branca + "alegria" em serif itálica bold dourado, lado a lado, tamanho ~64px.
3. Remover textos "Compartilhe / Envie / Salve" e o handle gigante final (handle compacto fica no rodapé padrão).

## 4. Correção do domínio para `fontedealegria.com.br`

Substituir todas as ocorrências de `fontedealegria.com` por `fontedealegria.com.br` em:
- `src/lib/storyTemplate.ts` (rodapé da arte)
- `src/lib/carrosselTemplate.ts` (slides 7)
- Verificar e atualizar também legendas geradas pela edge function `gerar-carrossel-devocional` (system prompt menciona `@fontedealegriadiaria` mas não o domínio — sem mudança necessária lá).

Observação: este plano só corrige o domínio nas artes geradas. **Configurar o domínio `www.fontedealegria.com.br` em si é feito no painel Lovable** (Project → Settings → Domains) — não é alteração de código.

## 5. Carregamento do sol PNG no canvas

Adicionar utilitário em `src/lib/canvasUtils.ts`:
```ts
export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
```
Importar `sun-icon.png` via `import sunIcon from "@/assets/sun-icon.png"` e passar para a função de render. Pré-carregar junto com `ensureFonts()`.

## Arquivos modificados

- `src/lib/storyTemplate.ts` — reescrita do layout (sem overflow), background geométrico, sol PNG, domínio `.com.br`.
- `src/lib/carrosselTemplate.ts` — backgrounds geométricos vibrantes, slide 7 com ícones IG + logotipo, domínio `.com.br`.
- `src/lib/canvasUtils.ts` — helper `loadImage` e pré-carregamento do sol.

Sem mudanças em banco de dados, edge functions ou rotas.

## Após aprovar

Implemento as mudanças e você pode testar gerando o Story do dia 28/04 (mesmo devocional do anexo) — o versículo longo de 1 Pedro 4 deve caber sem sobrepor o hook.
