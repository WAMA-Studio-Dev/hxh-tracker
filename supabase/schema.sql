-- HxH Tracker — tabla de progreso sincronizado por Sync ID.
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase (el mismo que usas
-- para el diario de Erasmus). Es una tabla nueva e independiente, no toca
-- nada existente.

create table if not exists public.hxh_progress (
  sync_id text primary key check (sync_id ~ '^[a-z2-9]{4,12}$'),
  current_episode integer not null default 0 check (current_episode >= 0 and current_episode <= 148),
  target_pace numeric not null default 2 check (target_pace > 0),
  history jsonb not null default '[]'::jsonb,
  rewatches jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.hxh_progress enable row level security;

-- No hay login: cualquiera con el sync_id (que sólo viaja por tu enlace
-- privado) puede leer/escribir esa fila. Es el mismo modelo que un
-- "documento con enlace secreto".
drop policy if exists "hxh_progress_select" on public.hxh_progress;
create policy "hxh_progress_select" on public.hxh_progress for select using (true);

drop policy if exists "hxh_progress_insert" on public.hxh_progress;
create policy "hxh_progress_insert" on public.hxh_progress for insert with check (true);

drop policy if exists "hxh_progress_update" on public.hxh_progress;
create policy "hxh_progress_update" on public.hxh_progress for update using (true) with check (true);

-- Habilita Realtime para que PC y móvil se vean actualizados al instante.
alter publication supabase_realtime add table public.hxh_progress;
