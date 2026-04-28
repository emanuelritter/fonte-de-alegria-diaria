CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz, is_admin boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
    SELECT u.id, u.email::text, u.created_at,
           EXISTS(SELECT 1 FROM public.user_roles r
                  WHERE r.user_id = u.id AND r.role = 'admin'::public.app_role) AS is_admin
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;