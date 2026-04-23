"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { supabase } from "../../../../../lib/connection"
import type { Recipe, MealPlan, MealPlanEntry, MealSlot, RecipeCategory, Ingredient } from "../../../../../types/nutrition"

const SLOTS: { value: MealSlot; label: string; bg: string; text: string }[] = [
  { value: "desayuno", label: "Desayuno", bg: "bg-amber-50", text: "text-amber-700" },
  { value: "comida", label: "Comida", bg: "bg-emerald-50", text: "text-emerald-700" },
  { value: "cena", label: "Cena", bg: "bg-blue-50", text: "text-blue-700" },
  { value: "snack", label: "Snack", bg: "bg-purple-50", text: "text-purple-700" },
  { value: "colacion", label: "Colación", bg: "bg-rose-50", text: "text-rose-700" },
]

const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  desayuno: "Desayuno", comida: "Comida", cena: "Cena", snack: "Snack", colacion: "Colación",
}

function getDaysInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number)
  return new Date(y, m, 0).getDate()
}

function getPrevMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function getNextMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-").map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

// --- Draggable recipe card ---
function DraggableRecipe({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `recipe::${recipe.id}` })
  const slot = SLOTS.find((s) => s.value === recipe.category)
  return (
    <div
      ref={setNodeRef} {...listeners} {...attributes}
      className={`bg-white rounded-xl border border-slate-200 p-3 cursor-grab active:cursor-grabbing select-none transition-all ${isDragging ? "opacity-30" : "hover:border-slate-300 hover:shadow-sm"}`}
    >
      <span className={`font-label text-[8px] uppercase tracking-[0.15em] ${slot?.text ?? "text-slate-500"}`}>
        {CATEGORY_LABELS[recipe.category]}
      </span>
      <p className="font-body text-xs text-slate-800 mt-0.5 font-medium line-clamp-1">{recipe.name}</p>
      {recipe.calories && <p className="font-label text-[8px] text-slate-400 mt-1">{recipe.calories} kcal</p>}
    </div>
  )
}

// --- Droppable meal slot cell ---
function MealSlotCell({ day, slot, entries, onDoubleClickEntry, onDeleteEntry }: {
  day: number; slot: MealSlot
  entries: MealPlanEntry[]
  onDoubleClickEntry: (entry: MealPlanEntry) => void
  onDeleteEntry: (entryId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot::${day}::${slot}` })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[52px] rounded-lg border transition-all p-1 ${
        isOver
          ? "border-primary bg-primary/5 shadow-sm"
          : entries.length > 0
          ? "border-slate-200 bg-white"
          : "border-dashed border-slate-200 bg-transparent"
      }`}
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          onDoubleClick={() => onDoubleClickEntry(entry)}
          className="group relative rounded-md bg-slate-50 border border-slate-200 px-2 py-1 mb-1 cursor-pointer hover:border-primary/40 hover:bg-blue-50 transition-colors select-none"
          title="Doble clic para editar"
        >
          <p className="font-body text-[10px] text-slate-700 line-clamp-1 pr-4">{entry.name}</p>
          {entry.calories && <p className="font-label text-[8px] text-slate-400">{entry.calories} kcal</p>}
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteEntry(entry.id) }}
            className="absolute top-0.5 right-1 text-[8px] text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >✕</button>
        </div>
      ))}
    </div>
  )
}

// --- Entry edit modal ---
function EntryModal({ entry, onClose, onSave }: {
  entry: MealPlanEntry
  onClose: () => void
  onSave: (updated: Partial<MealPlanEntry>) => Promise<void>
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
  const [ingredientInput, setIngredientInput] = useState({ name: "", amount: "", unit: "" })
  const [saving, setSaving] = useState(false)

  const addIngredient = () => {
    if (!ingredientInput.name.trim()) return
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ...ingredientInput }] }))
    setIngredientInput({ name: "", amount: "", unit: "" })
  }

  const removeIngredient = (idx: number) => {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_: Ingredient, i: number) => i !== idx) }))
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      name: form.name,
      calories: form.calories ? Number(form.calories) : undefined,
      protein_g: form.protein_g ? Number(form.protein_g) : undefined,
      carbs_g: form.carbs_g ? Number(form.carbs_g) : undefined,
      fats_g: form.fats_g ? Number(form.fats_g) : undefined,
      instructions: form.instructions || undefined,
      notes: form.notes || undefined,
      ingredients: form.ingredients,
    })
    setSaving(false)
  }

  const slot = SLOTS.find((s) => s.value === entry.meal_slot)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bebas text-2xl tracking-wide text-slate-900">EDITAR ENTRADA</h2>
            <p className="font-label text-[9px] uppercase tracking-[0.1em] text-slate-400 mt-0.5">
              Día {entry.day_of_month} · <span className={slot?.text}>{slot?.label}</span> — solo aplica a este día
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">Nombre</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 transition-colors" />
          </div>
          {[{ key: "calories", label: "Kcal" }, { key: "protein_g", label: "Proteína (g)" }, { key: "carbs_g", label: "Carbs (g)" }, { key: "fats_g", label: "Grasas (g)" }].map(({ key, label }) => (
            <div key={key}>
              <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">{label}</label>
              <input type="number" value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 transition-colors" />
            </div>
          ))}

          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">Ingredientes</label>
            <div className="flex gap-2 mb-2">
              <input value={ingredientInput.name} onChange={(e) => setIngredientInput((i) => ({ ...i, name: e.target.value }))} placeholder="Ingrediente" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-body focus:outline-none focus:border-primary/60" />
              <input value={ingredientInput.amount} onChange={(e) => setIngredientInput((i) => ({ ...i, amount: e.target.value }))} placeholder="Cant." className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-body focus:outline-none focus:border-primary/60" />
              <input value={ingredientInput.unit} onChange={(e) => setIngredientInput((i) => ({ ...i, unit: e.target.value }))} placeholder="Unidad" className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-body focus:outline-none focus:border-primary/60" />
              <button type="button" onClick={addIngredient} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-label text-xs hover:bg-primary/20 transition-colors">+</button>
            </div>
            {form.ingredients.length > 0 && (
              <ul className="space-y-1 bg-slate-50 rounded-xl p-3">
                {form.ingredients.map((ing: Ingredient, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-body text-slate-600">
                    <span className="flex-1">{ing.name} — {ing.amount} {ing.unit}</span>
                    <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600 text-[10px]">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">Preparación</label>
            <textarea value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 transition-colors resize-none" />
          </div>
          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1">Notas para este día</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 transition-colors resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 font-label text-xs uppercase tracking-[0.15em] text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-primary text-white font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Main page ---
export default function PlanPage() {
  const { userId, yearMonth } = useParams<{ userId: string; yearMonth: string }>()
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [plan, setPlan] = useState<MealPlan | null>(null)
  const [entries, setEntries] = useState<MealPlanEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [recipeFilter, setRecipeFilter] = useState<RecipeCategory | "todas">("todas")
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null)
  const [editingEntry, setEditingEntry] = useState<MealPlanEntry | null>(null)
  const [clientName, setClientName] = useState("")

  const daysInMonth = getDaysInMonth(yearMonth)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    const load = async () => {
      const [recipesRes, profileRes, planRes] = await Promise.all([
        fetch("/api/nutrition/recipes").then((r) => r.json()),
        supabase.from("profiles").select("first_name, last_name").eq("id", userId).single(),
        fetch(`/api/nutrition/meal-plans?userId=${userId}&yearMonth=${yearMonth}`).then((r) => r.json()),
      ])

      setRecipes(recipesRes)
      if (profileRes.data) setClientName(`${profileRes.data.first_name} ${profileRes.data.last_name}`)

      let currentPlan: MealPlan | null = null
      if (Array.isArray(planRes) && planRes.length > 0) {
        currentPlan = planRes[0]
      } else {
        const created = await fetch("/api/nutrition/meal-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, year_month: yearMonth }),
        }).then((r) => r.json())
        currentPlan = created
      }

      setPlan(currentPlan)
      if (currentPlan?.id) {
        const entriesData = await fetch(`/api/nutrition/meal-plans/${currentPlan.id}/entries`).then((r) => r.json())
        setEntries(Array.isArray(entriesData) ? entriesData : [])
      }
      setLoading(false)
    }
    load()
  }, [userId, yearMonth])

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string
    if (id.startsWith("recipe::")) {
      setActiveRecipe(recipes.find((r) => r.id === id.replace("recipe::", "")) ?? null)
    }
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
      body: JSON.stringify({
        recipe_id: recipe.id,
        day_of_month: Number(dayStr),
        meal_slot: slot as MealSlot,
        name: recipe.name,
        calories: recipe.calories ?? null,
        protein_g: recipe.protein_g ?? null,
        carbs_g: recipe.carbs_g ?? null,
        fats_g: recipe.fats_g ?? null,
        ingredients: recipe.ingredients ?? [],
        instructions: recipe.instructions ?? null,
      }),
    })
    if (res.ok) {
      const newEntry = await res.json()
      setEntries((prev) => [...prev, newEntry])
    }
  }, [plan, recipes])

  const handleDeleteEntry = async (entryId: string) => {
    if (!plan) return
    await fetch(`/api/nutrition/meal-plans/${plan.id}/entries/${entryId}`, { method: "DELETE" })
    setEntries((prev) => prev.filter((e) => e.id !== entryId))
  }

  const handleSaveEntry = async (updated: Partial<MealPlanEntry>) => {
    if (!editingEntry || !plan) return
    const res = await fetch(`/api/nutrition/meal-plans/${plan.id}/entries/${editingEntry.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      const saved = await res.json()
      setEntries((prev) => prev.map((e) => (e.id === saved.id ? saved : e)))
    }
    setEditingEntry(null)
  }

  const getEntriesForSlot = (day: number, slot: MealSlot) =>
    entries.filter((e) => e.day_of_month === day && e.meal_slot === slot)

  const filteredRecipes = recipeFilter === "todas" ? recipes : recipes.filter((r) => r.category === recipeFilter)

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login") }

  const macros = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0, days: new Set<number>() }
    for (const e of entries) {
      totals.calories += e.calories ?? 0
      totals.protein += e.protein_g ?? 0
      totals.carbs += e.carbs_g ?? 0
      totals.fats += e.fats_g ?? 0
      totals.days.add(e.day_of_month)
    }
    const daysWithData = totals.days.size || 1
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fats: Math.round(totals.fats * 10) / 10,
      avgCalories: Math.round(totals.calories / daysWithData),
      avgProtein: Math.round((totals.protein / daysWithData) * 10) / 10,
      avgCarbs: Math.round((totals.carbs / daysWithData) * 10) / 10,
      avgFats: Math.round((totals.fats / daysWithData) * 10) / 10,
      daysWithData,
    }
  }, [entries])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const [year, month] = yearMonth.split("-")
  const monthLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" })

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Nav */}
        <nav className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-6">
            <Link href="/nutricion" className="font-bebas text-xl tracking-wide text-slate-900 hover:text-primary transition-colors">NUTRICIÓN</Link>
            <span className="text-slate-300 hidden md:block">|</span>
            <Link href="/nutricion" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">Clientes</Link>
            <Link href="/nutricion/recetas" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">Recetas</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-300 hover:text-slate-500 transition-colors border border-slate-200 rounded-lg px-2 py-1">← Admin</Link>
            <button onClick={handleLogout} className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors">Cerrar Sesión</button>
          </div>
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
                <button
                  key={c.value}
                  onClick={() => setRecipeFilter(c.value as RecipeCategory | "todas")}
                  className={`px-2 py-0.5 rounded-full font-label text-[8px] uppercase tracking-[0.1em] border transition-colors ${
                    recipeFilter === c.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredRecipes.map((recipe) => <DraggableRecipe key={recipe.id} recipe={recipe} />)}
              {filteredRecipes.length === 0 && (
                <p className="text-center text-slate-400 font-body text-xs py-8">Sin recetas.</p>
              )}
            </div>
          </aside>

          {/* Main grid */}
          <main className="flex-1 overflow-auto p-6">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <Link href={`/nutricion/clientes/${userId}`} className="font-label text-[9px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 mb-1">
                  ← {clientName}
                </Link>
                <h1 className="font-bebas text-3xl md:text-4xl tracking-tight text-slate-900 capitalize">
                  Plan <span className="text-primary">{monthLabel}</span>
                </h1>
                <p className="font-label text-[9px] uppercase tracking-[0.1em] text-slate-400 mt-1">
                  Doble clic en una entrada para editarla
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/nutricion/clientes/${userId}/plan/${getPrevMonth(yearMonth)}`}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-label text-[9px] uppercase tracking-[0.1em] text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
                  ← Anterior
                </Link>
                <Link href={`/nutricion/clientes/${userId}/plan/${getNextMonth(yearMonth)}`}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-label text-[9px] uppercase tracking-[0.1em] text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
                  Siguiente →
                </Link>
              </div>
            </header>

            {/* Macro dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                {
                  label: "Calorías totales",
                  value: macros.calories > 0 ? macros.calories.toLocaleString("es-MX") : "—",
                  unit: "kcal",
                  avg: macros.calories > 0 ? `${macros.avgCalories.toLocaleString("es-MX")} kcal/día` : null,
                  bg: "bg-amber-50 border-amber-200",
                  bar: "bg-amber-400",
                  text: "text-amber-700",
                },
                {
                  label: "Proteína total",
                  value: macros.protein > 0 ? macros.protein.toLocaleString("es-MX") : "—",
                  unit: "g",
                  avg: macros.protein > 0 ? `${macros.avgProtein} g/día` : null,
                  bg: "bg-blue-50 border-blue-200",
                  bar: "bg-blue-400",
                  text: "text-blue-700",
                },
                {
                  label: "Carbohidratos total",
                  value: macros.carbs > 0 ? macros.carbs.toLocaleString("es-MX") : "—",
                  unit: "g",
                  avg: macros.carbs > 0 ? `${macros.avgCarbs} g/día` : null,
                  bg: "bg-orange-50 border-orange-200",
                  bar: "bg-orange-400",
                  text: "text-orange-700",
                },
                {
                  label: "Grasas total",
                  value: macros.fats > 0 ? macros.fats.toLocaleString("es-MX") : "—",
                  unit: "g",
                  avg: macros.fats > 0 ? `${macros.avgFats} g/día` : null,
                  bg: "bg-rose-50 border-rose-200",
                  bar: "bg-rose-400",
                  text: "text-rose-700",
                },
              ].map((m) => (
                <div key={m.label} className={`rounded-xl border ${m.bg} p-4 flex flex-col gap-1`}>
                  <span className={`font-label text-[9px] uppercase tracking-[0.15em] ${m.text}`}>{m.label}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bebas text-3xl text-slate-900">{m.value}</span>
                    {m.value !== "—" && <span className={`font-label text-[10px] ${m.text}`}>{m.unit}</span>}
                  </div>
                  {m.avg && (
                    <span className="font-label text-[8px] uppercase tracking-[0.1em] text-slate-400 mt-0.5">
                      Prom: {m.avg} · {macros.daysWithData} días con datos
                    </span>
                  )}
                  {!m.avg && (
                    <span className="font-label text-[8px] text-slate-300 mt-0.5">Sin entradas aún</span>
                  )}
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th className="w-12 py-2 text-left font-label text-[9px] uppercase tracking-[0.15em] text-slate-400 pr-3">Día</th>
                    {SLOTS.map((slot) => (
                      <th key={slot.value} className={`py-2 px-2 font-label text-[9px] uppercase tracking-[0.15em] ${slot.text} text-left`}>
                        {slot.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <tr key={day} className="border-t border-slate-100">
                      <td className="py-1 pr-3 font-bebas text-xl text-slate-300 align-top pt-2">{day}</td>
                      {SLOTS.map((slot) => (
                        <td key={slot.value} className="py-1 px-1 align-top">
                          <MealSlotCell
                            day={day} slot={slot.value}
                            entries={getEntriesForSlot(day, slot.value)}
                            onDoubleClickEntry={setEditingEntry}
                            onDeleteEntry={handleDeleteEntry}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>

        <footer className="border-t border-slate-200 py-4 text-center bg-white">
          <span className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400">© 2026 ON3 P3RCENT · NUTRICIÓN</span>
        </footer>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeRecipe && (
          <div className="bg-white rounded-xl border border-primary shadow-lg shadow-primary/20 p-3 w-52 opacity-95">
            <span className="font-label text-[8px] uppercase tracking-[0.15em] text-primary">{CATEGORY_LABELS[activeRecipe.category]}</span>
            <p className="font-body text-xs text-slate-800 mt-0.5 font-medium">{activeRecipe.name}</p>
            {activeRecipe.calories && <p className="font-label text-[8px] text-slate-400 mt-1">{activeRecipe.calories} kcal</p>}
          </div>
        )}
      </DragOverlay>

      {editingEntry && (
        <EntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} onSave={handleSaveEntry} />
      )}
    </DndContext>
  )
}
