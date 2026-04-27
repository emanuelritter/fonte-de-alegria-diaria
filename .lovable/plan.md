## Objetivo

Automatizar a importação dos 366 devocionais do livro *Radiant Religion* (Ellen G. White) para o banco, mapeados para 2026, com oração gerada por IA (alinhada à doutrina adventista) e link de compartilhamento para Instagram Stories de @fontedealegriadiaria.

## Como vou fazer (visão geral)

```text
PDF Radiant Religion
       │
       ▼
[1] Script Python local (sandbox)
    - Parse do PDF inteiro (366 dias)
    - Extrai por dia: título, versículo, referência, meditação
    - Mapeia "January 1" → 2026-01-01, ..., "December 31" → 2026-12-31
    - Salva JSON intermediário (/tmp/devocionais.json) p/ revisão
       │
       ▼
[2] Script Python chama Lovable AI (Gemini)
    - Para cada dia, gera "oracao" curta (3–5 linhas)
    - Prompt usa: tema do devocional + diretriz pastoral adventista
      + base nas 28 Crenças Fundamentais (nistocremos.pdf como contexto)
    - Salva no mesmo JSON
       │
       ▼
[3] Insert no banco (tabela devocionais já existente)
    - publicado=false (você revisa no /admin antes de liberar)
    - cta_nivel=1 por padrão
    - data=2026-MM-DD
    - 1 INSERT em lote (UPSERT por data p/ ser idempotente)
       │
       ▼
[4] Frontend: botão "Compartilhar no Instagram"
    - Na página /devocional/:data e no preview da home
    - Gera texto pronto + abre instagram://story-camera (mobile)
    - Fallback: copia texto + abre perfil @fontedealegriadiaria
```

## Etapas detalhadas

### 1. Extração do PDF (one-shot, no sandbox)
- Usar `pdfplumber` para ler as 366 páginas de meditação.
- Regex para detectar cabeçalhos do tipo `## <Título>, <Mês> <Dia>` (formato confirmado nas primeiras 50 páginas: "God Bids Us Rejoice Always, January 1").
- Por dia, extrair:
  - **titulo**: texto antes da vírgula
  - **data**: mês + dia → `2026-MM-DD`
  - **versiculo** + **referencia**: primeira citação bíblica do bloco (já vem em formato `"...texto..." Ref X:Y.`)
  - **meditacao**: corpo entre versículo e início do próximo dia, removendo números de página, marcadores `[N]` e rodapés
- Saída: `/tmp/devocionais_2026.json` para validação visual antes de inserir.

### 2. Geração de oração com IA (Lovable AI Gateway)
- Modelo: `google/gemini-3-flash-preview` (rápido + barato para 366 chamadas).
- Prompt do sistema fixo:
  > "Você é um pastor adventista do sétimo dia. Gere uma oração curta (3 a 5 linhas), em português, em tom acolhedor e jovem, fiel às 28 Crenças Fundamentais da IASD (salvação pela graça, mediação de Cristo no santuário celestial, sábado, segunda vinda). Não invente doutrina, não cite outras igrejas. Termine com 'Em nome de Jesus, amém.'"
- Prompt do usuário: título + versículo + 1ª frase da meditação.
- Throttle: 1 req/seg para respeitar rate limit. Tempo estimado: ~7 minutos para 366.

### 3. Inserção no banco
- `INSERT ... ON CONFLICT (data) DO UPDATE` na tabela `devocionais`.
- Adicionar índice único em `data` (migration) — hoje não existe.
- Todos com `publicado=false` para você revisar antes de tornar público.

### 4. Frontend — Botão Compartilhar Instagram
- Componente novo `BotaoCompartilharInstagram` adicionado em:
  - `src/pages/Devocional.tsx`
  - `src/components/CtaFunil.tsx` (preview na home)
- Comportamento:
  - Texto gerado: `"📖 {titulo}\n\n{versiculo} — {referencia}\n\n{primeiras 280 chars da meditação}...\n\n🙏 {oracao}\n\n@fontedealegriadiaria"`
  - Mobile (iOS/Android detectado por user-agent): tenta abrir `instagram://story-camera` (Instagram tem deep link específico para criar story; quando não suportado, abrir `https://www.instagram.com/fontedealegriadiaria`).
  - Sempre copia o texto formatado para o clipboard com `navigator.clipboard.writeText()` + toast "Texto copiado! Cole no seu story 🎉".
  - Desktop: copia + abre `https://www.instagram.com/fontedealegriadiaria` em nova aba.
- **Limitação técnica importante**: A API web do Instagram **não permite** publicar diretamente um story a partir de um link. O fluxo realista é "copia texto pronto + abre o app/perfil". Não é possível criar um link que já preencha o story automaticamente sem a API oficial do Meta (que exige aprovação de Business). O botão fará o melhor possível dentro dessas limitações.

### 5. Painel admin
- `/admin` já tem CRUD de devocionais. Você verá os 366 com `publicado=false`. Pode:
  - Revisar conteúdo extraído
  - Ajustar oração gerada por IA
  - Marcar `publicado=true` quando liberar (ou usar uma ação "Publicar todos de Janeiro" — adicionarei botão de publicação em massa por mês).

## Riscos e premissas

- **Qualidade da extração do PDF**: layouts irregulares (notas marginais, quebras) podem deixar trechos sujos. Vou validar visualmente os primeiros 5 dias antes de processar tudo. Se ficar ruim em alguns dias, marco-os com flag `revisar=true` para você corrigir no admin.
- **Direitos autorais**: o livro é da Ellen G. White Estate (CC/livre para uso devocional sem republicação comercial). O texto será exibido no site com atribuição. Você confirmou intenção evangelística — alinhado ao licenciamento.
- **IA pode errar tom doutrinário**: revisão humana antes de publicar mitiga. Se quiser, posso adicionar um checkbox "Oração revisada" no admin.
- **Custo de IA**: ~366 chamadas curtas com Gemini Flash. Cabe folgado no incluso mensal do Lovable AI.

## Entrega

Após aprovação:
1. Criar migration: índice único em `devocionais.data`.
2. Rodar script de extração + IA + inserção (banco passa a ter 366 linhas com `publicado=false`).
3. Adicionar componente "Compartilhar Instagram" no frontend.
4. Adicionar ação "Publicar mês inteiro" no `/admin`.
5. Te entrego um resumo dizendo: "X devocionais importados, Y precisam revisão manual". Você revisa e publica no seu ritmo.