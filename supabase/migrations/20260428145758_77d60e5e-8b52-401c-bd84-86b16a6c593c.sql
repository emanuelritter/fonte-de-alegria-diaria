-- 1) Lock down SECURITY DEFINER function execution
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_historias() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_historias() TO authenticated;

-- 2) Explicit restrictive policy on user_roles to prevent privilege escalation.
-- Default-deny already blocks non-admin INSERTs (no permissive INSERT policy exists),
-- but we add a RESTRICTIVE policy to make the intent explicit and defense-in-depth.
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated, anon
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));