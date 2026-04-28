
-- 1) Restrict anon/authenticated from reading historias.contato directly.
-- Admins will use a SECURITY DEFINER RPC that checks has_role.
REVOKE SELECT (contato) ON public.historias FROM anon, authenticated;

-- Pedidos_oracao.contato is already admin-only via RLS, but belt-and-braces:
REVOKE SELECT (contato) ON public.pedidos_oracao FROM anon, authenticated;

-- 2) Admin RPC to fetch historias including contato (for the admin panel).
CREATE OR REPLACE FUNCTION public.admin_list_historias()
RETURNS SETOF public.historias
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY SELECT * FROM public.historias ORDER BY created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_historias() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_historias() TO authenticated;

-- 3) Server-checked admin probe for client guard hardening.
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated, anon;

-- 4) Lock down has_role: it is a helper used inside RLS via SECURITY DEFINER and
--    should not be directly executable by signed-in users (linter finding).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
