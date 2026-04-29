-- Revoke public/anon execute on all admin SECURITY DEFINER functions
revoke execute on function public.admin_overview_stats() from public, anon;
revoke execute on function public.admin_devocional_calendar(date) from public, anon;
revoke execute on function public.admin_list_historias() from public, anon;
revoke execute on function public.admin_list_users() from public, anon;
revoke execute on function public.is_current_user_admin() from public, anon;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;

-- Grant only to authenticated (function bodies still check has_role)
grant execute on function public.admin_overview_stats() to authenticated;
grant execute on function public.admin_devocional_calendar(date) to authenticated;
grant execute on function public.admin_list_historias() to authenticated;
grant execute on function public.admin_list_users() to authenticated;
grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;