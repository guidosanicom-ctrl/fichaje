-- Esquema para la app de fichajes de Carpintería Matu
-- Ejecutar este script en el SQL Editor de Supabase (Project > SQL Editor > New query)

create table if not exists fichajes (
  id uuid primary key default gen_random_uuid(),
  persona text not null check (persona in ('Mateo', 'Franco')),
  tipo text not null check (tipo in ('entrada', 'salida')),
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists fichajes_persona_timestamp_idx
  on fichajes (persona, timestamp desc);

-- Row Level Security
-- No usamos Supabase Auth (solo 2 personas conocidas, sin login),
-- así que la tabla se accede con la clave anon. Habilitamos RLS y
-- damos políticas simples que solo permiten:
--   - leer todos los fichajes (para la pantalla de resumen)
--   - insertar nuevos fichajes con persona/tipo válidos
--   - NO permitimos update ni delete desde el cliente (evita que alguien
--     borre o edite el historial de horas trabajadas por error o a propósito)

alter table fichajes enable row level security;

drop policy if exists "fichajes_select_all" on fichajes;
create policy "fichajes_select_all"
  on fichajes for select
  using (true);

drop policy if exists "fichajes_insert_valido" on fichajes;
create policy "fichajes_insert_valido"
  on fichajes for insert
  with check (
    persona in ('Mateo', 'Franco')
    and tipo in ('entrada', 'salida')
  );

-- Sin políticas de update/delete => quedan bloqueados por RLS por defecto.
