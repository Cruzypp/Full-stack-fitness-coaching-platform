# Apex Coaching — Fitness Coaching Platform

> Full-stack web application for a personal training program. Handles member acquisition (Stripe payments), nutritional onboarding, personal-record tracking, and a coach admin panel.

---

## Overview

Apex Coaching is a production-grade coaching platform that takes a prospective client from first visit to fully onboarded member. The flow covers:

1. **Landing / Pricing** — Sales page with Stripe checkout
2. **Onboarding wizard** — 11-step nutritional intake form (or a 2-step minimal flow)
3. **PR tracking** — Record 1-rep maxes for 4 core lifts; flag injuries
4. **Training loads** — Auto-calculated percentage tables (50%–100%) per lift
5. **Nutrition module** — Coach-facing meal plan builder with PDF export
6. **Admin panel** — Member management, invite codes, gamification (lives system)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database & Auth | Supabase (PostgreSQL + Row-Level Security) |
| Payments | Stripe (Checkout Sessions + Webhooks) |
| State management | Zustand |
| Forms & validation | react-hook-form + Zod |
| Animations | Framer Motion + GSAP |
| PDF generation | @react-pdf/renderer |
| Styling | Tailwind CSS v4 + shadcn/ui |
| External integrations | Google Sheets API, InBody PDF parser (Python microservice) |

---

## Features

### Member-facing
- **Stripe checkout** — subscription or one-time payment, webhook-driven account creation
- **Multi-step onboarding** — Zod-validated wizard, InBody PDF upload (auto-parses body composition data), manual body measurements fallback
- **PR tracker** (`/pr-inicial`, `/mis-cargas`) — log 1RM per exercise, mark exercises as injured, view percentage-based training loads in an interactive table
- **Magic link auth** — Supabase email auth, no password required

### Coach / Admin
- **Nutrition client list** — view onboarding data, body measurements over time, send meal plans via WhatsApp
- **Meal plan builder** — drag-and-drop recipe assignment per meal slot, PDF export
- **Body measurement history** — graph-ready data per client
- **Admin dashboard** — manage invite codes, set gamification lives per member, view team

---

## Architecture

```
Browser
  │
  ├── Next.js App Router (app/)
  │     ├── Server Components — data fetching, Supabase admin queries
  │     ├── Client Components — forms, animations, interactive UI
  │     └── API Routes (app/api/)
  │           ├── /checkout        — Stripe session creation
  │           ├── /stripe          — Stripe webhook handler
  │           ├── /verify-session  — post-payment account setup
  │           ├── /sheets          — onboarding → Google Sheets sync
  │           ├── /inbody          — InBody PDF → structured data (via Python API)
  │           ├── /nutrition/*     — meal plans, recipes, body measurements CRUD
  │           ├── /invite-codes/*  — invite code validation & management
  │           └── /admin-lives     — gamification lives management
  │
  ├── Supabase
  │     ├── auth.users             — member accounts
  │     ├── profiles               — extended user data, role, nutrition flag
  │     ├── pr_records             — 1RM logs per exercise per week
  │     ├── body_measurements      — longitudinal body comp data
  │     ├── meal_plans / recipes   — nutrition module
  │     └── invite_codes           — access control for new signups
  │
  └── External Services
        ├── Stripe                 — payments
        ├── Google Sheets          — coach-accessible onboarding data
        └── Python microservice    — InBody PDF parsing, Sheets sync
```

---

## Database Schema (key tables)

### `pr_records`
```sql
id           uuid PRIMARY KEY
user_id      uuid REFERENCES auth.users
exercise     text   -- 'Back Squat' | 'Bench Press' | 'Shoulder Press' | 'Deadlift'
weight_kg    numeric NULLABLE  -- null when injured
reps         integer           -- 1 for 1RM
sensation    text NULLABLE     -- free text; 'Lesionado' when injured
injured      boolean
week         integer           -- 0 = initial PR
recorded_at  timestamptz
```

Migrations are in `/supabase/*.sql`.

---

## Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode works)
- Optional: Google Service Account with Sheets API enabled

### 1. Clone & install
```bash
git clone https://github.com/your-username/one-percent-landing-page.git
cd one-percent-landing-page
npm install
```

### 2. Environment variables
```bash
cp .env.example .env
```

Fill in `.env` with your Supabase, Stripe, and Google credentials. See `.env.example` for all required keys.

### 3. Database
Run the SQL files in `/supabase/` against your Supabase project (SQL editor or CLI):

```bash
# Using Supabase CLI
supabase db push
# Or manually run:
# supabase/pr_records.sql
# supabase/pr_records_add_injured.sql
```

### 4. Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── (auth pages)       login/ signup/ auth/
├── admin/             dashboard, promos, team, lives management
├── api/               all API route handlers
├── mis-cargas/        training load view (PR percentages)
├── nutricion/         coach-facing nutrition module
├── onboarding/        multi-step onboarding wizard
├── pr-inicial/        initial PR registration flow
├── pricing/           pricing page
├── lib/               Supabase client, Stripe, Zod schemas, translations
├── hooks/             custom React hooks
├── store/             Zustand stores (auth, onboarding)
└── types/             TypeScript type definitions

components/
├── ui/                shadcn/ui-style base components
├── BottomNav.tsx       mobile navigation
└── ExerciseCard.tsx    reusable PR card with percentage table

supabase/              SQL migrations
```

---

## Design System

- **Background**: `#050505` dark base
- **Accent**: CSS variable `--primary` (configurable)
- **Headings**: `font-bebas` (Bebas Neue)
- **Labels/tracking**: `font-label`
- **Components**: shadcn/ui pattern — class-variance-authority + Tailwind
- **Mobile-first** with bottom navigation on mobile, sidebar on desktop (admin)

---

## Deployment

Designed for [Vercel](https://vercel.com). Set all environment variables in the Vercel dashboard.

The Python microservice (InBody parsing, Google Sheets sync) is a separate FastAPI service — not included in this repo. The app degrades gracefully if `PYTHON_API_BASE_URL` is not set (those integrations will return 500 errors but the core flows still work).

---

## Notes

- The Olympic barbell weighs 20 kg — users are prompted to include it in their PR weight
- `useAuthStore` initializes with `loading: true`; components wait on `!authLoading` before rendering protected content
- Admin role: `user.user_metadata.role === 'admin'`
- Injury state: double-checked via `record.injured === true || record.sensation === 'Lesionado'` for backwards compatibility with older records
