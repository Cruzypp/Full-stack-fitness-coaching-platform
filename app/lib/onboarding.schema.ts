/**
 * Schema de validación Zod para el formulario de onboarding.
 *
 * Solo contiene reglas de validación.
 * Las opciones de UI (listas de selección) están en onboarding.options.ts.
 */

import { z } from "zod"

// Re-exporta las opciones de UI para que los consumidores puedan importarlas
// desde una sola ruta si lo prefieren.
export * from "./onboarding.options"

// Frecuencia para alcohol/tabaco
const frequency = ["no", "ocasionalmente", "frecuentemente"] as const

// Frecuencia para alimentos específicos
const consumptionFrequency = [
  "1-2_week",
  "3-4_week",
  "5-6_week",
  "daily",
  "every_meal",
] as const

const frequencyItemSchema = z.object({
  name: z.string(),
  frequency: z.enum(consumptionFrequency),
})

export const onBoardingSchema = z.object({
  // General
  wantsNutritionPlan: z.boolean().nullable(),
  consumedWater: z.number().min(1),
  restHours: z.number().min(1),
  mealTimes: z.number().min(1),

  // Medicamentos
  takesMedication: z.boolean().nullable(),
  medication: z.array(z.string()).min(1, "Debes seleccionar al menos un medicamento"),
  otherMedication: z.string().optional(),

  // Suplementos
  takesSumplements: z.array(z.string()).min(1, "Debes seleccionar al menos un suplemento"),
  otherSuplement: z.string().optional(),

  // Hábitos
  consumesAlcohol: z.enum(frequency),
  consumesTobacco: z.enum(frequency),

  // Condiciones y síntomas
  conditions: z.array(z.string()).min(1),
  otherConditions: z.string().optional(),
  symptoms: z.array(z.string()).min(1),
  otherSymptoms: z.string().optional(),

  // Frutas y verduras
  fruits: z.array(z.string()).min(2, "Debes seleccionar al menos dos opciones."),
  vegetables: z.array(z.string()).min(2, "Debes seleccionar al menos dos opciones."),

  // Alimentos con frecuencia por item
  condiments: z.array(frequencyItemSchema),
  sugar: z.array(frequencyItemSchema),
  fat: z.array(frequencyItemSchema),
  drinks: z.array(frequencyItemSchema),

  favoriteFoods: z.array(z.string()).min(3, "Debes seleccionar al menos tres opciones."),
  otherFavoriteFoods: z.string().min(1, "Ingresa al menos un alimento favorito."),
  favoriteMeals: z.string().nullable(),
  noFavoriteFoods: z.string().nullable(),
  noFavoriteMeals: z.string().nullable(),

  manualMetrics: z.boolean().nullable(),
  weight: z.number().min(30, "El peso no es válido"),
  height: z.number().min(80, "Ingresa una altura válida."),
  imc: z.number().positive(),
  metabolicAge: z.number().positive(),
  fatPercentage: z.number().positive(),
  musclePercentage: z.number().positive(),
  viceralFatPercentage: z.number().positive(),
  bodyWaterPercentage: z.number().positive(),
  boneMass: z.number().positive(),

  waist: z.number().positive("La medida debe ser mayor a 0").min(30).max(250),
  hip: z.number().positive().min(30).max(250),
  arm: z.number().positive().min(10).max(100),
  wrist: z.number().positive().min(5).max(50),
  kneeHeight: z.number().positive().min(20).max(120),
  calf: z.number().positive().min(10).max(100),
})
