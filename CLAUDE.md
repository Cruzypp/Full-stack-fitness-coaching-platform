# The On3 P3rcent — Landing Page App

## ¿Qué es este proyecto?
App web de fitness/coaching para "The On3 P3rcent". Combina landing page de ventas, onboarding de nuevos miembros, registro de PRs de ejercicio y un panel admin. Los usuarios son clientes del gym que se registran, completan un onboarding nutricional y registran sus pesos máximos (PRs) de 4 ejercicios base.

## Stack
- **Framework**: Next.js 14+ (App Router, `app/` directory)
- **DB + Auth**: Supabase (client: `app/lib/connection.ts`, admin: `lib/supabase-admin.ts`)
- **Estado global**: Zustand — `useAuthStore` (usuario/sesión), `useOnboardingStore`
- **Formularios**: react-hook-form + Zod (`app/lib/onboarding.schema.ts`)
- **Animaciones**: Framer Motion
- **Pagos**: Stripe (`app/api/checkout/`, `app/api/stripe/`)
- **Google Sheets**: Python API externa en `https://pythonactions.cruzdomain.cloud/onboarding` (ruta: `app/api/sheets/route.ts`)
- **UI**: Tailwind CSS + componentes en `components/ui/`, shadcn/ui-style

## Diseño / convenciones visuales
- Fondo oscuro: `bg-[#050505]`
- Fuentes: `font-bebas` para headings principales, `font-label` para labels/tracking
- Paleta: `text-primary` (acento), `text-muted-foreground` (secundario), `text-destructive` (errores/lesionado)
- Bordes suaves: `border-border`, redondeados `rounded-2xl`
- Mobile-first con BottomNav (`components/BottomNav.tsx`), nav desktop en páginas clave

## Rutas principales
| Ruta | Descripción |
|------|-------------|
| `/` | Landing / pricing principal |
| `/pricing` | Página de pricing |
| `/signup` | Registro de usuario |
| `/auth` | Auth (magic link / email) |
| `/login` | Login |
| `/onboarding` | Wizard de onboarding nutricional (11 pasos o 2 mínimos) |
| `/pr-inicial` | Registro inicial de PRs en 4 ejercicios |
| `/mis-cargas` | Vista de pesos máximos + porcentajes de trabajo |
| `/admin/dashboard` | Panel admin |
| `/admin/promos` | Gestión de promociones |
| `/success` | Página post-pago exitoso |

## Base de datos — tablas clave

### `pr_records`
Registros de pesos máximos por ejercicio.
```
id           uuid PK
user_id      uuid FK → auth.users
exercise     text   (ej. 'Back Squat', 'Bench Press', 'Shoulder Press', 'Deadlift')
weight_kg    numeric NULLABLE  — null si el usuario está lesionado
reps         integer            — 1 para 1RM
sensation    text NULLABLE      — descripción libre; 'Lesionado' si injured
injured      boolean            — true si el ejercicio fue marcado como lesionado
week         integer            — 0 = PR inicial
recorded_at  timestamptz
```

**Regla importante**: si `injured = true`, `weight_kg` es `null` y `sensation = 'Lesionado'`. En `mis-cargas` se detecta con `record.injured === true || record.sensation === 'Lesionado'` (doble check por compatibilidad con registros históricos).

## Flujo de onboarding
1. Usuario paga → Stripe crea cuenta → `/onboarding`
2. Onboarding: wizard con Zod + react-hook-form. Steps configurados en `app/onboarding/_config/steps.ts`
   - Flujo nutrición: 11 pasos (`NUTRITION_STEPS`)
   - Flujo mínimo (solo medidas): 2 pasos (`MINIMAL_STEPS`)
3. Al finalizar onboarding → `POST /api/sheets` envía datos a Python API → Google Sheets
4. Coach envía link de `/pr-inicial` por WhatsApp
5. Usuario registra PRs en 4 ejercicios (puede marcar lesionado)
6. `/mis-cargas` muestra PRs con tabla de porcentajes (50%–100%)

## Flujo PR Inicial (`/pr-inicial`)
- 4 ejercicios: Back Squat (Lun), Bench Press (Mar), Shoulder Press (Jue), Deadlift (Vie)
- Cada ejercicio puede marcarse como **lesionado** → se guarda con `injured: true`, `weight_kg: null`
- Formulario manejado con react-hook-form, validación por step
- Estado lesionado: mapa `injuredMap` keyed por `weightField` del ejercicio

## Vista Mis Cargas (`/mis-cargas`)
- Query a `pr_records` → deduplica al PR más reciente por ejercicio
- Ejercicios **normales**: card con header (nombre + peso) + tabla de 9 porcentajes clicables
- Ejercicios **lesionados**: card simplificada con 🤕 + nombre + badge "Lesionado" (sin tabla)
- Porcentajes: `[50, 60, 70, 75, 80, 85, 90, 95, 100]`
- Filas de porcentaje son clicables para resaltar (highlight verde)

## API Routes
- `POST /api/sheets` — envía datos onboarding a Python API → Google Sheets
- `POST /api/checkout` — crea sesión Stripe
- `POST /api/stripe` — webhook Stripe
- `POST /api/verify-session` — verifica sesión de pago
- `POST /api/inbody` — procesa datos InBody

## Archivos clave de configuración
- `app/lib/onboarding.options.ts` — listas de opciones UI del onboarding
- `app/lib/onboarding.schema.ts` — schema Zod del onboarding
- `app/lib/translations.ts` — traducciones de valores del formulario
- `app/onboarding/_config/steps.ts` — configuración de pasos del wizard
- `middleware.ts` — rutas protegidas

## Notas de desarrollo
- La barra olímpica pesa 20 kg — los PRs deben incluirla (se muestra aviso en el form)
- `useAuthStore` inicializa con `loading: true`; los componentes deben esperar `!authLoading`
- El rol admin está en `user.user_metadata.role === 'admin'`
- Fonts personalizadas: `font-bebas`, `font-label` definidas en Tailwind config
