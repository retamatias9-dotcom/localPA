-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor > New query)

-- 1. Tabla de productos
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  precio numeric not null default 0,
  precio_kilo numeric,
  precio_por_kilo boolean not null default false,
  imagen_url text not null default '',
  categoria text not null default '',
  created_at timestamptz not null default now()
);

-- 1.1 Si la tabla ya existía antes de sumar el precio por kilo/bolsa, agregar las columnas nuevas
alter table public.productos add column if not exists precio_kilo numeric;
alter table public.productos add column if not exists precio_por_kilo boolean not null default false;

-- 2. Habilitar Row Level Security
alter table public.productos enable row level security;

-- 3. Políticas: solo usuarios autenticados pueden operar sobre la tabla.
--    Los usuarios anónimos (no logueados) no tienen ningún acceso.

create policy "Usuarios autenticados pueden ver productos"
  on public.productos
  for select
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden crear productos"
  on public.productos
  for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados pueden actualizar productos"
  on public.productos
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Usuarios autenticados pueden eliminar productos"
  on public.productos
  for delete
  to authenticated
  using (true);
