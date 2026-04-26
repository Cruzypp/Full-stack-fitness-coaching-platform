import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "../../../../../../lib/supabase-admin"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { Document, Page, Text, View, StyleSheet, type DocumentProps } from "@react-pdf/renderer"

const SLOT_ORDER = ["desayuno", "comida", "cena", "snack", "colacion"]

const SLOT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  desayuno: { label: "Desayuno",  color: "#b45309", bg: "#fffbeb" },
  comida:   { label: "Comida",    color: "#047857", bg: "#f0fdf4" },
  cena:     { label: "Cena",      color: "#1d4ed8", bg: "#eff6ff" },
  snack:    { label: "Snack",     color: "#7c3aed", bg: "#f5f3ff" },
  colacion: { label: "Colación",  color: "#be185d", bg: "#fdf2f8" },
}

const ACCENT = "#16a34a"   // primary green

const s = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 32,
    paddingBottom: 52,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
  },

  // ── Header ─────────────────────────────────
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#111111",
  },
  gymName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4,
    color: "#111111",
  },
  planTitle: {
    fontSize: 9,
    letterSpacing: 3,
    color: "#888888",
    marginTop: 2,
    textTransform: "uppercase",
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  clientLabel: { fontSize: 7, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase" },
  clientValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111111", marginTop: 2 },

  // ── Day grid ───────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayCard: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  dayHeader: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dayNumber: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    letterSpacing: 1,
  },
  dayKcal: {
    fontSize: 8,
    color: "#6b7280",
    fontFamily: "Helvetica-Bold",
  },
  dayBody: { padding: 6 },

  // ── Slot ───────────────────────────────────
  slotBlock: { marginBottom: 5 },
  slotPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginBottom: 2,
  },
  slotLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  entryName: { fontSize: 8, color: "#1f2937", fontFamily: "Helvetica-Bold", marginBottom: 1 },
  macroRow: { flexDirection: "row", gap: 6, marginBottom: 1 },
  macroKcal:  { fontSize: 6, color: "#ca8a04", fontFamily: "Helvetica-Bold" },  // amarillo
  macroP:     { fontSize: 6, color: "#16a34a", fontFamily: "Helvetica-Bold" },  // verde
  macroC:     { fontSize: 6, color: "#7c3aed", fontFamily: "Helvetica-Bold" },  // púrpura
  macroG:     { fontSize: 6, color: "#0891b2", fontFamily: "Helvetica-Bold" },  // celeste
  ingredients: {
    fontSize: 6,
    color: "#9ca3af",
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  divider: { borderTopWidth: 1, borderTopColor: "#f3f4f6", marginVertical: 4 },

  // ── Footer ─────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 6, color: "#d1d5db", letterSpacing: 1 },
  pageNum:    { fontSize: 6, color: "#d1d5db" },
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

function dayTotal(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + (e.calories ?? 0), 0)
}

function MealPlanDocument({ clientName, yearMonth, entries }: {
  clientName: string; yearMonth: string; entries: Entry[]
}) {
  const [year, month] = yearMonth.split("-")
  const monthLabel = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString("es-MX", { month: "long", year: "numeric" })

  const byDay: Record<number, Entry[]> = {}
  for (const entry of entries) {
    if (!byDay[entry.day_of_month]) byDay[entry.day_of_month] = []
    byDay[entry.day_of_month].push(entry)
  }
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)
  const today = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })

  return React.createElement(
    Document,
    { title: `Plan Nutricional — ${clientName} — ${monthLabel}` },
    React.createElement(
      Page,
      { size: "LETTER", style: s.page },

      // ── Header ──────────────────────────────
      React.createElement(
        View, { style: s.header },
        React.createElement(Text, { style: s.gymName }, "THE ON3 P3RCENT"),
        React.createElement(Text, { style: s.planTitle }, "Plan Nutricional"),
        React.createElement(
          View, { style: s.clientRow },
          React.createElement(View, null,
            React.createElement(Text, { style: s.clientLabel }, "Atleta"),
            React.createElement(Text, { style: s.clientValue }, clientName)
          ),
          React.createElement(View, null,
            React.createElement(Text, { style: s.clientLabel }, "Mes"),
            React.createElement(Text, { style: s.clientValue }, monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1))
          ),
          React.createElement(View, null,
            React.createElement(Text, { style: s.clientLabel }, "Generado"),
            React.createElement(Text, { style: s.clientValue }, today)
          ),
        )
      ),

      // ── Day grid ────────────────────────────
      React.createElement(
        View, { style: s.grid },
        ...days.map((day) => {
          const dayEntries = byDay[day]
          const kcal = dayTotal(dayEntries)
          const slotsSorted = SLOT_ORDER.filter((sl) => dayEntries.some((e) => e.meal_slot === sl))

          return React.createElement(
            View, { key: `day-${day}`, style: s.dayCard, wrap: false },

            // Day header
            React.createElement(
              View, { style: s.dayHeader },
              React.createElement(Text, { style: s.dayNumber }, `DÍA ${day}`),
              kcal > 0
                ? React.createElement(Text, { style: s.dayKcal }, `${kcal.toLocaleString("es-MX")} kcal`)
                : null
            ),

            // Slots
            React.createElement(
              View, { style: s.dayBody },
              ...slotsSorted.map((slot, si) => {
                const cfg = SLOT_CONFIG[slot] ?? { label: slot, color: "#6b7280", bg: "#f9fafb" }
                const slotEntries = dayEntries.filter((e) => e.meal_slot === slot)
                return React.createElement(
                  View, { key: `slot-${slot}` },
                  si > 0 ? React.createElement(View, { style: s.divider }) : null,
                  React.createElement(
                    View, { style: s.slotBlock },
                    // Slot pill
                    React.createElement(
                      View, { style: { ...s.slotPill, backgroundColor: cfg.bg } },
                      React.createElement(Text, { style: { ...s.slotLabel, color: cfg.color } }, cfg.label)
                    ),
                    // Entries
                    ...slotEntries.map((entry) => {
                      const hasMacros = entry.calories || entry.protein_g || entry.carbs_g || entry.fats_g
                      const ingStr = entry.ingredients?.length
                        ? entry.ingredients.map((i) => `${i.name}${i.amount ? ` ${i.amount}${i.unit}` : ""}`).join(" · ")
                        : ""
                      return React.createElement(
                        View, { key: entry.id },
                        React.createElement(Text, { style: s.entryName }, entry.name),
                        hasMacros
                          ? React.createElement(
                              View, { style: s.macroRow },
                              entry.calories   ? React.createElement(Text, { style: s.macroKcal }, `${entry.calories} kcal`) : null,
                              entry.protein_g  ? React.createElement(Text, { style: s.macroP   }, `P ${entry.protein_g}g`) : null,
                              entry.carbs_g    ? React.createElement(Text, { style: s.macroC   }, `C ${entry.carbs_g}g`) : null,
                              entry.fats_g     ? React.createElement(Text, { style: s.macroG   }, `G ${entry.fats_g}g`) : null,
                            )
                          : null,
                        ingStr ? React.createElement(Text, { style: s.ingredients }, ingStr) : null
                      )
                    })
                  )
                )
              })
            )
          )
        })
      ),

      // ── Footer ──────────────────────────────
      React.createElement(
        View, { style: s.footer, fixed: true },
        React.createElement(Text, { style: s.footerText }, "THE ON3 P3RCENT — CONFIDENCIAL"),
        React.createElement(
          Text,
          { style: s.pageNum, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${pageNumber} / ${totalPages}` }
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

  if (planRes.error || !planRes.data)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })

  const plan = planRes.data
  const profileRes = await supabase
    .from("profiles").select("first_name, last_name").eq("id", plan.user_id).single()

  const clientName = profileRes.data
    ? `${profileRes.data.first_name} ${profileRes.data.last_name}`
    : "Cliente"

  const entries: Entry[] = Array.isArray(entriesRes.data) ? entriesRes.data : []

  const buffer = await renderToBuffer(
    React.createElement(MealPlanDocument, { clientName, yearMonth: plan.year_month, entries }) as React.ReactElement<DocumentProps>
  )

  const monthSlug = plan.year_month.replace("-", "_")
  const nameSlug  = clientName.replace(/\s+/g, "_").toLowerCase()

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="plan_${nameSlug}_${monthSlug}.pdf"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  })
}
