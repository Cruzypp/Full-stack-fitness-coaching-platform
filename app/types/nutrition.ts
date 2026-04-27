export type MealSlot = 'desayuno' | 'comida' | 'cena' | 'snack' | 'colacion'
export type RecipeCategory = MealSlot

export interface Ingredient {
  name: string
  amount: string
  unit?: string
}

export interface Recipe {
  id: string
  name: string
  category: RecipeCategory
  description?: string
  calories?: number
  protein_g?: number
  carbs_g?: number
  fats_g?: number
  ingredients: Ingredient[]
  instructions?: string
  tags: string[]
  created_by?: string
  created_at: string
  updated_at: string
}

export interface MealPlan {
  id: string
  user_id: string
  year_month: string
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface MealPlanEntry {
  id: string
  meal_plan_id: string
  recipe_id?: string
  day_of_month: number
  meal_slot: MealSlot
  name: string
  calories?: number
  protein_g?: number
  carbs_g?: number
  fats_g?: number
  ingredients: Ingredient[]
  instructions?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface BodyMeasurement {
  id: string
  user_id: string
  measured_at: string
  weight_kg?: number
  fat_percentage?: number
  muscle_mass_kg?: number
  water_percentage?: number
  visceral_fat?: number
  bone_mass_kg?: number
  imc?: number
  waist_cm?: number
  hip_cm?: number
  arm_cm?: number
  notes?: string
  created_at: string
}

export interface NutritionClient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  payment_date?: string
  wants_nutrition: boolean
  nutrition_reminders_enabled: boolean
  lives_lost: number
  nutriologo_id?: string | null
  latest_measurement?: BodyMeasurement | null
}

export interface Nutriologo {
  id: string
  first_name: string
  last_name: string
  email: string
}
