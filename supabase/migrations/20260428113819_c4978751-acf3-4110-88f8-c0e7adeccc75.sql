
-- 1. Novos campos para compartilhamento social
ALTER TABLE public.devocionais
  ADD COLUMN IF NOT EXISTS hook_stories text,
  ADD COLUMN IF NOT EXISTS carrossel_textos jsonb,
  ADD COLUMN IF NOT EXISTS carrossel_legenda text;

-- 2. Remove o cron job da tradução automática (se existir)
DO $$
DECLARE
  job_id bigint;
BEGIN
  FOR job_id IN
    SELECT jobid FROM cron.job
    WHERE command ILIKE '%processar-devocionais%'
       OR jobname ILIKE '%processar-devocionais%'
       OR jobname ILIKE '%devocionais%'
  LOOP
    PERFORM cron.unschedule(job_id);
  END LOOP;
EXCEPTION WHEN undefined_table THEN
  -- pg_cron não instalado, ignora
  NULL;
END $$;

-- 3. Apaga devocionais que vieram da tradução automática (todos rascunhos atuais de 2026)
DELETE FROM public.devocionais
WHERE publicado = false
  AND data >= '2026-01-01'
  AND data <= '2026-12-31';

-- 4. Reseta o flag traduzido na tabela fonte para refletir que não está mais sendo usada
UPDATE public.devocionais_fonte
SET traduzido = false, erro = NULL
WHERE traduzido = true;
