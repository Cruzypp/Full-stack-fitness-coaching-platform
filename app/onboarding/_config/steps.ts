/**
 * Configuración del wizard de onboarding.
 *
 * Centraliza la definición de pasos y sus reglas de validación,
 * manteniendo page.tsx libre de constantes de configuración.
 */

import type { OnboardingFormData } from "@/app/types/onboarding"

/** Identificador único de cada paso del wizard */
export type StepKey =
  | "plan"
  | "general"
  | "medication"
  | "supplements"
  | "habits"
  | "conditions"
  | "fruits-veg"
  | "condiments-sugar"
  | "fats-drinks"
  | "favorites"
  | "metrics"

/** Flujo completo cuando el usuario sí quiere plan de nutrición (11 pasos) */
export const NUTRITION_STEPS: StepKey[] = [
  "plan", "general", "medication", "supplements", "habits",
  "conditions", "fruits-veg", "condiments-sugar", "fats-drinks",
  "favorites", "metrics",
]

/** Flujo reducido cuando el usuario solo quiere registrar medidas (2 pasos) */
export const MINIMAL_STEPS: StepKey[] = ["plan", "metrics"]

/**
 * Campos de react-hook-form a validar al avanzar cada paso.
 * Se pasan a trigger() para activar los mensajes de error inline.
 *
 * Los campos condicionales (ej. "otherMedication") se incluyen aunque estén
 * desmontados — RHF los ignora si no tienen reglas activas en ese momento.
 */
export const STEP_TRIGGER_FIELDS: Partial<Record<StepKey, (keyof OnboardingFormData)[]>> = {
  plan: ["wantsNutritionPlan"],
  medication: ["takesMedication", "medication", "otherMedication"],
  supplements: ["takesSupplements", "takesSumplements", "otherSuplement"],
  conditions: ["conditions", "otherConditions", "symptoms", "otherSymptoms"],
  "fruits-veg": ["fruits", "fruitsFrequency", "otherFruits", "vegetables", "vegetablesFrequency", "otherVegetables"],
  favorites: ["favoriteFoods", "otherFavoriteFoods"],
  metrics: ["manualMetrics"],
}
