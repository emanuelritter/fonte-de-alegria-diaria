# Fonte de Alegria — Plano do Site

## Visão geral

Site moderno, vibrante e jovem para o projeto devocional **Fonte de Alegria**, ligado ao livro *Devocional Diário* (Ellen G. White / CPB) e à Igreja Adventista Central de Indaiatuba. O site é a "casa" dos posts diários das redes sociais, conduzindo o leitor pelo funil espiritual de 3 níveis: oração/Bíblia → estudos e Novo Tempo → igreja local.

## Identidade visual

- **Estilo:** vibrante e jovem, gradientes saturados inspirados na capa (laranja/coral no topo → teal profundo embaixo), sol radiante como elemento gráfico recorrente.
- **Paleta (da capa, modernizada):**
  - Coral / laranja queimado (sol nascente)
  - Teal profundo (águas)
  - Areia quente (luz)
  - Off-white (fundo limpo)
- **Tipografia:** serifada elegante e itálica para títulos ("fonte de alegria" como na capa); sans-serif moderna para corpo.
- **Microinterações:** fade-in ao rolar, hover-scale em cards, brilho sutil no "sol", botões de compartilhar com animação.
- **Tom de voz:** pastoral, esperançoso, cristocêntrico — palavras como *comunhão, esperança, graça, fidelidade*. Evitar prosperidade/milagre garantido.

## Páginas e seções

### 1. Home

- Hero com gradiente da capa, sol radiante, título em serifa itálica e CTA "Leia o devocional de hoje".
- Bloco "Devocional de hoje" — preview do texto + botão para a página completa.
- Bloco "Post do dia nas redes" — embed do último post do Instagram do projeto.
- Trilha do funil em 3 cards: *Ore e leia* · *Estude com o Novo Tempo* · *Conheça nossa igreja*.
- Carrossel de histórias de transformação (aprovadas).
- Rodapé com termos pastorais, créditos à CPB e links das redes.

### 2. Devocional diário (`/devocional` e `/devocional/:data`)

- Página com texto do dia (data, versículo-chave, meditação, oração final).
- Calendário/arquivo navegável por data anterior.
- Bloco lateral com o post correspondente nas redes.
- Botões de compartilhar (WhatsApp, Instagram stories, copiar link).
- CTA rotativo conforme nível do funil definido pelo manual.

### 3. Plano de leitura bíblica (`/plano-de-leitura`)

- Sugestão diária de leitura acompanhando o devocional.
- Marcação de progresso local (sem login obrigatório, salvo no navegador).
- Visual em "trilha" mensal.

### 4. Histórias de alegria (`/historias`)

- Grade de cards com depoimentos aprovados (nome ou anônimo, cidade, foto opcional, texto curto).
- Botão "Compartilhe sua história" → formulário (`/compartilhar`) com nome, contato opcional, história, consentimento de publicação.
- **Moderação obrigatória:** envio entra como "pendente" e só aparece após aprovação no painel admin.

### 5. Conecte-se (`/conecte-se`)

Hub do funil com 3 blocos visuais:

- **IASD Central de Indaiatuba** — endereço, horários, links de contato/redes da igreja.
- **TV Novo Tempo** — links para estudos bíblicos online, programação, app.
- **Pequenos grupos / ministérios locais** — convite suave de integração.

### 6. Pedidos de oração (`/oracao`)

- Formulário simples e acolhedor, com aviso de sigilo.
- Opção de manter anônimo; nada publicado no site.
- Linguagem: nunca prometer respostas, apontar para Deus como consolo.

### 7. Sobre / Termos (`/sobre`)

- Propósito do projeto, declaração pastoral, termos de uso (baseado no PDF v7.0), créditos à CPB e à Ellen G. White.

### 8. Painel administrativo (`/admin`, protegido)

- Login (e-mail/senha + Google).
- **Devocionais:** criar/editar/agendar por data (título, versículo, texto, oração, link do post das redes, nível de CTA).
- **Histórias:** aprovar / rejeitar / destacar.
- **Pedidos de oração:** ler em sigilo, marcar como "orado por".
- **Plano de leitura:** cadastrar leituras por data.

## Funcionalidades técnicas (seção para referência)

- **Lovable Cloud** para banco, autenticação e armazenamento.
- **Tabelas:** `devocionais`, `historias` (com status: pendente/aprovado/rejeitado), `pedidos_oracao`, `plano_leitura`, `user_roles` (separada, com enum `app_role` e função `has_role` — só você como `admin`).
- **RLS:** leitura pública apenas de devocionais publicados e histórias aprovadas; pedidos de oração só admin; inserção pública controlada para histórias e pedidos.
- **Auth:** e-mail/senha + Google; rota `/admin` protegida via `has_role`.
- **Validação:** Zod em todos os formulários (limites de tamanho, sanitização).
- **Embed Instagram:** via blockquote oficial do Instagram + script.
- **SEO:** meta tags por devocional, Open Graph com gradiente da capa.
- **Responsivo:** mobile-first (maior parte do tráfego virá das redes).

## Escopo do MVP (primeira entrega)

1. Identidade visual completa + design system (cores HSL, tipografia, componentes).
2. Home, página de devocional com arquivo por data, plano de leitura, histórias, conecte-se, oração, sobre.
3. Painel admin com login e CRUD de devocionais, moderação de histórias e visualização de pedidos.
4. Seed com 3–5 devocionais de exemplo para demonstração.

## Fora do escopo agora (futuro)

Newsletter por e-mail, notificações push, app mobile, área logada para leitores, comentários, integração automática com Instagram API.  
  
Dominios:  
Instagram: @fontedealegriadiaria  
[www.fontedealegria.com.br](http://www.fontedealegria.com.br) (futuramente após construcao)  
Instagram da Igreja: @iasdcentraldeindaiatuba

&nbsp;