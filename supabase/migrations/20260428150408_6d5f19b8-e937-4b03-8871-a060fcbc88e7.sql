-- Prevent public exposure of contact info in approved stories
REVOKE SELECT (contato) ON public.historias FROM anon, authenticated;

-- Ensure base columns the public site needs remain readable
GRANT SELECT (id, nome, cidade, depoimento, status, consentimento, destaque, created_at, updated_at)
  ON public.historias TO anon, authenticated;