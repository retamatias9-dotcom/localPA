# Catálogo de Precios

Aplicación web para mostrar y administrar un catálogo de productos, con autenticación obligatoria vía Supabase Auth. Stack: React 18 + TypeScript + Vite + Tailwind CSS + Supabase + React Router.

## Estructura del proyecto

```
src/
  components/   # Navbar, ProductCard, ProductFormModal, ConfirmDialog, ProtectedRoute
  pages/        # Login, Catalog, ProductDetail
  hooks/        # useAuth (contexto de sesión), useProducts (CRUD)
  lib/          # supabase.ts (cliente), format.ts (formateo de precios)
  types/        # tipos de Producto
supabase/
  schema.sql    # tabla "productos" + políticas RLS
```

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar Supabase

### 2.1 Crear el proyecto

Creá un proyecto en [supabase.com](https://supabase.com) si todavía no tenés uno.

### 2.2 Crear la tabla y las políticas RLS

Andá a **SQL Editor > New query** en el panel de Supabase, pegá el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecutalo. Esto crea:

- La tabla `productos` (`id`, `nombre`, `descripcion`, `precio`, `imagen_url`, `categoria`, `created_at`).
- Row Level Security habilitado, con políticas que permiten `SELECT`, `INSERT`, `UPDATE` y `DELETE` únicamente a usuarios autenticados. Los usuarios anónimos no tienen ningún acceso.

### 2.3 Configurar las variables de entorno

Copiá `.env.example` a `.env`:

```bash
cp .env.example .env
```

Completá `.env` con los datos de tu proyecto (Project Settings > API):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

### 2.4 Crear un usuario de prueba

Esta app **no tiene pantalla de registro**: las cuentas se crean manualmente desde el panel de Supabase.

1. Andá a **Authentication > Users** en el panel de Supabase.
2. Hacé clic en **Add user > Create new user**.
3. Cargá un email y una contraseña, y confirmá el usuario (marcá "Auto Confirm User" si el panel lo pide, para que pueda loguearse sin verificar el email).
4. Usá esas credenciales para loguearte en la app.

## 3. Correr el proyecto

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`. Al entrar, si no estás logueado te redirige a `/login`. Después de loguearte accedés al catálogo, donde podés buscar, filtrar por categoría, crear, editar y eliminar productos, y ver el detalle de cada uno.

## 4. Build de producción

```bash
npm run build
npm run preview
```

## Notas

- Las imágenes de los productos se cargan por URL (campo `imagen_url`), no se usa Supabase Storage.
- Cualquier usuario logueado tiene permisos completos de CRUD sobre los productos (no hay roles).
- Si una URL de imagen no carga, se muestra un placeholder automáticamente.
