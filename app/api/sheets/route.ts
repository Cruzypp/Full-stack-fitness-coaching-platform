import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { createClient } from "@supabase/supabase-js"
import { tr, trItems } from "@/app/lib/translations"

const SHEET_ID = process.env.GOOGLE_SHEET_ID!

// ── Cliente Supabase (admin) ────────────────────────────────────────────────
// Se usa service_role_key para poder leer user_metadata sin requerir sesión activa.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Cliente Google Sheets ───────────────────────────────────────────────────

/**
 * Las variables de entorno de Vercel escapan los saltos de línea como \\n literal.
 * Esta función los convierte a \n real para que la clave privada sea válida.
 */
function getPrivateKey(): string {
  const key = process.env.GOOGLE_PRIVATE_KEY ?? ""
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key
}

/** Devuelve un cliente autenticado de la API de Google Sheets v4. */
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: getPrivateKey(),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  return google.sheets({ version: "v4", auth })
}

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

/**
 * Construye un arreglo posicional para una fila del sheet a partir de un mapa de encabezados.
 * Solo escribe en las columnas cuyo encabezado exista en `data`; las demás quedan vacías.
 * Esto permite agregar o reordenar columnas en el sheet sin romper la lógica.
 */
function buildRow(headerMap: Map<string, number>, data: Record<string, string>): string[] {
  const row = new Array(headerMap.size).fill("")
  for (const [col, val] of Object.entries(data)) {
    const idx = headerMap.get(col)
    if (idx !== undefined) row[idx] = val
  }
  return row
}

/**
 * Upsert de una fila en una pestaña del sheet.
 *
 * Estrategia:
 * 1. Lee todas las filas de la pestaña.
 * 2. Busca un registro existente comparando la columna "Número" con el teléfono del usuario.
 * 3. Si encuentra coincidencia → actualiza esa fila en su posición original.
 * 4. Si no hay coincidencia → agrega una fila nueva al final.
 *
 * Nota: Las filas en Sheets API son 1-indexed y la fila 1 siempre son los encabezados,
 * por eso se suma +1 al índice del arreglo para obtener el número real de fila.
 */
async function upsertRow(
  sheets: Awaited<ReturnType<typeof getSheets>>,
  tab: string,
  data: Record<string, string>,
  phone: string
) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${tab}`,
  })

  const allRows: string[][] = res.data.values ?? []
  const headers = allRows[0] ?? []
  const headerMap = new Map(headers.map((h, i) => [h.trim(), i]))
  const row = buildRow(headerMap, data)

  const phoneColIdx = headerMap.get("Número")

  let existingRowIndex = -1
  if (phoneColIdx !== undefined && phone) {
    for (let i = 1; i < allRows.length; i++) {
      if ((allRows[i][phoneColIdx] ?? "").trim() === phone.trim()) {
        existingRowIndex = i
        break
      }
    }
  }

  if (existingRowIndex !== -1) {
    // Actualizar fila existente (+1 porque Sheets es 1-indexed)
    const sheetRow = existingRowIndex + 1
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    })
  } else {
    // Agregar nueva fila al final
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${tab}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    })
  }
}

// ── Endpoint POST /api/sheets ───────────────────────────────────────────────

/**
 * Recibe los datos del onboarding y los escribe en Google Sheets.
 *
 * Pestañas que se escriben:
 * - "Entrenamiento": siempre — contiene métricas corporales (peso, estatura, composición).
 * - "Nutriología": solo si `wantsNutritionPlan === true` — incluye todos los datos de alimentación.
 *
 * Ambas escrituras se ejecutan en paralelo con Promise.all para reducir latencia.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const sheets = await getSheets()

    const fecha = new Date().toLocaleDateString("es-MX", { timeZone: "America/Mexico_City" })
    const isManual = data.manualMetrics === true
    const wantsNutrition = data.wantsNutritionPlan === true

    // Obtener nombre y teléfono del usuario desde Supabase user_metadata
    let nombre = ""
    let telefono = ""
    if (data.userId) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(data.userId)
      const meta = userData?.user?.user_metadata ?? {}
      nombre   = [meta.first_name ?? "", meta.last_name ?? ""].filter(Boolean).join(" ")
      telefono = meta.phone ?? userData?.user?.phone ?? ""
    }

    // Campos de métricas corporales (compartidos por ambas pestañas)
    const metricsData: Record<string, string> = {
      "Fecha":               fecha,
      "Usuario ID":          fmt(data.userId),
      "Nombre":              nombre,
      "Número":              telefono,
      // "Manual" muestra circunferencias; "InBody" muestra composición corporal
      "Modo Medición":       isManual ? "Manual" : "InBody",
      "Estatura (cm)":       fmt(data.height),
      "Peso (kg)":           fmt(data.weight),
      "Cintura (cm)":        isManual ? fmt(data.waist)      : "",
      "Cadera (cm)":         isManual ? fmt(data.hip)        : "",
      "Brazo (cm)":          isManual ? fmt(data.arm)        : "",
      "Muñeca (cm)":         isManual ? fmt(data.wrist)      : "",
      "Altura Rodilla (cm)": isManual ? fmt(data.kneeHeight) : "",
      "Pantorrilla (cm)":    isManual ? fmt(data.calf)       : "",
      "IMC":                 isManual ? "" : fmt(data.imc),
      "% Grasa Corporal":    isManual ? "" : fmt(data.fatPercentage),
      "Masa Muscular (kg)":  isManual ? "" : fmt(data.musclePercentage),
      "Nivel Grasa Visceral":isManual ? "" : fmt(data.viceralFatPercentage),
      "Agua Corporal (L)":   isManual ? "" : fmt(data.bodyWaterPercentage),
      "Minerales Óseos (kg)":isManual ? "" : fmt(data.boneMass),
    }

    const ops: Promise<void>[] = [
      upsertRow(sheets, "Entrenamiento", metricsData, telefono),
    ]

    if (wantsNutrition) {
      const nutriData: Record<string, string> = {
        ...metricsData,
        "Plan Nutrición":        "Sí",
        "Agua (L)":              fmt(data.consumedWater),
        "Horas Sueño":           fmt(data.restHours),
        "Comidas/Día":           fmt(data.mealTimes),
        "Toma Medicamentos":     data.takesMedication === true ? "Sí" : data.takesMedication === false ? "No" : "",
        "Medicamentos":          fmt(data.medication),
        "Otro Medicamento":      fmt(data.otherMedication),
        "Toma Suplementos":      data.takesSupplements === true ? "Sí" : data.takesSupplements === false ? "No" : "",
        "Suplementos":           fmt(data.takesSumplements),
        "Otro Suplemento":       fmt(data.otherSuplement),
        "Alcohol":               tr(data.consumesAlcohol),
        "Tabaco":                tr(data.consumesTobacco),
        "Condiciones Médicas":   fmt(data.conditions),
        "Otras Condiciones":     fmt(data.otherConditions),
        "Síntomas":              fmt(data.symptoms),
        "Otros Síntomas":        fmt(data.otherSymptoms),
        "Frutas":                fmt(data.fruits),
        "Frecuencia Frutas":     tr(data.fruitsFrequency),
        "Verduras":              fmt(data.vegetables),
        "Frecuencia Verduras":   tr(data.vegetablesFrequency),
        "Condimentos":           fmt(trItems(data.condiments)),
        "Azúcares":              fmt(trItems(data.sugar)),
        "Grasas":                fmt(trItems(data.fat)),
        "Bebidas":               fmt(trItems(data.drinks)),
        "Alimentos Favoritos":   fmt(data.favoriteFoods),
        "Otros Favoritos":       fmt(data.otherFavoriteFoods),
        "Alimentos No Favoritos":fmt(data.noFavoriteFoods),
      }
      ops.push(upsertRow(sheets, "Nutriología", nutriData, telefono))
    }

    await Promise.all(ops)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en /api/sheets:", error)
    return NextResponse.json({ error: "No se pudo escribir en Google Sheets" }, { status: 500 })
  }
}
