ALTER TABLE public.pedidos_oracao ADD COLUMN IF NOT EXISTS interesse_contato boolean NOT NULL DEFAULT false;
ALTER TABLE public.pedidos_oracao ADD COLUMN IF NOT EXISTS encaminhado_em timestamptz;

ALTER TABLE public.historias ADD COLUMN IF NOT EXISTS interesse_contato boolean NOT NULL DEFAULT false;
ALTER TABLE public.historias ADD COLUMN IF NOT EXISTS encaminhado_em timestamptz;

GRANT SELECT (interesse_contato) ON public.historias TO anon, authenticated;