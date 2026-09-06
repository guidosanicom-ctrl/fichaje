# Fichajes - Carpintería Matu

PWA simple para que Mateo y Franco marquen entrada/salida, y para que Pablo vea el resumen de horas trabajadas.

## Stack

- React + Vite
- Supabase (base de datos, sin login)
- vite-plugin-pwa (instalable en el celular)

## 1. Crear el proyecto en Supabase

1. Andá a https://supabase.com y creá un proyecto nuevo (gratis).
2. En el proyecto, abrí **SQL Editor > New query**, pegá el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecutalo. Esto crea la tabla `fichajes` con RLS (solo permite leer todo e insertar fichajes válidos; no se puede editar ni borrar desde el cliente).
3. Andá a **Project Settings > API** y copiá:
   - `Project URL`
   - `anon public` key

## 2. Configurar variables de entorno

Editá el archivo `.env.local` (ya creado) con los valores reales:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxx
```

`.env.local` no se sube a git (está en `.gitignore`).

## 3. Correr en desarrollo

```bash
npm run dev
```

Abrí la URL que muestra la consola (ej. `http://localhost:5173`) desde el celular (misma red wifi que la PC, usando la IP local) para probarlo mobile-first, o simplemente reducí el ancho de la ventana del navegador.

## 4. Deploy a Vercel

1. Subí este proyecto a un repo de GitHub.
2. En https://vercel.com, "Add New Project" e importá el repo (framework detectado: Vite).
3. En **Environment Variables** cargá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores de `.env.local`.
4. Deploy. Vercel te da una URL tipo `https://carpineria-matu.vercel.app`.

## 5. Instalar como app en el celular

- **Android (Chrome)**: abrir la URL, tocar el menú (⋮) > "Instalar app" o "Agregar a pantalla de inicio".
- **iPhone (Safari)**: abrir la URL, tocar el botón de Compartir > "Agregar a pantalla de inicio".

## Cómo funciona

- **Pantalla de inicio (`/`)**: elegís "Mateo" o "Franco".
- **Marcar (`/marcar/:persona`)**: un botón grande que dice "Marcar entrada" o "Marcar salida" según el último fichaje de esa persona. Al tocarlo, guarda el registro en Supabase con hora exacta.
- **Resumen (`/resumen`)**: accesible desde un link en la pantalla de inicio, sin login. Muestra, por persona: total de horas por semana, y el detalle día por día con cada hora de entrada y salida.

## Notas de seguridad

No hay autenticación de usuarios. La tabla `fichajes` tiene Row Level Security habilitado con políticas que:
- permiten **leer** todos los fichajes (para el resumen),
- permiten **insertar** solo si `persona` es "Mateo" o "Franco" y `tipo` es "entrada" o "salida",
- **no** permiten `update` ni `delete` desde el cliente (nadie puede borrar o alterar el historial por accidente).

Esto es apropiado para un equipo chico y de confianza, pero cualquiera con el link puede marcar fichajes o ver el resumen — no hay control de quién marca qué desde el navegador.
