-- ===== Admin overview stats RPC =====
create or replace function public.admin_overview_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
  hoje date := current_date;
begin
  if not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'forbidden';
  end if;

  select jsonb_build_object(
    'devocional_hoje', (
      select jsonb_build_object(
        'existe', (d.id is not null),
        'publicado', coalesce(d.publicado, false),
        'titulo', d.titulo,
        'id', d.id
      )
      from (select id, publicado, titulo from public.devocionais where data = hoje limit 1) d
      right join (select 1) one on true
      limit 1
    ),
    'proximos_7_dias', (
      select jsonb_build_object(
        'preenchidos', count(*) filter (where data between hoje and hoje + 6),
        'publicados', count(*) filter (where data between hoje and hoje + 6 and publicado = true)
      )
      from public.devocionais
    ),
    'devocionais_total', (select count(*) from public.devocionais),
    'devocionais_rascunho', (select count(*) from public.devocionais where publicado = false),
    'historias_pendentes', (select count(*) from public.historias where status = 'pendente'),
    'historias_total', (select count(*) from public.historias),
    'oracao_pendentes', (select count(*) from public.pedidos_oracao where atendido = false),
    'oracao_total', (select count(*) from public.pedidos_oracao),
    'leads_pendentes', (
      (select count(*) from public.pedidos_oracao where interesse_contato = true and encaminhado_em is null) +
      (select count(*) from public.historias where interesse_contato = true and encaminhado_em is null)
    ),
    'usuarios_total', (select count(*) from auth.users),
    'admins_total', (select count(*) from public.user_roles where role = 'admin'::public.app_role),
    'fonte_traduzidos', (select count(*) from public.devocionais_fonte where traduzido = true),
    'fonte_pendentes', (select count(*) from public.devocionais_fonte where traduzido = false),
    'plano_total', (select count(*) from public.plano_leitura)
  ) into result;

  return result;
end;
$$;

-- ===== Calendário de devocionais por mês =====
create or replace function public.admin_devocional_calendar(mes_inicio date)
returns table(data date, id uuid, titulo text, publicado boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'forbidden';
  end if;
  return query
    select d.data, d.id, d.titulo, d.publicado
    from public.devocionais d
    where d.data >= mes_inicio
      and d.data < (mes_inicio + interval '1 month')::date
    order by d.data;
end;
$$;