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

-- ============================================
-- Marca y stock (panel de administración)
-- ============================================

alter table public.productos add column if not exists marca text not null default '';
alter table public.productos add column if not exists stock numeric not null default 0;

-- 4. Tabla de ventas
--    Guarda una foto del producto/precio al momento de la venta, para que el
--    historial no cambie si después se edita o borra el producto.
create table if not exists public.ventas (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references public.productos(id) on delete set null,
  producto_nombre text not null,
  marca text,
  cantidad numeric not null,           -- siempre en bolsas
  tipo text not null default 'unidad', -- 'unidad' (bolsa cerrada) | 'kilo' (bolsa abierta, se vende suelta)
  precio_unitario numeric not null,
  total numeric not null,
  vendido_por text,
  created_at timestamptz not null default now()
);

-- 4.1 Facturación (opcional): una venta se puede marcar como facturada y se
--     guardan los datos del comprobante que se emitió. Nada de esto es
--     obligatorio: una venta sin facturar queda con facturada = false.
alter table public.ventas add column if not exists facturada boolean not null default false;
alter table public.ventas add column if not exists factura_numero text;
alter table public.ventas add column if not exists factura_cliente text;
alter table public.ventas add column if not exists factura_doc text;   -- CUIT / DNI del cliente
alter table public.ventas add column if not exists factura_fecha timestamptz;

alter table public.ventas enable row level security;

drop policy if exists "ventas_auth_all" on public.ventas;
create policy "ventas_auth_all"
  on public.ventas
  for all
  to authenticated
  using (true)
  with check (true);

-- 4.2 Factura emitida por fuera de la app (Comprobantes en Línea de AFIP).
--     La venta queda marcada como facturada y se guarda el número real, pero
--     el comprobante fiscal lo emitió AFIP, no esta app.
alter table public.ventas add column if not exists factura_externa boolean not null default false;

-- ============================================
-- 5. Datos del emisor
-- ============================================

-- A nombre de quién salen los comprobantes. Una sola fila, editable desde
-- Panel → Facturación, para poder entregarle la app a otro negocio sin tocar
-- el código.
create table if not exists public.config_negocio (
  id boolean primary key default true,
  nombre text not null default '',
  detalle text not null default '',
  contacto text not null default '',
  cuit text not null default '',
  domicilio text not null default '',
  condicion_iva text not null default 'Responsable Monotributo',
  ingresos_brutos text not null default '',
  inicio_actividades text not null default '',
  updated_at timestamptz not null default now(),
  constraint config_negocio_fila_unica check (id)
);

insert into public.config_negocio (id) values (true) on conflict (id) do nothing;

alter table public.config_negocio enable row level security;

drop policy if exists "config_negocio_auth_all" on public.config_negocio;
create policy "config_negocio_auth_all"
  on public.config_negocio
  for all
  to authenticated
  using (true)
  with check (true);
