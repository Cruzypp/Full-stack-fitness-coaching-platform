-- Migración: soporte para ejercicios marcados como lesionado en PR Inicial
-- Ejecutar en Supabase SQL Editor

-- Permite weight_kg nulo cuando el atleta está lesionado
ALTER TABLE pr_records ALTER COLUMN weight_kg DROP NOT NULL;

-- Columna que indica si el atleta no pudo realizar el ejercicio por lesión
ALTER TABLE pr_records ADD COLUMN IF NOT EXISTS injured boolean NOT NULL DEFAULT false;
