-- ═══════════════════════════════════════════════════════════
-- MIGRACIÓN: Soporte multi-coach
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Agregar coach_id a profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS coach_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Índice para queries por coach
CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON profiles(coach_id);

-- 2. Tabla de códigos de invitación
CREATE TABLE IF NOT EXISTS invite_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text UNIQUE NOT NULL,
  coach_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'nutriologo',
  used_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at  timestamptz,
  is_used     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS en invite_codes
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- El coach ve y gestiona sus propios códigos
CREATE POLICY "Coach gestiona sus códigos"
  ON invite_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
      AND id = invite_codes.coach_id
    )
  );

-- Cualquiera puede leer un código para validarlo (sin auth, necesario en signup)
CREATE POLICY "Lectura pública para validar código"
  ON invite_codes FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════
-- OPCIONAL: asignar alumnos existentes al coach actual
-- Reemplaza 'UUID-DEL-COACH-ACTUAL' con el UUID del coach admin
-- ═══════════════════════════════════════════════════════════
-- UPDATE profiles
-- SET coach_id = 'UUID-DEL-COACH-ACTUAL'
-- WHERE coach_id IS NULL;
