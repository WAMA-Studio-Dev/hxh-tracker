# HxH Tracker

Tracker minimalista de progreso para **Hunter x Hunter (2011)** — 148 capítulos repartidos en 6 temporadas. Sincroniza el capítulo actual entre dispositivos mediante un *Sync ID* en la URL, sin login. Next.js 15 (App Router) + Tailwind CSS v4 + Supabase, PWA instalable con soporte offline básico.

## 1. Poner en marcha en local

```bash
npm install
npm run gen:icons   # genera los iconos PWA en public/icons (sólo hace falta una vez)
npm run dev
```

Sin configurar Supabase la app funciona igualmente: guarda todo en `localStorage` del navegador (modo "sólo en este dispositivo"). Para tener sincronización multi-dispositivo, sigue el paso 2.

## 2. Conectar tu proyecto Supabase

Puedes reutilizar el mismo proyecto Supabase que ya tienes para otra app (por ejemplo el diario de Erasmus) — esto crea una tabla nueva e independiente, no toca nada existente.

1. Entra en [supabase.com/dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor**.
2. Copia y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql). Crea la tabla `hxh_progress`, activa Row Level Security con políticas abiertas (el modelo es "quien tenga el enlace, puede leer/escribir esa fila", igual que un documento compartido por enlace) y habilita Realtime para que PC y móvil se vean actualizados al instante.
3. Ve a **Settings → API** y copia la **Project URL** y la **anon public key**.
4. Copia `.env.local.example` a `.env.local` y rellena esos dos valores:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
   ```
5. Reinicia `npm run dev`. La barra superior debería pasar de "Sólo en este dispositivo" a "Sincronizado".

> La anon key es pública por diseño (así funciona el cliente de Supabase en el navegador); la seguridad real la da RLS + que el `sync_id` sólo viaja por tu enlace privado.

## 3. Desplegar en Vercel

1. Sube este proyecto a un repositorio (GitHub/GitLab/Bitbucket) o usa `vercel --prod` directamente desde esta carpeta.
2. Importa el repo en [vercel.com/new](https://vercel.com/new).
3. En **Environment Variables**, añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los mismos valores de tu `.env.local`.
4. Deploy. Next.js y Tailwind no necesitan configuración adicional en Vercel.

## Cómo funciona la sincronización

- Al abrir la app se genera (o reutiliza) un **Sync ID** de 6 caracteres, guardado en la URL (`?sync=xxxxx`) y en `localStorage`.
- Cada cambio de capítulo se escribe al instante en `localStorage` (carga siempre inmediata) y, con un pequeño *debounce*, en Supabase.
- Al abrir el mismo enlace en otro dispositivo, se lee el valor guardado en Supabase y, gracias a Supabase Realtime, cualquier cambio posterior en un dispositivo se refleja en los demás sin recargar.
- Sin conexión, seguís usando el último valor visto en local; al reconectar se sincroniza solo.
- Botón **"Copiar enlace"** y **QR** en la barra superior para abrir el mismo progreso en el móvil al instante.

## Estructura

```
app/                 Next.js App Router (layout, página, manifest, favicon)
components/          UI (hero, controles, temporadas, sync, QR, rewatch, export…)
lib/                 Lógica de datos: temporadas, ritmo/fechas, sync-id, Supabase, hook de progreso
public/sw.js         Service worker básico (cache-first del shell, offline)
scripts/             Generador de iconos PWA (pngjs, sin dependencias nativas)
supabase/schema.sql  Tabla + RLS + Realtime
```

## Notas de diseño

- Sin librerías de animación pesadas: todo se anima con CSS (`transition`/`@keyframes`), pensado para carga instantánea.
- Spoilers ocultos por defecto: el enlace compartido sólo revela el número de capítulo; hay que activar "Spoilers visibles" para ver los nombres de los arcos.
- Atajos de teclado en escritorio: `→` +1, `Shift` + `→` +2, `←` −1.
