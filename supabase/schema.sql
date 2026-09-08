-- Cúcuta Deportivo · Pizarra Táctica — Anexo A, FA6–FA8 (cuentas de usuario)
--
-- Ejecutar una sola vez en el SQL Editor de tu proyecto Supabase
-- (https://supabase.com/dashboard/project/_/sql/new), de arriba a abajo.
-- Es idempotente: usa `create or replace` / `if not exists` donde aplica,
-- así que puede volver a ejecutarse sin duplicar nada si algo falla a medio camino.
--
-- Resumen de lo que crea:
--   - public.perfiles           1 fila por usuario (auth.users), rol y estado
--   - public.codigos_invitacion códigos que el club reparte para registrarse ya "activo"
--   - public.intentos_login     historial de accesos (FA8), inmutable desde el cliente
--   - Funciones SECURITY DEFINER para todo lo que el cliente anónimo necesita
--     hacer sin poder leer las tablas directamente (verificar código, resolver
--     usuario→correo, registrar un intento, comprobar bloqueo por fuerza bruta).
--   - Políticas de Row Level Security en las tres tablas.
--   - Un trigger que crea el perfil automáticamente al registrarse.

-- ============================================================
-- 1. TABLAS
-- ============================================================

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  usuario text not null unique,
  nombre_completo text not null default '',
  rol text not null default 'entrenador' check (rol in ('entrenador', 'invitado')),
  estado text not null default 'pendiente' check (estado in ('activo', 'pendiente', 'bloqueado')),
  creado_en timestamptz not null default now()
);

create table if not exists public.codigos_invitacion (
  codigo text primary key,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists public.intentos_login (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  usuario_intentado text not null,
  resultado text not null check (resultado in ('exito', 'fallido', 'bloqueado')),
  metodo text not null default 'password' check (metodo in ('password', 'remember_token')),
  dispositivo text,
  user_agent text,
  ip text,
  ciudad text,
  pais text,
  session_id uuid,
  ocurrido_en timestamptz not null default now()
);

create index if not exists intentos_login_usuario_idx on public.intentos_login (lower(usuario_intentado), ocurrido_en desc);
create index if not exists intentos_login_user_id_idx on public.intentos_login (user_id, ocurrido_en desc);

-- ============================================================
-- 2. FUNCIONES (SECURITY DEFINER: se ejecutan con permisos elevados,
--    así el cliente anónimo puede usarlas sin acceso directo a las tablas)
-- ============================================================

create or replace function public.es_entrenador_activo()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'entrenador' and estado = 'activo'
  );
$$;

create or replace function public.verificar_codigo_invitacion(p_codigo text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.codigos_invitacion
    where codigo = p_codigo and activo = true
  );
$$;

-- Resuelve un nombre de usuario a su correo, para permitir "iniciar sesión
-- con usuario o correo" (Supabase Auth solo acepta correo/teléfono). Devuelve
-- NULL si no existe: el código que llama a esto nunca debe mostrar esa
-- diferencia al usuario final (mensaje de error siempre genérico).
create or replace function public.resolver_correo_por_usuario(p_usuario text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select u.email::text from auth.users u
  join public.perfiles p on p.id = u.id
  where lower(p.usuario) = lower(p_usuario)
  limit 1;
$$;

-- Cuenta intentos fallidos recientes para el bloqueo temporal (5 en 15 min).
create or replace function public.verificar_bloqueo_usuario(p_usuario text)
returns table (bloqueado boolean, intentos_recientes int)
language sql
security definer
set search_path = public
stable
as $$
  select
    count(*) filter (where resultado = 'fallido' and ocurrido_en > now() - interval '15 minutes') >= 5,
    count(*) filter (where resultado = 'fallido' and ocurrido_en > now() - interval '15 minutes')::int
  from public.intentos_login
  where lower(usuario_intentado) = lower(p_usuario);
$$;

-- Único punto de escritura en intentos_login: el cliente nunca inserta
-- directamente (evita que alguien manipule o borre su propio historial).
create or replace function public.registrar_intento_login(
  p_usuario_intentado text,
  p_resultado text,
  p_metodo text default 'password',
  p_dispositivo text default null,
  p_user_agent text default null,
  p_ip text default null,
  p_ciudad text default null,
  p_pais text default null,
  p_session_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select u.id into v_user_id
  from auth.users u
  left join public.perfiles p on p.id = u.id
  where lower(u.email) = lower(p_usuario_intentado) or lower(p.usuario) = lower(p_usuario_intentado)
  limit 1;

  insert into public.intentos_login
    (user_id, usuario_intentado, resultado, metodo, dispositivo, user_agent, ip, ciudad, pais, session_id)
  values
    (v_user_id, p_usuario_intentado, p_resultado, p_metodo, p_dispositivo, p_user_agent, p_ip, p_ciudad, p_pais, p_session_id);
end;
$$;

-- Aprobar una cuenta "pendiente" (registrada sin código de invitación válido).
-- Solo un entrenador activo puede llamarla.
create or replace function public.aprobar_usuario(p_usuario_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_entrenador_activo() then
    raise exception 'Solo un entrenador puede aprobar cuentas.';
  end if;
  update public.perfiles set estado = 'activo' where id = p_usuario_id;
end;
$$;

grant execute on function public.verificar_codigo_invitacion(text) to anon, authenticated;
grant execute on function public.resolver_correo_por_usuario(text) to anon, authenticated;
grant execute on function public.verificar_bloqueo_usuario(text) to anon, authenticated;
grant execute on function public.registrar_intento_login(text, text, text, text, text, text, text, text, uuid) to anon, authenticated;
grant execute on function public.aprobar_usuario(uuid) to authenticated;
grant execute on function public.es_entrenador_activo() to authenticated;

-- ============================================================
-- 3. TRIGGER: crear el perfil automáticamente al registrarse
-- ============================================================

create or replace function public.manejar_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_codigo text;
  v_codigo_valido boolean := false;
  v_estado text;
  v_es_primero boolean;
begin
  select not exists (select 1 from public.perfiles) into v_es_primero;

  v_codigo := new.raw_user_meta_data ->> 'codigo_invitacion';
  if v_codigo is not null and v_codigo <> '' then
    select public.verificar_codigo_invitacion(v_codigo) into v_codigo_valido;
  end if;

  -- El primer usuario del club siempre queda activo (si no, nadie podría
  -- aprobar cuentas jamás: se necesitaría un entrenador activo para crear
  -- al primer entrenador activo).
  v_estado := case when v_es_primero or v_codigo_valido then 'activo' else 'pendiente' end;

  insert into public.perfiles (id, usuario, nombre_completo, rol, estado)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'usuario', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'rol', ''), 'entrenador'),
    v_estado
  );
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.manejar_nuevo_usuario();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

alter table public.perfiles enable row level security;
alter table public.codigos_invitacion enable row level security;
alter table public.intentos_login enable row level security;

drop policy if exists "ver_propio_perfil" on public.perfiles;
create policy "ver_propio_perfil" on public.perfiles
  for select using (id = auth.uid());

drop policy if exists "entrenadores_ven_todos_los_perfiles" on public.perfiles;
create policy "entrenadores_ven_todos_los_perfiles" on public.perfiles
  for select using (public.es_entrenador_activo());

drop policy if exists "entrenadores_actualizan_perfiles" on public.perfiles;
create policy "entrenadores_actualizan_perfiles" on public.perfiles
  for update using (public.es_entrenador_activo());

-- codigos_invitacion: sin políticas de lectura directa a propósito — solo se
-- consulta a través de verificar_codigo_invitacion(), que no revela la lista.

drop policy if exists "ver_propios_intentos" on public.intentos_login;
create policy "ver_propios_intentos" on public.intentos_login
  for select using (user_id = auth.uid());

drop policy if exists "entrenadores_ven_todos_los_intentos" on public.intentos_login;
create policy "entrenadores_ven_todos_los_intentos" on public.intentos_login
  for select using (public.es_entrenador_activo());

-- ============================================================
-- 5. (Opcional) Purga automática a los 90 días — requiere la extensión
--    pg_cron, habilítala primero en el Dashboard → Database → Extensions.
--    Si no la habilitas, simplemente omite este bloque; nada más depende de él.
-- ============================================================

-- select cron.schedule(
--   'purgar_intentos_login',
--   '0 3 * * *',
--   $$ delete from public.intentos_login where ocurrido_en < now() - interval '90 days'; $$
-- );

-- ============================================================
-- 6. Primer código de invitación de ejemplo (bórralo o cámbialo)
-- ============================================================

insert into public.codigos_invitacion (codigo) values ('CUCUTA-2026')
  on conflict (codigo) do nothing;
