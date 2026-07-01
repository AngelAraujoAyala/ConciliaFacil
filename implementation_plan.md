# Implementation Plan - Configurar Redirecciones y Callback de Supabase Auth

Este plan detalla los cambios para configurar el flujo de confirmación de correo de Supabase Auth, redirigiendo a los usuarios al dashboard en lugar de la landing page, con soporte multi-entorno dinámico y limpieza estética de la URL.

## User Review Required

> [!IMPORTANT]
> - Se creará la ruta `/auth/callback` en el frontend para procesar el token de confirmación de email y establecer la sesión activa en Supabase Client de forma automática.
> - Se añadirá una ruta comodín `/dashboard` que redirigirá automáticamente a `/home` para garantizar compatibilidad con cualquier llamada al Dashboard.
> - Se configurarán variables de entorno `VITE_SITE_URL` para desarrollo y producción.

## Proposed Changes

### Configuration Files

#### [NEW] [env.development](file:///c:/React/ConciliaFacil/frontend/.env.development)
- Definición de variables para desarrollo:
  ```env
  VITE_API_URL=http://localhost:3000/api
  VITE_SUPABASE_URL=https://xthqrvpezlrlqpojmpmd.supabase.co
  VITE_SUPABASE_ANON_KEY=...
  VITE_SITE_URL=http://localhost:5173
  ```

#### [NEW] [env.production](file:///c:/React/ConciliaFacil/frontend/.env.production)
- Definición de variables para producción:
  ```env
  VITE_API_URL=https://api.conciliafacil.com/api
  VITE_SUPABASE_URL=https://xthqrvpezlrlqpojmpmd.supabase.co
  VITE_SUPABASE_ANON_KEY=...
  VITE_SITE_URL=https://app.conciliafacil.com
  ```

---

### Authentication Logic & Redirects

#### [MODIFY] [useRegisterMutation.ts](file:///c:/React/ConciliaFacil/frontend/src/features/auth/hooks/useRegisterMutation.ts)
- Configurar el parámetro `options.emailRedirectTo` en `supabase.auth.signUp`.
- Obtener el origen dinámicamente usando `import.meta.env.VITE_SITE_URL || window.location.origin`.

---

### Auth Callback Component

#### [NEW] [AuthCallback.tsx](file:///c:/React/ConciliaFacil/frontend/src/features/auth/pages/AuthCallback.tsx)
- Crear el componente para la ruta `/auth/callback`.
- Escuchar `supabase.auth.onAuthStateChange` y verificar la sesión actual.
- Al obtener una sesión válida, limpiar los fragmentos de hash de la URL (`#access_token=...`) mediante `window.history.replaceState` y redirigir inmediatamente a `/dashboard`.
- Mostrar un loader de interfaz Fintech premium y limpio: "Verificando tus datos y preparando tu espacio...".

---

### Routing Configuration

#### [MODIFY] [appRoutes.tsx](file:///c:/React/ConciliaFacil/frontend/src/routes/appRoutes.tsx)
- Importar y registrar la ruta `/auth/callback` con el componente `AuthCallback`.
- Agregar un redirect de `/dashboard` hacia `/home` para garantizar compatibilidad total con la estructura de layout actual.

## Verification Plan

### Automated Tests
- Ejecutaremos TypeScript (`npx tsc --noEmit`) para validar que las firmas y tipos no rompan el proyecto.

### Manual Verification
1. Registrar un nuevo usuario.
2. Confirmar que el email de Supabase se envía con el enlace apuntando a `http://localhost:5173/auth/callback`.
3. Al pulsar en el enlace, el usuario entra a la ruta `/auth/callback`, ve el spinner de carga y la URL se limpia de tokens.
4. Tras validación de la sesión, el usuario es redirigido a `/dashboard`, y de ahí a `/home` de manera invisible y fluida.
