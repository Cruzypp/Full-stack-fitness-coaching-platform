import { NextRequest, NextResponse } from "next/server"

const INBODY_PARSER_URL = `${process.env.PYTHON_API_BASE_URL}/inbody_parser`

/** Maps the Python parser's snake_case output to our form field names */
function mapParserToForm(raw: Record<string, unknown>) {
  return {
    height: raw.altura_cm ?? null,
    weight: raw.peso_kg ?? null,
    imc: raw.imc ?? null,
    fatPercentage: raw.pgc ?? null,                    // % grasa corporal
    musclePercentage: raw.mme_kg ?? null,              // masa musculoesquelética (kg)
    viceralFatPercentage: raw.nivel_grasa_visceral ?? null, // nivel 1-20
    bodyWaterPercentage: raw.agua_corporal_total_L ?? null, // litros
    boneMass: raw.minerales_kg ?? null,                // minerales/masa ósea (kg)
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
    }

    const upstream = new FormData()
    upstream.append("file", file)

    const response = await fetch(INBODY_PARSER_URL, {
      method: "POST",
      body: upstream,
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("InBody parser error:", response.status, text)
      return NextResponse.json(
        { error: "El parser de InBody respondió con un error" },
        { status: response.status }
      )
    }

    const raw = await response.json()
    return NextResponse.json(mapParserToForm(raw))
  } catch (error) {
    console.error("Error en /api/inbody:", error)
    return NextResponse.json({ error: "Error interno al procesar el InBody" }, { status: 500 })
  }
}
