-- Tabla para registrar los PRs iniciales de cada atleta (Semana 0)
CREATE TABLE pr_records (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ejercicio: 'Back Squat', 'Bench Press', 'Shoulder Press', 'Pull', 'Deadlift'
  exercise     text NOT NULL,

  -- Peso levantado (kg). Para Pull puede ser el peso usado en 5RM
  weight_kg    numeric(6, 2) NOT NULL,

  -- Reps completadas (1 para PR, 5 para Pull 5RM técnico)
  reps         integer DEFAULT 1,

  -- Sensación reportada por el atleta
  sensation    text,

  -- Semana del programa (0 = PR Inicial)
  week         integer DEFAULT 0,

  recorded_at  timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE pr_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Atleta lee sus propios records"
  ON pr_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Atleta inserta sus propios records"
  ON pr_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- El coach (admin) puede ver todos los records
CREATE POLICY "Admin lee todos los records"
  ON pr_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
