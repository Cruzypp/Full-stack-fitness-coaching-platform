import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "../../../../../../lib/supabase-admin"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { Document, Page, Text, View, StyleSheet, type DocumentProps } from "@react-pdf/renderer"

const SLOT_LABELS: Record<string, string> = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
  snack: "Snack",
  colacion: "Colación",
}

const SLOT_ORDER = ["desayuno", "comida", "cena", "snack", "colacion"]

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
    paddingBottom: 10,
    marginBottom: 18,
  },
  gymName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    color: "#111111",
  },
  planTitle: {
    fontSize: 12,
    color: "#555555",
    marginTop: 2,
    letterSpacing: 2,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  clientText: {
    fontSize: 9,
    color: "#333333",
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
  },
  daySection: {
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e5e5",
    paddingLeft: 8,
  },
  dayHeader: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 4,
  },
  slotRow: {
    marginBottom: 4,
  },
  slotLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  entryName: {
    fontSize: 9,
    color: "#222222",
    marginTop: 1,
  },
  entryMacros: {
    fontSize: 7,
    color: "#999999",
    marginTop: 1,
  },
  ingredients: {
    fontSize: 7,
    color: "#666666",
    marginTop: 1,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#aaaaaa",
    letterSpacing: 1,
  },
  pageNumber: {
    fontSize: 7,
    color: "#aaaaaa",
  },
})

type Entry = {
  id: string
  day_of_month: number
  meal_slot: string
  name: string
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fats_g?: number | null
  ingredients?: { name: string; amount: string; unit: string }[]
}

function buildMacroString(entry: Entry): string {
  const parts: string[] = []
  if (entry.calories) parts.push(`${entry.calories} kcal`)
  if (entry.protein_g) parts.push(`P: ${entry.protein_g}g`)
  if (entry.carbs_g) parts.push(`C: ${entry.carbs_g}g`)
  if (entry.fats_g) parts.push(`G: ${entry.fats_g}g`)
  return parts.join("  ·  ")
}

function buildIngredientsString(entry: Entry): string {
  if (!entry.ingredients?.length) return ""
  return entry.ingredients.map((i) => `${i.name}${i.amount ? ` ${i.amount}${i.unit ? i.unit : ""}` : ""}`).join(", ")
}

function MealPlanDocument({
  clientName,
  yearMonth,
  entries,
}: {
  clientName: string
  yearMonth: string
  entries: Entry[]
}) {
  const [year, month] = yearMonth.split("-")
  const monthLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  })

  const byDay: Record<number, Entry[]> = {}
  for (const entry of entries) {
    if (!byDay[entry.day_of_month]) byDay[entry.day_of_month] = []
    byDay[entry.day_of_month].push(entry)
  }
  const days = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b)

  const today = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })

  return React.createElement(
    Document,
    { title: `Plan Nutricional — ${clientName} — ${monthLabel}` },
    React.createElement(
      Page,
      { size: "LETTER", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.gymName }, "THE ON3 P3RCENT"),
        React.createElement(Text, { style: styles.planTitle }, "PLAN NUTRICIONAL"),
        React.createElement(
          View,
          { style: styles.clientRow },
          React.createElement(
            Text,
            { style: styles.clientText },
            React.createElement(Text, { style: styles.boldText }, "Cliente: "),
            clientName
          ),
          React.createElement(
            Text,
            { style: styles.clientText },
            React.createElement(Text, { style: styles.boldText }, "Mes: "),
            monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
          ),
          React.createElement(
            Text,
            { style: styles.clientText },
            React.createElement(Text, { style: styles.boldText }, "Generado: "),
            today
          )
        )
      ),
      // Days
      ...days.map((day) => {
        const dayEntries = byDay[day]
        const slotsSorted = SLOT_ORDER.filter((s) => dayEntries.some((e) => e.meal_slot === s))

        return React.createElement(
          View,
          { key: `day-${day}`, style: styles.daySection, wrap: false },
          React.createElement(Text, { style: styles.dayHeader }, `DÍA ${day}`),
          ...slotsSorted.map((slot) => {
            const slotEntries = dayEntries.filter((e) => e.meal_slot === slot)
            return React.createElement(
              View,
              { key: `slot-${slot}` },
              ...slotEntries.map((entry) => {
                const macros = buildMacroString(entry)
                const ingredients = buildIngredientsString(entry)
                return React.createElement(
                  View,
                  { key: entry.id, style: styles.slotRow },
                  React.createElement(Text, { style: styles.slotLabel }, SLOT_LABELS[slot] ?? slot),
                  React.createElement(Text, { style: styles.entryName }, entry.name),
                  macros ? React.createElement(Text, { style: styles.entryMacros }, macros) : null,
                  ingredients ? React.createElement(Text, { style: styles.ingredients }, ingredients) : null
                )
              })
            )
          })
        )
      }),
      // Footer
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, "THE ON3 P3RCENT — Plan Nutricional Confidencial"),
        React.createElement(
          Text,
          { style: styles.pageNumber, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}` }
        )
      )
    )
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getSupabaseAdmin()

  const [planRes, entriesRes] = await Promise.all([
    supabase.from("meal_plans").select("id, user_id, year_month").eq("id", id).single(),
    supabase.from("meal_plan_entries").select("*").eq("meal_plan_id", id).order("day_of_month"),
  ])

  if (planRes.error || !planRes.data) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const plan = planRes.data
  const profileRes = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", plan.user_id)
    .single()

  const clientName = profileRes.data
    ? `${profileRes.data.first_name} ${profileRes.data.last_name}`
    : "Cliente"

  const entries: Entry[] = Array.isArray(entriesRes.data) ? entriesRes.data : []

  const buffer = await renderToBuffer(
    React.createElement(MealPlanDocument, {
      clientName,
      yearMonth: plan.year_month,
      entries,
    }) as React.ReactElement<DocumentProps>
  )

  const monthSlug = plan.year_month.replace("-", "_")
  const nameSlug = clientName.replace(/\s+/g, "_").toLowerCase()

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="plan_${nameSlug}_${monthSlug}.pdf"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  })
}
