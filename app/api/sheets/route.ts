import { NextRequest, NextResponse } from "next/server"
import { tr, trItems } from "@/app/lib/translations"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

const PYTHON_API_URL = "https://pythonactions.cruzdomain.cloud/onboarding"

// ── Utilidades de formato ───────────────────────────────────────────────────

/**
 * Convierte cualquier valor del formulario a string legible para el sheet.
 * - FrequencyItem[]: "Sal (Diariamente), Azúcar (1-2 veces por semana)"
 * - string[]: "Manzana, Pera, Naranja"
 * - Primitivos: String(val)
 * - null / undefined / '': cadena vacía
 */
function fmt(val: unknown): string {
  if (val === null || val === undefined || val === "") return ""
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === "object" && "name" in val[0]) {
      return (val as { name: string; frequency: string }[])
        .map((i) => `${i.name}${i.frequency ? ` (${i.frequency})` : ""}`)
        .join(", ")
    }
    return (val as string[]).join(", ")
  }
  return String(val)
}

// ── Endpoint POST /api/sheets ───────────────────────────────────────────────

/**
 * Recibe los datos del onboarding, construye los arrays posicionales
 * que espera el endpoint Python y los envía a pythonactions.cruzdomain.cloud/onboarding.
 *
 * Arrays enviados:
 * - entrenamiento: 18 valores — siempre se escribe
 * - nutriologia:   44 valores — solo si wantsNutritionPlan === true
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    const fecha = new Date().toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })
    const isManual = data.manualMetrics === true
    const wantsNutrition = data.wantsNutritionPlan === true

    // Obtener nombre y teléfono del usuario desde Supabase user_metadata
    let nombre = ""
    let telefono = ""
    if (data.userId) {
      const supabaseAdmin = getSupabaseAdmin()
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(data.userId)
      const meta = userData?.user?.user_metadata ?? {}
      nombre   = [meta.first_name ?? "", meta.last_name ?? ""].filter(Boolean).join(" ")
      telefono = meta.phone ?? userData?.user?.phone ?? ""
    }

    // Métricas corporales compartidas (usadas en ambas hojas)
    const modoMedicion = isManual ? "Manual" : "InBody"
    const estatura     = fmt(data.height)
    const peso         = fmt(data.weight)
    const cintura      = isManual ? fmt(data.waist)      : ""
    const cadera       = isManual ? fmt(data.hip)        : ""
    const brazo        = isManual ? fmt(data.arm)        : ""
    const muneca       = isManual ? fmt(data.wrist)      : ""
    const altRodilla   = isManual ? fmt(data.kneeHeight) : ""
    const pantorrilla  = isManual ? fmt(data.calf)       : ""
    const imc          = isManual ? "" : fmt(data.imc)
    const grasa        = isManual ? "" : fmt(data.fatPercentage)
    const musculo      = isManual ? "" : fmt(data.musclePercentage)
    const grasaVisc    = isManual ? "" : fmt(data.viceralFatPercentage)
    const aguaCorp     = isManual ? "" : fmt(data.bodyWaterPercentage)
    const minerales    = isManual ? "" : fmt(data.boneMass)

    // Entrenamiento: 18 columnas (A:R)
    // Orden: Fecha, Nombre, Número, Modo Medición, Estatura, Peso, Cintura, Cadera,
    //        Brazo, Muñeca, Altura Rodilla, Pantorrilla, IMC, % Grasa, Masa Muscular,
    //        Grasa Visceral, Agua Corporal, Minerales Óseos
    const entrenamiento = [
      fecha, nombre, telefono, modoMedicion,
      estatura, peso,
      cintura, cadera, brazo, muneca, altRodilla, pantorrilla,
      imc, grasa, musculo, grasaVisc, aguaCorp, minerales,
    ]

    // Nutriología: 44 columnas (A:AR) — solo si el usuario quiere plan de nutrición
    // Orden: Fecha, Número, Nombre, Agua (L), Horas Sueño, Comidas/Día,
    //        Toma Medicamentos, Medicamentos, Otro Medicamento,
    //        Toma Suplementos, Suplementos, Otro Suplemento,
    //        Alcohol, Tabaco, Condiciones Médicas, Otras Condiciones,
    //        Síntomas, Otros Síntomas, Frutas, Frecuencia Frutas,
    //        Verduras, Frecuencia Verduras, Condimentos, Azúcares, Grasas, Bebidas,
    //        Alimentos Favoritos, Otros Favoritos, Alimentos No Favoritos,
    //        Modo Medición, Estatura, Peso, Cintura, Cadera, Brazo, Muñeca,
    //        Altura Rodilla, Pantorrilla, IMC, % Grasa, Masa Muscular,
    //        Grasa Visceral, Agua Corporal, Minerales Óseos
    const nutriologia = wantsNutrition ? [
      fecha, telefono, nombre,
      fmt(data.consumedWater),
      fmt(data.restHours),
      fmt(data.mealTimes),
      data.takesMedication === true ? "Sí" : data.takesMedication === false ? "No" : "",
      fmt(data.medication),
      fmt(data.otherMedication),
      data.takesSupplements === true ? "Sí" : data.takesSupplements === false ? "No" : "",
      fmt(data.takesSumplements),
      fmt(data.otherSuplement),
      tr(data.consumesAlcohol),
      tr(data.consumesTobacco),
      fmt(data.conditions),
      fmt(data.otherConditions),
      fmt(data.symptoms),
      fmt(data.otherSymptoms),
      fmt(data.fruits),
      tr(data.fruitsFrequency),
      fmt(data.vegetables),
      tr(data.vegetablesFrequency),
      fmt(trItems(data.condiments)),
      fmt(trItems(data.sugar)),
      fmt(trItems(data.fat)),
      fmt(trItems(data.drinks)),
      fmt(data.favoriteFoods),
      fmt(data.otherFavoriteFoods),
      fmt(data.noFavoriteFoods),
      modoMedicion,
      estatura, peso,
      cintura, cadera, brazo, muneca, altRodilla, pantorrilla,
      imc, grasa, musculo, grasaVisc, aguaCorp, minerales,
    ] : []

    const res = await fetch(PYTHON_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entrenamiento, nutriologia }),
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`Python API error ${res.status}: ${detail}`)
    }

    // Sync wants_nutrition flag to profiles so nutrition module can filter correctly
    if (data.userId) {
      const supabaseAdmin = getSupabaseAdmin()
      await supabaseAdmin
        .from("profiles")
        .update({ wants_nutrition: wantsNutrition })
        .eq("id", data.userId)

      // Save initial body measurement from onboarding so nutrition view has data from day 1
      const weightRaw = data.weight ?? data.currentWeight
      const weightVal = weightRaw ? Number(weightRaw) : null
      console.log("[sheets] body_measurements insert — isManual:", isManual, "weight:", weightVal, "userId:", data.userId)
      if (weightVal) {
        const measurement: Record<string, unknown> = {
          user_id: data.userId,
          measured_at: new Date().toISOString().slice(0, 10),
          weight_kg: weightVal,
          notes: "Medición inicial — onboarding",
        }
        if (isManual) {
          if (data.waist)     measurement.waist_cm         = Number(data.waist)
          if (data.hip)       measurement.hip_cm           = Number(data.hip)
          if (data.arm)       measurement.arm_cm           = Number(data.arm)
        } else {
          if (data.imc)                  measurement.imc              = Number(data.imc)
          if (data.fatPercentage)        measurement.fat_percentage   = Number(data.fatPercentage)
          if (data.musclePercentage)     measurement.muscle_mass_kg   = Number(data.musclePercentage)
          if (data.bodyWaterPercentage)  measurement.water_percentage = Number(data.bodyWaterPercentage)
          if (data.viceralFatPercentage) measurement.visceral_fat     = Number(data.viceralFatPercentage)
          if (data.boneMass)             measurement.bone_mass_kg     = Number(data.boneMass)
        }
        const { error: insertError } = await supabaseAdmin.from("body_measurements").insert(measurement)
        if (insertError) console.error("[sheets] body_measurements insert failed:", insertError)
        else console.log("[sheets] body_measurements insert OK")
      } else {
        console.warn("[sheets] no weight found in payload — skipping body_measurements insert. data.weight:", data.weight, "data.currentWeight:", data.currentWeight)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/sheets:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
