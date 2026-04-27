CREATE TABLE IF NOT EXISTS public.devocionais_fonte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL UNIQUE,
  titulo text NOT NULL,
  versiculo text NOT NULL,
  referencia text NOT NULL DEFAULT '',
  meditacao text NOT NULL,
  traduzido boolean NOT NULL DEFAULT false,
  erro text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.devocionais_fonte ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam fonte"
  ON public.devocionais_fonte FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS devocionais_fonte_traduzido_idx
  ON public.devocionais_fonte (traduzido, data) WHERE traduzido = false;