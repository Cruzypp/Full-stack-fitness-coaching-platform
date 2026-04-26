"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { supabase } from "../../../../../lib/connection"
import type { Recipe, MealPlan, MealPlanEntry, MealSlot, RecipeCategory, Ingredient } from "../../../../../types/nutrition"

const SLOTS: { value: MealSlot; label: string; text: string }[] = [
  { value: "desayuno", label: "Desayuno", text: "text-amber-700" },
  { value: "comida",   label: "Comida",   text: "text-emerald-700" },
  { value: "cena",     label: "Cena",     text: "text-blue-700" },
  { value: "snack",    label: "Snack",    text: "text-purple-700" },
  { value: "colacion", label: "Colación", text: "text-rose-700" },
]
const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  desayuno: "Desayuno", comida: "Comida", cena: "Cena", snack: "Snack", colacion: "Colación",
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function daysInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number)
  return new Date(y, m, 0).getDate()
}

/** Returns the days array for a given half (0=full, 1=Q1, 2=Q2) */
function getDaysForHalf(half: number, yearMonth: string): number[] {
  const dim = daysInMonth(yearMonth)
  if (half === 1) return Array.from({ length: 15 },       (_, i) => i + 1)
  if (half === 2) return Array.from({ length: dim - 15 }, (_, i) => i + 16)
  return Array.from({ length: dim }, (_, i) => i + 1)
}

/** Split a days array into chunks of 7 */
function getWeeks(days: number[]): number[][] {
  const weeks: number[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

function getPrevMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
function getNextMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/** Prev/next navigation href based on half */
function prevHref(userId: string, yearMonth: string, half: number): string {
  const base = `/nutricion/clientes/${userId}/plan`
  if (half === 0) return `${base}/${getPrevMonth(yearMonth)}`
  if (half === 1) return `${base}/${getPrevMonth(yearMonth)}?half=2`
  return `${base}/${yearMonth}?half=1`
}
function nextHref(userId: string, yearMonth: string, half: number): string {
  const base = `/nutricion/clientes/${userId}/plan`
  if (half === 0) return `${base}/${getNextMonth(yearMonth)}`
  if (half === 1) return `${base}/${yearMonth}?half=2`
  return `${base}/${getNextMonth(yearMonth)}?half=1`
}

function halfLabel(half: number): string {
  if (half === 1) return "Primera quincena"
  if (half === 2) return "Segunda quincena"
  return ""
}

// ── Draggable recipe ──────────────────────────────────────────────────────────
function DraggableRecipe({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `recipe::${recipe.id}` })
  const slot = SLOTS.find((s) => s.value === recipe.category)
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      className={`bg-white rounded-xl border border-slate-200 p-3 cursor-grab active:cursor-grabbing select-none transition-all ${isDragging ? "opacity-30" : "hover:border-slate-300 hover:shadow-sm"}`}>
      <span className={`font-label text-[8px] uppercase tracking-[0.15em] ${slot?.text ?? "text-slate-500"}`}>
        {CATEGORY_LABELS[recipe.category]}
      </span>
      <p className="font-body text-xs text-slate-800 mt-0.5 font-medium line-clamp-1">{recipe.name}</p>
      {recipe.calories && <p className="font-label text-[8px] text-slate-400 mt-1">{recipe.calories} kcal</p>}
    </div>
  )
}

// ── Meal slot cell ────────────────────────────────────────────────────────────
function MealSlotCell({ day, slot, entries, onDoubleClickEntry, onDeleteEntry }: {
  day: number; slot: MealSlot; entries: MealPlanEntry[]
  onDoubleClickEntry: (e: MealPlanEntry) => void
  onDeleteEntry: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot::${day}::${slot}` })
  return (
    <div ref={setNodeRef}
      className={`min-h-[52px] rounded-lg border transition-all p-1 ${
        isOver ? "border-primary bg-primary/5 shadow-sm"
        : entries.length > 0 ? "border-slate-200 bg-white"
        : "border-dashed border-slate-200 bg-transparent"
      }`}>
      {entries.map((entry) => (
        <div key={entry.id} onDoubleClick={() => onDoubleClickEntry(entry)}
          className="group relative rounded-md bg-slate-50 border border-slate-200 px-2 py-1 mb-1 cursor-pointer hover:border-primary/40 hover:bg-blue-50 transition-colors select-none"
          title="Doble clic para editar">
          <p className="font-body text-[10px] text-slate-700 line-clamp-1 pr-5">{entry.name}</p>
          {entry.calories && <p className="font-label text-[8px] text-slate-400">{entry.calories} kcal</p>}
          <button onClick={(e) => { e.stopPropagation(); onDeleteEntry(entry.id) }}
            className="absolute inset-y-0 right-1.5 my-auto h-fit text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity leading-none">✕</button>
        </div>
      ))}
    </div>
  )
}

// ── Entry edit modal ──────────────────────────────────────────────────────────
function EntryModal({ entry, onClose, onSave }: {
  entry: MealPlanEntry; onClose: () => void
  onSave: (u: Partial<MealPlanEntry>) => Promise<void>
}) {
  const [form, setForm] = useState({
    name: entry.name,
    calories: entry.calories?.toString() ?? "",
    protein_g: entry.protein_g?.toString() ?? "",
    carbs_g: entry.carbs_g?.toString() ?? "",
    fats_g: entry.fats_g?.toString() ?? "",
    instructions: entry.instructions ?? "",
    notes: entry.notes ?? "",
    ingredients: entry.ingredients ?? [],
  })
  const [ing, setIng] = useState({ name: "", amount: "", unit: "" })
  const [saving, setSaving] = useState(false)
  const slot = SLOTS.find((s) => s.value === entry.meal_slot)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bebas text-2xl tracking-wide text-slate-900">EDITAR ENTRADA</h2>
            <p className="font-label text-[9px] uppercase tracking-[0.1em] text-slate-400 mt-0.5">
              Día {entry.day_of_month} · <span className={slot?.text}>{slot?.label}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">Nombre</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:border-primary/60 transition-colors" />
          </div>
          {[{ key: "calories", label: "Kcal" }, { key: "protein_g", label: "Proteína (g)" }, { key: "carbs_g", label: "Carbs (g)" }, { key: "fats_g", label: "Grasas (g)" }].map(({ key, label }) => (
            <div key={key}>
              <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">{label}</label>
              <input type="number" value={(form as Record<string, unknown>)[key] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:border-primary/60 transition-colors" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">Ingredientes</label>
            <div className="flex gap-2 mb-2">
              <input value={ing.name} onChange={(e) => setIng((i) => ({ ...i, name: e.target.value }))} placeholder="Ingrediente" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-body focus:outline-none focus:border-primary/60" />
              <input value={ing.amount} onChange={(e) => setIng((i) => ({ ...i, amount: e.target.value }))} placeholder="Cant." className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-body focus:outline-none focus:border-primary/60" />
              <input value={ing.unit} onChange={(e) => setIng((i) => ({ ...i, unit: e.target.value }))} placeholder="Unidad" className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-body focus:outline-none focus:border-primary/60" />
              <button type="button" onClick={() => { if (!ing.name.trim()) return; setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ...ing }] })); setIng({ name: "", amount: "", unit: "" }) }}
                className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-label text-xs hover:bg-primary/20 transition-colors">+</button>
            </div>
            {form.ingredients.length > 0 && (
              <ul className="space-y-1 bg-slate-50 rounded-xl p-3">
                {form.ingredients.map((x: Ingredient, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-body text-slate-600">
                    <span className="flex-1">{x.name} — {x.amount} {x.unit}</span>
                    <button onClick={() => setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_: Ingredient, i: number) => i !== idx) }))} className="text-red-400 hover:text-red-600 text-[10px]">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">Preparación</label>
            <textarea value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:border-primary/60 transition-colors resize-none" />
          </div>
          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-body focus:outline-none focus:border-primary/60 transition-colors resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 font-label text-xs uppercase tracking-[0.15em] text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
          <button disabled={saving} onClick={async () => { setSaving(true); await onSave({ name: form.name, calories: form.calories ? Number(form.calories) : undefined, protein_g: form.protein_g ? Number(form.protein_g) : undefined, carbs_g: form.carbs_g ? Number(form.carbs_g) : undefined, fats_g: form.fats_g ? Number(form.fats_g) : undefined, instructions: form.instructions || undefined, notes: form.notes || undefined, ingredients: form.ingredients }); setSaving(false) }}
            className="px-4 py-2 rounded-xl bg-primary text-white font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Macro gauge ──────────────────────────────────────────────────────────────
function MacroGauge({
  label, avg, goal, unit, color, trackColor, bg, borderColor,
  onSaveGoal,
}: {
  label: string; avg: number; goal: number | null; unit: string
  color: string; trackColor: string; bg: string; borderColor: string
  onSaveGoal: (v: number | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(goal != null ? goal.toString() : "")

  const r = 44, cx = 60, cy = 60
  const total = Math.PI * r           // semicircle path length ≈ 138
  const pct   = goal && goal > 0 ? avg / goal : 0
  const over  = pct > 1
  const filled = Math.min(pct, 1) * total
  const pctLabel = goal && goal > 0 ? `${Math.round(pct * 100)}%` : "—"

  const commit = () => {
    const v = draft.trim() === "" ? null : Number(draft)
    onSaveGoal(isNaN(v as number) ? null : v)
    setEditing(false)
  }

  return (
    <div className={`rounded-2xl border ${borderColor} ${bg} p-4 flex flex-col items-center gap-1`}>
      <span className="font-label text-[9px] uppercase tracking-[0.15em]" style={{ color }}>{label}</span>

      {/* Speedometer SVG */}
      <svg viewBox="0 0 120 68" className="w-36 -mb-1">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={trackColor} strokeWidth="10" strokeLinecap="round"
        />
        {/* Progress */}
        {filled > 0 && (
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={over ? "#ef4444" : color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${total}`}
          />
        )}
        {/* % label */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="15" fontWeight="bold" fill={over ? "#ef4444" : "#111827"}>
          {pctLabel}
        </text>
        {/* avg label */}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="7.5" fill="#9ca3af">
          {avg > 0 ? `${avg.toLocaleString("es-MX")} ${unit}/día` : "sin datos"}
        </text>
      </svg>

      {/* Goal editor */}
      {editing ? (
        <div className="flex items-center gap-1 mt-1">
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit() }}
            placeholder="meta"
            className="w-24 text-center text-xs border border-slate-300 rounded-lg px-2 py-0.5 focus:outline-none focus:border-primary/60"
          />
          <span className="font-label text-[8px] text-slate-400">{unit}/día</span>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(goal != null ? goal.toString() : ""); setEditing(true) }}
          className="font-label text-[8px] text-slate-400 hover:text-primary transition-colors underline underline-offset-2 mt-1"
        >
          {goal != null && goal > 0 ? `Meta: ${goal.toLocaleString("es-MX")} ${unit}/día` : "Establecer meta"}
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PlanPage() {
  const { userId, yearMonth } = useParams<{ userId: string; yearMonth: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  // half: 0 = mes completo, 1 = primera quincena, 2 = segunda quincena
  const half = Number(searchParams.get("half") ?? "0") as 0 | 1 | 2

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [plan, setPlan] = useState<MealPlan | null>(null)
  const [entries, setEntries] = useState<MealPlanEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [recipeFilter, setRecipeFilter] = useState<RecipeCategory | "todas">("todas")
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [editingEntry, setEditingEntry] = useState<MealPlanEntry | null>(null)
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientPlanType, setClientPlanType] = useState<"30d" | "15d">("30d")

  // Week view
  const [currentWeekIdx, setCurrentWeekIdx] = useState(0)
  const [viewMode, setViewMode] = useState<"table" | "list">("table")

  // New plan modal
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [creatingPlan, setCreatingPlan] = useState(false)
  const [selectedHalf, setSelectedHalf] = useState<0 | 1 | 2>(half)

  // Macro goals
  const [goalCalories, setGoalCalories] = useState<number | null>(null)
  const [goalProtein,  setGoalProtein]  = useState<number | null>(null)
  const [goalCarbs,    setGoalCarbs]    = useState<number | null>(null)
  const [goalFats,     setGoalFats]     = useState<number | null>(null)

  // Copy state
  const [copySourceDay, setCopySourceDay] = useState<number | null>(null)
  const [copySourceWeekIdx, setCopySourceWeekIdx] = useState<number | null>(null)
  const [copying, setCopying] = useState(false)

  // Computed days & weeks
  const planDays = useMemo(() => getDaysForHalf(half, yearMonth), [half, yearMonth])
  const weeks = useMemo(() => getWeeks(planDays), [planDays])
  const currentWeekDays = weeks[currentWeekIdx] ?? []

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    setCurrentWeekIdx(0)
    setCopySourceDay(null)
    setCopySourceWeekIdx(null)
  }, [half, yearMonth])

  useEffect(() => {
    const load = async () => {
      const [recipesRes, profileRes, planRes] = await Promise.all([
        fetch("/api/nutrition/recipes").then((r) => r.json()),
        supabase.from("profiles").select("first_name, last_name, phone, nutrition_plan_type").eq("id", userId).single(),
        fetch(`/api/nutrition/meal-plans?userId=${userId}&yearMonth=${yearMonth}&half=${half}`).then((r) => r.json()),
      ])

      setRecipes(recipesRes)
      if (profileRes.data) {
        setClientName(`${profileRes.data.first_name} ${profileRes.data.last_name}`)
        setClientPhone(profileRes.data.phone ?? "")
        setClientPlanType(profileRes.data.nutrition_plan_type ?? "30d")
      }

      if (Array.isArray(planRes) && planRes.length > 0) {
        const p = planRes[0]
        setPlan(p)
        setGoalCalories(p.goal_calories ?? null)
        setGoalProtein(p.goal_protein_g ?? null)
        setGoalCarbs(p.goal_carbs_g ?? null)
        setGoalFats(p.goal_fats_g ?? null)
        const entriesData = await fetch(`/api/nutrition/meal-plans/${p.id}/entries`).then((r) => r.json())
        setEntries(Array.isArray(entriesData) ? entriesData : [])
      } else {
        // For half=1 or half=2: auto-create without asking (half is already determined by URL)
        // For half=0: ask duration preference
        if (half !== 0) {
          await createPlanDirectly(half)
        } else {
          setSelectedHalf(0)
          setShowNewPlanModal(true)
        }
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, yearMonth, half])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setCopySourceDay(null); setCopySourceWeekIdx(null) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const createPlanDirectly = async (h: 0 | 1 | 2) => {
    const dim = daysInMonth(yearMonth)
    const dur = h === 0 ? dim : h === 1 ? 15 : dim - 15
    const created = await fetch("/api/nutrition/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, year_month: yearMonth, half: h, duration: dur }),
    }).then((r) => r.json())
    setPlan(created)
  }

  const createPlan = async () => {
    setCreatingPlan(true)
    await createPlanDirectly(selectedHalf)
    setShowNewPlanModal(false)
    setCreatingPlan(false)
    // If user selected Q1 or Q2, navigate to that URL
    if (selectedHalf !== 0) {
      router.push(`/nutricion/clientes/${userId}/plan/${yearMonth}?half=${selectedHalf}`)
    }
  }

  const saveGoal = async (field: string, value: number | null) => {
    if (!plan) return
    await fetch(`/api/nutrition/meal-plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string
    if (id.startsWith("recipe::")) setActiveRecipe(recipes.find((r) => r.id === id.replace("recipe::", "")) ?? null)
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveRecipe(null)
    const { active, over } = event
    if (!over || !plan) return
    const activeId = active.id as string
    const overId = over.id as string
    if (!activeId.startsWith("recipe::") || !overId.startsWith("slot::")) return
    const recipeId = activeId.replace("recipe::", "")
    const [, dayStr, slot] = overId.split("::")
    const recipe = recipes.find((r) => r.id === recipeId)
    if (!recipe) return
    const res = await fetch(`/api/nutrition/meal-plans/${plan.id}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe_id: recipe.id, day_of_month: Number(dayStr), meal_slot: slot as MealSlot, name: recipe.name, calories: recipe.calories ?? null, protein_g: recipe.protein_g ?? null, carbs_g: recipe.carbs_g ?? null, fats_g: recipe.fats_g ?? null, ingredients: recipe.ingredients ?? [], instructions: recipe.instructions ?? null }),
    })
    if (res.ok) { const entry = await res.json(); setEntries((prev) => [...prev, entry]) }
  }, [plan, recipes])

  const handleDeleteEntry = async (entryId: string) => {
    if (!plan) return
    await fetch(`/api/nutrition/meal-plans/${plan.id}/entries/${entryId}`, { method: "DELETE" })
    setEntries((prev) => prev.filter((e) => e.id !== entryId))
  }

  const handleSaveEntry = async (updated: Partial<MealPlanEntry>) => {
    if (!editingEntry || !plan) return
    const res = await fetch(`/api/nutrition/meal-plans/${plan.id}/entries/${editingEntry.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated),
    })
    if (res.ok) { const saved = await res.json(); setEntries((prev) => prev.map((e) => e.id === saved.id ? saved : e)) }
    setEditingEntry(null)
  }

  // ── Copy day ────────────────────────────────────────────────────────────────
  const handleCopyDay = async (targetDay: number) => {
    if (copySourceDay === null || copySourceDay === targetDay || !plan) return
    const sourceEntries = entries.filter((e) => e.day_of_month === copySourceDay)
    if (!sourceEntries.length) { setCopySourceDay(null); return }
    setCopying(true)
    const newEntries: MealPlanEntry[] = []
    for (const entry of sourceEntries) {
      const res = await fetch(`/api/nutrition/meal-plans/${plan.id}/entries`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: entry.recipe_id ?? null, day_of_month: targetDay, meal_slot: entry.meal_slot, name: entry.name, calories: entry.calories ?? null, protein_g: entry.protein_g ?? null, carbs_g: entry.carbs_g ?? null, fats_g: entry.fats_g ?? null, ingredients: entry.ingredients ?? [], instructions: entry.instructions ?? null }),
      })
      if (res.ok) newEntries.push(await res.json())
    }
    setEntries((prev) => [...prev, ...newEntries])
    setCopying(false); setCopySourceDay(null)
  }

  // ── Copy week ───────────────────────────────────────────────────────────────
  const handleCopyWeek = async (targetWeekIdx: number) => {
    if (copySourceWeekIdx === null || copySourceWeekIdx === targetWeekIdx || !plan) return
    const sourceDays = weeks[copySourceWeekIdx] ?? []
    const targetDays = weeks[targetWeekIdx] ?? []
    const sourceEntries = entries.filter((e) => sourceDays.includes(e.day_of_month))
    if (!sourceEntries.length) { setCopySourceWeekIdx(null); return }
    setCopying(true)
    const newEntries: MealPlanEntry[] = []
    for (const entry of sourceEntries) {
      const offset = sourceDays.indexOf(entry.day_of_month)
      const targetDay = targetDays[offset]
      if (targetDay === undefined) continue
      const res = await fetch(`/api/nutrition/meal-plans/${plan.id}/entries`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_id: entry.recipe_id ?? null, day_of_month: targetDay, meal_slot: entry.meal_slot, name: entry.name, calories: entry.calories ?? null, protein_g: entry.protein_g ?? null, carbs_g: entry.carbs_g ?? null, fats_g: entry.fats_g ?? null, ingredients: entry.ingredients ?? [], instructions: entry.instructions ?? null }),
      })
      if (res.ok) newEntries.push(await res.json())
    }
    setEntries((prev) => [...prev, ...newEntries])
    setCopying(false); setCopySourceWeekIdx(null)
  }

  const getEntriesForSlot = (day: number, slot: MealSlot) => entries.filter((e) => e.day_of_month === day && e.meal_slot === slot)
  const filteredRecipes = recipeFilter === "todas" ? recipes : recipes.filter((r) => r.category === recipeFilter)
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login") }

  const handleSendPlan = () => {
    if (!plan) return
    const [y, m] = yearMonth.split("-")
    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" })
    window.open(`/api/nutrition/meal-plans/${plan.id}/pdf`, "_blank")
    if (clientPhone) {
      const digits = clientPhone.replace(/\D/g, "")
      const wa = digits.length === 10 ? `52${digits}` : digits
      const msg = encodeURIComponent(`Hola ${clientName.split(" ")[0]}! Aqui te comparto tu plan nutricional de ${halfLabel(half) || label}. Cualquier duda estoy aqui para ayudarte.`)
      setTimeout(() => window.open(`https://wa.me/${wa}?text=${msg}`, "_blank"), 300)
    }
  }

  const macros = useMemo(() => {
    const daySet = new Set(planDays)
    const relevant = entries.filter((e) => daySet.has(e.day_of_month))
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 }
    const days = new Set<number>()
    for (const e of relevant) {
      totals.calories += e.calories ?? 0
      totals.protein += e.protein_g ?? 0
      totals.carbs += e.carbs_g ?? 0
      totals.fats += e.fats_g ?? 0
      days.add(e.day_of_month)
    }
    const d = days.size || 1
    return {
      calories: Math.round(totals.calories), protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10, fats: Math.round(totals.fats * 10) / 10,
      avgCalories: Math.round(totals.calories / d), avgProtein: Math.round((totals.protein / d) * 10) / 10,
      avgCarbs: Math.round((totals.carbs / d) * 10) / 10, avgFats: Math.round((totals.fats / d) * 10) / 10,
      daysWithData: days.size,
    }
  }, [entries, planDays])

  const [year, month] = yearMonth.split("-")
  const monthLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" })
  const copyModeActive = copySourceDay !== null || copySourceWeekIdx !== null

  // Prev/next labels
  const prevLabel = half === 2 ? "← 1ª quincena" : "← Anterior"
  const nextLabel = half === 1 ? "2ª quincena →" : "Siguiente →"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col min-h-screen bg-slate-50">

        <nav className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <Link href="/nutricion" className="font-bebas text-xl tracking-wide text-slate-900 hover:text-primary transition-colors">NUTRICIÓN</Link>
            <span className="text-slate-300">|</span>
            <Link href="/nutricion" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">Clientes</Link>
            <Link href="/nutricion/recetas" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">Recetas</Link>
          </div>
          <button onClick={handleLogout} className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors">Cerrar Sesión</button>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-4 border-b border-slate-100">
              <h2 className="font-bebas text-lg tracking-wide text-slate-900">RECETAS</h2>
              <p className="font-label text-[8px] uppercase tracking-[0.1em] text-slate-400 mt-0.5">Arrastra al plan</p>
            </div>
            <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1">
              {[{ value: "todas", label: "Todas" }, ...SLOTS.map((s) => ({ value: s.value, label: s.label }))].map((c) => (
                <button key={c.value} onClick={() => setRecipeFilter(c.value as RecipeCategory | "todas")}
                  className={`px-2 py-0.5 rounded-full font-label text-[8px] uppercase tracking-[0.1em] border transition-colors ${recipeFilter === c.value ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredRecipes.map((r) => <DraggableRecipe key={r.id} recipe={r} />)}
              {!filteredRecipes.length && <p className="text-center text-slate-400 font-body text-xs py-8">Sin recetas.</p>}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 overflow-auto p-6">
            {/* Header */}
            <header className="mb-4 flex items-start justify-between gap-4">
              <div>
                <Link href={`/nutricion/clientes/${userId}`} className="font-label text-[9px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors mb-1 flex items-center gap-1">
                  ← {clientName}
                </Link>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-bebas text-3xl md:text-4xl tracking-tight text-slate-900 capitalize">
                    Plan <span className="text-primary">{monthLabel}</span>
                  </h1>
                  {half !== 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full font-label text-[8px] uppercase tracking-[0.1em] ${half === 1 ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                      {halfLabel(half)} · días {planDays[0]}–{planDays[planDays.length - 1]}
                    </span>
                  )}
                </div>

                {/* Controls row */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="font-label text-[9px] uppercase tracking-[0.1em] text-slate-400">Doble clic para editar</span>

                  {/* View mode */}
                  <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                    {[
                      { mode: "table" as const, icon: <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
                      { mode: "list" as const,  icon: <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
                    ].map(({ mode, icon }) => (
                      <button key={mode} onClick={() => setViewMode(mode)}
                        className={`px-2.5 py-1 transition-colors ${viewMode === mode ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nav buttons */}
              <div className="flex gap-2 items-center shrink-0">
                <Link href={prevHref(userId, yearMonth, half)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-label text-[9px] uppercase tracking-[0.1em] text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
                  {prevLabel}
                </Link>
                <Link href={nextHref(userId, yearMonth, half)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-label text-[9px] uppercase tracking-[0.1em] text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
                  {nextLabel}
                </Link>
                <button onClick={handleSendPlan}
                  className="px-4 py-1.5 rounded-xl bg-primary text-white font-label text-[9px] uppercase tracking-[0.1em] hover:bg-primary/90 transition-colors shadow-sm">
                  Enviar plan
                </button>
              </div>
            </header>

            {/* Macro gauges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <MacroGauge
                label="Calorías" avg={macros.avgCalories} goal={goalCalories} unit="kcal"
                color="#d97706" trackColor="#fef3c7" bg="bg-amber-50" borderColor="border-amber-200"
                onSaveGoal={(v) => { setGoalCalories(v); saveGoal("goal_calories", v) }}
              />
              <MacroGauge
                label="Proteína" avg={macros.avgProtein} goal={goalProtein} unit="g"
                color="#2563eb" trackColor="#dbeafe" bg="bg-blue-50" borderColor="border-blue-200"
                onSaveGoal={(v) => { setGoalProtein(v); saveGoal("goal_protein_g", v) }}
              />
              <MacroGauge
                label="Carbohidratos" avg={macros.avgCarbs} goal={goalCarbs} unit="g"
                color="#d97706" trackColor="#ffedd5" bg="bg-orange-50" borderColor="border-orange-200"
                onSaveGoal={(v) => { setGoalCarbs(v); saveGoal("goal_carbs_g", v) }}
              />
              <MacroGauge
                label="Grasas" avg={macros.avgFats} goal={goalFats} unit="g"
                color="#be185d" trackColor="#fce7f3" bg="bg-rose-50" borderColor="border-rose-200"
                onSaveGoal={(v) => { setGoalFats(v); saveGoal("goal_fats_g", v) }}
              />
            </div>

            {plan && (
              <>
                {/* Week tabs */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {weeks.map((weekDays, idx) => {
                    const isSource = copySourceWeekIdx === idx
                    const isTarget = copySourceWeekIdx !== null && copySourceWeekIdx !== idx
                    return (
                      <button key={idx}
                        onClick={() => copySourceWeekIdx !== null && copySourceWeekIdx !== idx ? handleCopyWeek(idx) : setCurrentWeekIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl font-label text-[9px] uppercase tracking-[0.1em] border transition-all ${
                          isSource ? "bg-amber-400 text-white border-amber-400 shadow-sm"
                          : isTarget ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-copy"
                          : currentWeekIdx === idx ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                        }`}>
                        Sem {idx + 1}
                        <span className="ml-1 opacity-60">({weekDays[0]}–{weekDays[weekDays.length - 1]})</span>
                      </button>
                    )
                  })}
                  {copySourceWeekIdx === null && (
                    <button onClick={() => { setCopySourceDay(null); setCopySourceWeekIdx(currentWeekIdx) }}
                      className="ml-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-label text-[9px] uppercase tracking-[0.1em] text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copiar semana
                    </button>
                  )}
                </div>

                {/* Copy banner */}
                {copyModeActive && (
                  <div className={`mb-3 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 ${copying ? "bg-slate-100" : "bg-amber-50 border border-amber-200"}`}>
                    {copying
                      ? <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" /><span className="font-body text-xs text-slate-500">Copiando...</span></div>
                      : copySourceDay !== null
                        ? <span className="font-body text-xs text-amber-800">📋 Día <strong>{copySourceDay}</strong> seleccionado · Clic en el número de cualquier día para pegar</span>
                        : <span className="font-body text-xs text-amber-800">📋 Semana <strong>{(copySourceWeekIdx ?? 0) + 1}</strong> seleccionada · Clic en otra semana para pegar</span>
                    }
                    {!copying && <button onClick={() => { setCopySourceDay(null); setCopySourceWeekIdx(null) }} className="font-label text-[9px] uppercase tracking-[0.1em] text-amber-600 hover:text-amber-800 shrink-0">Cancelar · ESC</button>}
                  </div>
                )}

                {/* ── Table view ── */}
                {viewMode === "table" && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                      <thead>
                        <tr>
                          <th className="w-16 py-2 text-left font-label text-[9px] uppercase tracking-[0.15em] text-slate-400 pr-2">Día</th>
                          {SLOTS.map((s) => <th key={s.value} className={`w-[18%] py-2 px-2 font-label text-[9px] uppercase tracking-[0.15em] ${s.text} text-left`}>{s.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {currentWeekDays.map((day) => (
                          <tr key={day} className="border-t border-slate-100">
                            <td className="py-1 pr-2 align-top pt-2">
                              <div className="flex items-center gap-1">
                                {copySourceDay !== null && copySourceDay !== day
                                  ? <button onClick={() => handleCopyDay(day)} title={`Pegar en día ${day}`}
                                      className="font-bebas text-xl text-amber-500 hover:text-amber-700 transition-colors cursor-copy w-7 text-left">{day}</button>
                                  : <span className={`font-bebas text-xl w-7 ${copySourceDay === day ? "text-amber-500" : "text-slate-300"}`}>{day}</span>
                                }
                                {copySourceDay === null && copySourceWeekIdx === null && (
                                  <button onClick={() => { setCopySourceWeekIdx(null); setCopySourceDay(day) }} title={`Copiar día ${day}`}
                                    className="text-slate-300 hover:text-primary transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                  </button>
                                )}
                              </div>
                            </td>
                            {SLOTS.map((s) => (
                              <td key={s.value} className="py-1 px-1 align-top">
                                <MealSlotCell day={day} slot={s.value} entries={getEntriesForSlot(day, s.value)} onDoubleClickEntry={setEditingEntry} onDeleteEntry={handleDeleteEntry} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ── List view — all days, single table ── */}
                {viewMode === "list" && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ minWidth: 750 }}>
                      <thead>
                        <tr>
                          <th className="w-14 py-2 text-left font-label text-[9px] uppercase tracking-[0.15em] text-slate-400 pr-2">Día</th>
                          {SLOTS.map((s) => <th key={s.value} className={`w-[18%] py-2 px-2 font-label text-[9px] uppercase tracking-[0.15em] ${s.text} text-left`}>{s.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {planDays.map((day) => {
                          return (
                            <tr key={day} className="border-t border-slate-100">
                              <td className="py-1 pr-2 align-top pt-2">
                                <div className="flex items-center gap-1">
                                  {copySourceDay !== null && copySourceDay !== day
                                    ? <button onClick={() => handleCopyDay(day)} title={`Pegar en día ${day}`}
                                        className="font-bebas text-xl text-amber-500 hover:text-amber-700 transition-colors cursor-copy w-7 text-left">{day}</button>
                                    : <span className={`font-bebas text-xl w-7 ${copySourceDay === day ? "text-amber-500" : "text-slate-300"}`}>{day}</span>
                                  }
                                  {copySourceDay === null && copySourceWeekIdx === null && (
                                    <button onClick={() => { setCopySourceWeekIdx(null); setCopySourceDay(day) }} title={`Copiar día ${day}`}
                                      className="text-slate-300 hover:text-primary transition-colors">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    </button>
                                  )}
                                </div>
                              </td>
                              {SLOTS.map((s) => (
                                <td key={s.value} className="py-1 px-1 align-top">
                                  <MealSlotCell day={day} slot={s.value} entries={getEntriesForSlot(day, s.value)} onDoubleClickEntry={setEditingEntry} onDeleteEntry={handleDeleteEntry} />
                                </td>
                              ))}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {!plan && !showNewPlanModal && (
              <div className="flex items-center justify-center py-20 text-slate-400 font-body text-sm">Sin plan para este período.</div>
            )}
          </main>
        </div>

        <footer className="border-t border-slate-200 py-4 text-center bg-white">
          <span className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400">© 2026 ON3 P3RCENT · NUTRICIÓN</span>
        </footer>
      </div>

      <DragOverlay>
        {activeRecipe && (
          <div className="bg-white rounded-xl border border-primary shadow-lg shadow-primary/20 p-3 w-52 opacity-95">
            <span className="font-label text-[8px] uppercase tracking-[0.15em] text-primary">{CATEGORY_LABELS[activeRecipe.category]}</span>
            <p className="font-body text-xs text-slate-800 mt-0.5 font-medium">{activeRecipe.name}</p>
            {activeRecipe.calories && <p className="font-label text-[8px] text-slate-400 mt-1">{activeRecipe.calories} kcal</p>}
          </div>
        )}
      </DragOverlay>

      {editingEntry && <EntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} onSave={handleSaveEntry} />}

      {/* New plan modal — only for half=0 (full month) */}
      {showNewPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-bebas text-2xl tracking-wide text-slate-900">NUEVO PLAN</h2>
              <p className="font-body text-sm text-slate-500 mt-1 capitalize">{monthLabel} · {clientName}</p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-3">Tipo de plan</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { val: 0 as const, label: "Mes completo", sub: `${daysInMonth(yearMonth)} días` },
                  { val: 1 as const, label: "1ª quincena",  sub: "Días 1–15" },
                  { val: 2 as const, label: "2ª quincena",  sub: `Días 16–${daysInMonth(yearMonth)}` },
                ] as const).map(({ val, label, sub }) => (
                  <button key={val} onClick={() => setSelectedHalf(val)}
                    className={`py-3 rounded-xl border-2 flex flex-col items-center gap-0.5 transition-all ${selectedHalf === val ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"}`}>
                    <span className={`font-label text-[9px] uppercase tracking-[0.1em] ${selectedHalf === val ? "text-primary" : "text-slate-600"}`}>{label}</span>
                    <span className="font-label text-[8px] text-slate-400">{sub}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={createPlan} disabled={creatingPlan}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
              {creatingPlan ? "Creando..." : "Crear plan"}
            </button>
          </div>
        </div>
      )}
    </DndContext>
  )
}
