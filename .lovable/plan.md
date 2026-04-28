# Plano — Editorial manual + Compartilhamento visual no Instagram

Três ações claras que respeitam o editorial puro do livro e potencializam o alcance via redes.

---

## Ação 1 — Voltar ao fluxo manual semanal (texto puro do livro)

**Objetivo:** Garantir fidelidade ao texto original. Você publica 1x/semana inserindo manualmente os 7 textos via formulário.

**O que muda:**

- **Desativar a importação automática de IA**: removo o cron job que roda a Edge Function `processar-devocionais` a cada 2 minutos.
- **Despublicar e limpar os devocionais já traduzidos pela IA** (estão como rascunho, mas vou apagá-los para evitar confusão). A tabela `devocionais_fonte` (textos originais em inglês) **fica preservada**, caso queira consultar como referência.
- **Remover a aba "Importação"** do `/admin`.
- **Reforçar a aba "Devocionais"** com:
  - Um modo **"Semana"**: 7 cards lado a lado (segunda → domingo) já com a data preenchida da próxima semana. Você preenche título, versículo, referência, meditação e (opcional) oração — tudo de uma vez. Botão único **"Salvar semana"**.
  - Mantém o modo **"Avulso"** (formulário individual atual) para ajustes pontuais.
  - Lista lateral mostrando os próximos 14 dias com status (preenchido / vazio / publicado).

**Resultado:** texto 100% fiel, controle editorial total, sem consumo de IA para tradução.

---

## Ação 2 — Botão "Baixar arte do Stories" (1080×1920, template fixo)

**Objetivo:** Cada visitante baixa uma arte vertical pronta com a meditação do dia, posta no Stories marcando `@fontedealegriadiaria`.

**Template fixo (nunca muda — economiza créditos de IA):**

- Dimensão: **1080×1920 px**, PNG.
- Fundo: gradiente `--gradient-sunrise` do projeto (coral → teal profundo, igual à capa do livro).
- Sol nascente (asset já existe: `src/assets/sun-icon.png`) ancorado embaixo, irradiando luz.
- **Área segura respeitada**: 250 px de margem no topo (perfil) e 400 px embaixo (campo de resposta). Conteúdo central entre 250–1520 px de altura.
- Layout central (zona segura):
  1. Etiqueta pequena: "DEVOCIONAL DO DIA" + data.
  2. **Título** em Fraunces serif grande.
  3. **Versículo** + referência em itálico, dentro de card translúcido.
  4. **CTA inspirador** (1–2 linhas) — único campo gerado por IA.
  5. Rodapé fixo: `fontedealegria.com.br` + `@fontedealegriadiaria`.

**Como funciona tecnicamente:**

- Renderização **client-side via canvas HTML5** (zero custo de imagem-IA, zero servidor de imagem). Carrega fontes Fraunces+Inter, desenha o gradiente, sol, textos quebrados em linhas, exporta PNG via `canvas.toBlob()` → download direto.
- O **CTA hook** é gerado **uma única vez por devocional** por uma Edge Function nova `gerar-hook-devocional` (modelo `google/gemini-2.5-flash-lite`, ~50 tokens — barato), e **cacheado num novo campo `hook_stories text` na tabela `devocionais**`. Próximas vezes que alguém clicar no botão, lê do banco — sem nova chamada à IA.
- Botão substitui o atual `CompartilharInstagram` (que só copia texto). Label: **"Baixar arte para o Stories"**, ícone Instagram.

**Resultado:** arte HD pronta em 1 clique, identidade visual consistente, custo de IA = 1 chamada por devocional (não por usuário).

---

## Ação 3 — Botão "Gerar carrossel" (7 slides + legenda)

**Objetivo:** Carrossel viral estilo Brands Decoded, com hook forte, atrito reflexivo e CTA de compartilhamento.

**Template fixo do carrossel (7 slides, 1080×1350 — formato feed):**

- Mesma paleta vibrante do projeto, mas alternando fundos:
  - **Slide 1 (Hook)**: fundo coral/sunrise sólido, título grande tipo "Você já sentiu isso?" — provocação.
  - **Slides 2–3 (Atrito/contexto)**: fundo creme + tipografia teal — desenvolvem a tensão.
  - **Slide 4 (Versículo)**: fundo teal profundo, versículo em destaque com a referência — momento de revelação.
  - **Slides 5–6 (Reflexão prática)**: fundo creme com detalhes coral — aplicação para hoje.
  - **Slide 7 (CTA)**: fundo gradiente sunrise + 3 ícones grandes: **Compartilhar | Enviar a alguém | Salvar**, com handle `@fontedealegriadiaria` em destaque.
- Cada slide tem numeração (1/7, 2/7…) discreta, logo da fonte canto superior, fonte Fraunces para títulos.

**Como funciona:**

- **1 Edge Function** `gerar-carrossel-devocional` chama `google/gemini-2.5-flash` com prompt baseado em técnicas Brands Decoded (hook → tensão → revelação → aplicação → CTA), recebe via tool calling JSON estruturado:
  ```
  { hook, tensao_1, tensao_2, versiculo_destaque, aplicacao_1, aplicacao_2, cta, legenda_post }
  ```
- Resultado **cacheado** em novos campos da tabela `devocionais`: `carrossel_textos jsonb`, `carrossel_legenda text`. Gera 1x por devocional.
- Renderização: mesmo motor canvas client-side, gera **7 PNGs**, empacota num **ZIP** via `jszip` (já leve, ~30KB) e baixa.
- Junto baixa um `.txt` com a **legenda** pronta (gancho + corpo + hashtags + CTA + handle), pronta pra colar no Instagram.

**Resultado:** o seguidor abre o site, clica, recebe um ZIP com 7 imagens + legenda — posta direto no feed pessoal ou na página oficial.

---

## Detalhes técnicos

**Mudanças no banco** (1 migration):

- `devocionais`: adicionar colunas `hook_stories text`, `carrossel_textos jsonb`, `carrossel_legenda text` (todas nullable).
- Remover o cron job `pg_cron` que dispara `processar-devocionais` (UNSCHEDULE).
- (Opcional) Apagar registros traduzidos pela IA da tabela `devocionais` mantendo a estrutura. `devocionais_fonte` permanece intacta como referência.

**Edge Functions**:

- **Nova**: `gerar-hook-devocional` — recebe `devocional_id`, gera CTA curto (1–2 linhas), salva no banco, retorna texto.
- **Nova**: `gerar-carrossel-devocional` — recebe `devocional_id`, gera 7 blocos + legenda via tool calling, salva no banco, retorna JSON.
- **Remover**: cron de `processar-devocionais` (a função em si pode ficar para uso manual futuro, mas sem cron).

**Frontend**:

- `src/lib/storyTemplate.ts` — função `renderStoryPNG(dev)` (canvas 1080×1920).
- `src/lib/carrosselTemplate.ts` — função `renderCarrosselZIP(dev)` (7× canvas 1080×1350 + legenda.txt em ZIP).
- `src/components/CompartilharInstagram.tsx` — substituído por dois botões: "Baixar Stories" e "Baixar Carrossel" (loading states, primeira chamada gera+cacheia, próximas vão direto).
- `src/pages/Admin.tsx` — remover aba Importação, adicionar modo "Semana" com 7 cards.
- `src/hooks/useDevocional.ts` — incluir os novos campos no tipo.

**Dependência nova**: `jszip` (~30KB) para empacotar carrossel.

**Fontes**: Fraunces e Inter já carregadas no projeto — uso `document.fonts.ready` antes de renderizar canvas.

---

## O que vou entregar

1. Fluxo manual semanal limpo no `/admin`, sem ruído da IA.
2. Botão "Baixar Stories" → PNG 1080×1920 com identidade do projeto, área segura respeitada, CTA gerado por IA (1x por devocional).
3. Botão "Baixar Carrossel" → ZIP com 7 PNGs + legenda pronta, textos no estilo viral Brands Decoded.

Custo de IA por devocional: ~1 chamada flash-lite (hook) + 1 chamada flash (carrossel) = centavos. Independente de quantas pessoas baixem.