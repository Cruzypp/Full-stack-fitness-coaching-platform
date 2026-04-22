"use client"
import { useState, useEffect, useCallback } from "react"
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
import { supabase } from "../../../../../../lib/connection"
import type { Recipe, MealPlan, MealPlanEntry, MealSlot, RecipeCategory, Ingredient } from "../../../../../../types/nutrition"

const SLOTS: { value: MealSlot; label: string; color: string }[] = [
  { value: "desayuno", label: "Desayuno", color: "text-amber-400" },
  { value: "comida", label: "Comida", color: "text-emerald-400" },
  { value: "cena", label: "Cena", color: "text-blue-400" },
  { value: "snack", label: "Snack", color: "text-purple-400" },
  { value: "colacion", label: "Colación", color: "text-rose-400" },
]

const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
  snack: "Snack",
  colacion: "Colación",
}

function getDaysInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number)
  return new Date(y, m, 0).getDate()
}

// --- Draggable recipe card in sidebar ---
function DraggableRecipe({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `recipe::${recipe.id}` })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`glass-card rounded-xl border border-border/20 p-3 cursor-grab active:cursor-grabbing select-none transition-opacity ${isDragging ? "opacity-30" : "hover:border-primary/30"}`}
    >
      <span className={`font-label text-[8px] uppercase tracking-[0.15em] ${SLOTS.find((s) => s.value === recipe.category)?.color ?? "text-muted-foreground"}`}>
        {CATEGORY_LABELS[recipe.category]}
      </span>
      <p className="font-body text-xs text-foreground mt-0.5 font-medium line-clamp-1">{recipe.name}</p>
      {recipe.calories && (
        <p className="font-label text-[8px] text-muted-foreground/60 mt-1">{recipe.calories} kcal</p>
      )}
    </div>
  )
}

// --- Droppable meal slot cell ---
function MealSlotCell({
  day,
  slot,
  entries,
  onDoubleClickEntry,
  onDeleteEntry,
}: {
  day: number
  slot: MealSlot
  entries: MealPlanEntry[]
  onDoubleClickEntry: (entry: MealPlanEntry) => void
  onDeleteEntry: (entryId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot::${day}::${slot}` })
  const slotInfo = SLOTS.find((s) => s.value === slot)

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[52px] rounded-lg border transition-colors p-1 ${
        isOver
          ? "border-primary/60 bg-primary/10"
          : entries.length > 0
          ? "border-border/20 bg-secondary/5"
          : "border-dashed border-border/10 bg-transparent"
      }`}
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          onDoubleClick={() => onDoubleClickEntry(entry)}
          className="group relative rounded-md bg-secondary/20 border border-border/20 px-2 py-1 mb-1 cursor-pointer hover:border-primary/30 transition-colors select-none"
          title="Doble clic para editar"
        >
          <p className="font-body text-[10px] text-foreground line-clamp-1">{entry.name}</p>
          {entry.calories && (
            <p className="font-label text-[8px] text-muted-foreground/50">{entry.calories} kcal</p>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteEntry(entry.id) }}
            className="absolute top-0.5 right-1 text-[8px] text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

// --- Entry edit modal ---
function EntryModal({
  entry,
  onClose,
  onSave,
}: {
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
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }))
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-border/30 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bebas text-2xl tracking-wide">EDITAR ENTRADA</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
        </div>
        <p className="font-label text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50">
          Día {entry.day_of_month} · {SLOTS.find((s) => s.value === entry.meal_slot)?.label} — esta edición es solo para este día, no modifica la receta original.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-secondary/10 border border-border/20 rounded-xl px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>

          {[
            { key: "calories", label: "Kcal" },
            { key: "protein_g", label: "Proteína (g)" },
            { key: "carbs_g", label: "Carbs (g)" },
            { key: "fats_g", label: "Grasas (g)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1">{label}</label>
              <input
                type="number"
                value={(form as Record<string, unknown>)[key] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-secondary/10 border border-border/20 rounded-xl px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1">Ingredientes</label>
            <div className="flex gap-2 mb-2">
              <input value={ingredientInput.name} onChange={(e) => setIngredientInput((i) => ({ ...i, name: e.target.value }))} placeholder="Ingrediente" className="flex-1 bg-secondary/10 border border-border/20 rounded-xl px-3 py-1.5 text-xs font-body text-foreground focus:outline-none focus:border-primary/50" />
              <input value={ingredientInput.amount} onChange={(e) => setIngredientInput((i) => ({ ...i, amount: e.target.value }))} placeholder="Cant." className="w-20 bg-secondary/10 border border-border/20 rounded-xl px-3 py-1.5 text-xs font-body text-foreground focus:outline-none focus:border-primary/50" />
              <input value={ingredientInput.unit} onChange={(e) => setIngredientInput((i) => ({ ...i, unit: e.target.value }))} placeholder="Unidad" className="w-20 bg-secondary/10 border border-border/20 rounded-xl px-3 py-1.5 text-xs font-body text-foreground focus:outline-none focus:border-primary/50" />
              <button type="button" onClick={addIngredient} className="px-3 py-1.5 rounded-xl bg-primary/20 text-primary font-label text-xs hover:bg-primary/30 transition-colors">+</button>
            </div>
            {form.ingredients.length > 0 && (
              <ul className="space-y-1">
                {form.ingredients.map((ing: Ingredient, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                    <span className="flex-1">{ing.name} — {ing.amount} {ing.unit}</span>
                    <button onClick={() => removeIngredient(idx)} className="text-destructive/60 hover:text-destructive text-[10px]">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1">Preparación</label>
            <textarea
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
              rows={3}
              className="w-full bg-secondary/10 border border-border/20 rounded-xl px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          <div className="col-span-2">
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1">Notas para este día</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-secondary/10 border border-border/20 rounded-xl px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-border/20 font-label text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50">
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
      if (profileRes.data) {
        setClientName(`${profileRes.data.first_name} ${profileRes.data.last_name}`)
      }

      let currentPlan: MealPlan | null = null
      if (Array.isArray(planRes) && planRes.length > 0) {
        currentPlan = planRes[0]
      } else {
        // Create plan if not exists
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
      const recipeId = id.replace("recipe::", "")
      setActiveRecipe(recipes.find((r) => r.id === recipeId) ?? null)
    }
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveRecipe(null)
      const { active, over } = event
      if (!over || !plan) return

      const activeId = active.id as string
      const overId = over.id as string

      if (!activeId.startsWith("recipe::") || !overId.startsWith("slot::")) return

      const recipeId = activeId.replace("recipe::", "")
      const [, dayStr, slot] = overId.split("::")
      const day = Number(dayStr)
      const recipe = recipes.find((r) => r.id === recipeId)
      if (!recipe) return

      const payload = {
        recipe_id: recipe.id,
        day_of_month: day,
        meal_slot: slot as MealSlot,
        name: recipe.name,
        calories: recipe.calories ?? null,
        protein_g: recipe.protein_g ?? null,
        carbs_g: recipe.carbs_g ?? null,
        fats_g: recipe.fats_g ?? null,
        ingredients: recipe.ingredients ?? [],
        instructions: recipe.instructions ?? null,
      }

      const res = await fetch(`/api/nutrition/meal-plans/${plan.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const newEntry = await res.json()
        setEntries((prev) => [...prev, newEntry])
      }
    },
    [plan, recipes]
  )

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen noise-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const [year, month] = yearMonth.split("-")
  const monthLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" })

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen noise-bg relative flex flex-col">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-5 border-b border-border/10 gap-4 md:gap-0">
          <Link href="/" className="font-bebas text-xl md:text-2xl tracking-wide text-foreground hover:opacity-80 transition-opacity">
            THE ON3 P3RCENT
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link href="/admin/dashboard" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/admin/nutricion" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Nutrición</Link>
            <Link href={`/admin/nutricion/clientes/${userId}`} className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">← Cliente</Link>
            <Link href="/admin/nutricion/recetas" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Recetas</Link>
            <button onClick={handleLogout} className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Cerrar Sesión</button>
          </div>
        </nav>

        <div className="relative z-10 flex flex-1 overflow-hidden">
          {/* Sidebar - Recipe library */}
          <aside className="w-64 shrink-0 border-r border-border/10 flex flex-col overflow-hidden bg-[#050505]/80">
            <div className="p-4 border-b border-border/10">
              <h2 className="font-bebas text-lg tracking-wide">RECETAS</h2>
              <p className="font-label text-[8px] uppercase tracking-[0.1em] text-muted-foreground/50 mt-0.5">Arrastra al plan</p>
            </div>

            <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1">
              {[{ value: "todas", label: "Todas" }, ...SLOTS.map((s) => ({ value: s.value, label: s.label }))].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setRecipeFilter(c.value as RecipeCategory | "todas")}
                  className={`px-2 py-0.5 rounded-full font-label text-[8px] uppercase tracking-[0.1em] transition-colors ${
                    recipeFilter === c.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredRecipes.map((recipe) => (
                <DraggableRecipe key={recipe.id} recipe={recipe} />
              ))}
              {filteredRecipes.length === 0 && (
                <p className="text-center text-muted-foreground/40 font-body text-xs py-8">Sin recetas en esta categoría.</p>
              )}
            </div>
          </aside>

          {/* Main - Month grid */}
          <main className="flex-1 overflow-auto p-6">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <Link href={`/admin/nutricion/clientes/${userId}`} className="font-label text-[9px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-1">
                  ← {clientName}
                </Link>
                <h1 className="font-bebas text-3xl md:text-4xl tracking-tight capitalize">
                  Plan <span className="text-shimmer">{monthLabel}</span>
                </h1>
                <p className="font-label text-[9px] uppercase tracking-[0.1em] text-muted-foreground/50 mt-1">
                  Doble clic en una entrada para editarla
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/nutricion/clientes/${userId}/plan/${getPrevMonth(yearMonth)}`}
                  className="px-3 py-1.5 rounded-xl border border-border/20 font-label text-[9px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Anterior
                </Link>
                <Link
                  href={`/admin/nutricion/clientes/${userId}/plan/${getNextMonth(yearMonth)}`}
                  className="px-3 py-1.5 rounded-xl border border-border/20 font-label text-[9px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Siguiente →
                </Link>
              </div>
            </header>

            {/* Grid: days × meal slots */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th className="w-14 py-2 text-left font-label text-[9px] uppercase tracking-[0.15em] text-muted-foreground/50 pr-3">Día</th>
                    {SLOTS.map((slot) => (
                      <th key={slot.value} className={`py-2 px-2 font-label text-[9px] uppercase tracking-[0.15em] ${slot.color} text-left`}>
                        {slot.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <tr key={day} className="border-t border-border/10">
                      <td className="py-1 pr-3 font-bebas text-xl text-muted-foreground/40 align-top pt-2">{day}</td>
                      {SLOTS.map((slot) => (
                        <td key={slot.value} className="py-1 px-1 align-top">
                          <MealSlotCell
                            day={day}
                            slot={slot.value}
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

        <footer className="relative z-10 border-t border-border py-4 text-center">
          <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">© 2026 ON3 P3RCENT</span>
        </footer>
      </div>

      {/* DragOverlay - ghost card while dragging */}
      <DragOverlay>
        {activeRecipe && (
          <div className="glass-card rounded-xl border border-primary/40 p-3 w-52 shadow-xl shadow-primary/20 opacity-90">
            <span className="font-label text-[8px] uppercase tracking-[0.15em] text-primary">{CATEGORY_LABELS[activeRecipe.category]}</span>
            <p className="font-body text-xs text-foreground mt-0.5 font-medium">{activeRecipe.name}</p>
            {activeRecipe.calories && <p className="font-label text-[8px] text-muted-foreground/60 mt-1">{activeRecipe.calories} kcal</p>}
          </div>
        )}
      </DragOverlay>

      {/* Entry edit modal */}
      {editingEntry && (
        <EntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSaveEntry}
        />
      )}
    </DndContext>
  )
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
