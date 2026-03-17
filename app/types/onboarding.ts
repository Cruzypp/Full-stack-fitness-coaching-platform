/**
 * Tipos compartidos del módulo de onboarding.
 *
 * Este archivo es la fuente de verdad de los tipos de datos.
 * Importa desde aquí en lugar de desde el store para evitar
 * acoplar componentes a la implementación de Zustand.
 */

/**
 * Representa un alimento con su frecuencia de consumo seleccionada.
 * Usado en condimentos, azúcares, grasas y bebidas.
 */
export type FrequencyItem = { name: string; frequency: string }

/**
 * Frecuencia de hábitos como alcohol o tabaco.
 * Se almacena en inglés y se traduce al español al escribir en Google Sheets.
 */
export type HabitFrequency = "no" | "ocasionalmente" | "frecuentemente"

/**
 * Todos los campos del formulario de onboarding.
 * Es la fuente de verdad para react-hook-form y el store de Zustand.
 *
 * Organización:
 * - Plan de nutrición
 * - Hábitos generales (agua, sueño, comidas)
 * - Medicamentos y suplementos
 * - Condiciones médicas y síntomas
 * - Consumo de alimentos (frutas, verduras, condimentos, etc.)
 * - Alimentos favoritos / no favoritos
 * - Métricas corporales (manuales o InBody)
 */
export interface OnboardingFormData {
  // ── Plan ──────────────────────────────────────────────
  /** Si el usuario desea un plan de nutrición personalizado. null mientras no selecciona. */
  wantsNutritionPlan: boolean | null

  // ── Hábitos generales ─────────────────────────────────
  consumedWater: number
  restHours: number
  mealTimes: number

  // ── Medicamentos ──────────────────────────────────────
  /** null mientras el usuario no responde la pregunta Sí/No */
  takesMedication: boolean | null
  medication: string[]
  otherMedication: string

  // ── Suplementos ───────────────────────────────────────
  takesSupplements: boolean | null
  /** Typo heredado — se mantiene para consistencia con el backend */
  takesSumplements: string[]
  otherSuplement: string

  // ── Hábitos ───────────────────────────────────────────
  consumesAlcohol: HabitFrequency
  consumesTobacco: HabitFrequency

  // ── Condiciones médicas ───────────────────────────────
  conditions: string[]
  otherConditions: string
  symptoms: string[]
  otherSymptoms: string

  // ── Frutas y verduras ─────────────────────────────────
  fruits: string[]
  /** Clave de frecuencia general (e.g. "1-2_week", "daily") */
  fruitsFrequency: string
  otherFruits: string
  vegetables: string[]
  vegetablesFrequency: string
  otherVegetables: string

  // ── Condimentos, azúcares, grasas, bebidas ────────────
  condiments: FrequencyItem[]
  sugar: FrequencyItem[]
  fat: FrequencyItem[]
  drinks: FrequencyItem[]

  // ── Alimentos favoritos ───────────────────────────────
  favoriteFoods: string[]
  otherFavoriteFoods: string
  favoriteMeals: string
  /** Texto libre de alimentos que el usuario NO consume */
  noFavoriteFoods: string
  noFavoriteMeals: string

  // ── Métricas corporales ───────────────────────────────
  /** true = ingreso manual de circunferencias, false = datos de máquina InBody */
  manualMetrics: boolean | null

  // Campos compartidos (ambos modos)
  weight: number | ""
  height: number | ""

  // Solo InBody
  imc: number | ""
  metabolicAge: number | ""
  fatPercentage: number | ""
  musclePercentage: number | ""
  viceralFatPercentage: number | ""
  bodyWaterPercentage: number | ""
  boneMass: number | ""

  // Solo manual (circunferencias)
  waist: number | ""
  hip: number | ""
  arm: number | ""
  wrist: number | ""
  kneeHeight: number | ""
  calf: number | ""
}

/** Valores iniciales del formulario. Los sliders usan valores representativos como punto de partida. */
export const DEFAULT_FORM_DATA: OnboardingFormData = {
  wantsNutritionPlan: null,
  consumedWater: 2,
  restHours: 7,
  mealTimes: 3,
  takesMedication: null,
  medication: [],
  otherMedication: "",
  takesSupplements: null,
  takesSumplements: [],
  otherSuplement: "",
  consumesAlcohol: "no",
  consumesTobacco: "no",
  conditions: [],
  otherConditions: "",
  symptoms: [],
  otherSymptoms: "",
  fruits: [],
  fruitsFrequency: "",
  otherFruits: "",
  vegetables: [],
  vegetablesFrequency: "",
  otherVegetables: "",
  condiments: [],
  sugar: [],
  fat: [],
  drinks: [],
  favoriteFoods: [],
  otherFavoriteFoods: "",
  favoriteMeals: "",
  noFavoriteFoods: "",
  noFavoriteMeals: "",
  manualMetrics: null,
  weight: "",
  height: "",
  imc: "",
  metabolicAge: "",
  fatPercentage: "",
  musclePercentage: "",
  viceralFatPercentage: "",
  bodyWaterPercentage: "",
  boneMass: "",
  waist: "",
  hip: "",
  arm: "",
  wrist: "",
  kneeHeight: "",
  calf: "",
}
