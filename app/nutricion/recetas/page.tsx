"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/connection"
import type { Recipe, RecipeCategory, Ingredient } from "../../types/nutrition"

const CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "comida", label: "Comida" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
  { value: "colacion", label: "Colación" },
]

const CATEGORY_COLORS: Record<RecipeCategory, string> = {
  desayuno: "bg-amber-100 text-amber-700",
  comida: "bg-emerald-100 text-emerald-700",
  cena: "bg-blue-100 text-blue-700",
  snack: "bg-purple-100 text-purple-700",
  colacion: "bg-rose-100 text-rose-700",
}

const EMPTY_RECIPE = {
  name: "",
  category: "desayuno" as RecipeCategory,
  description: "",
  calories: "",
  protein_g: "",
  carbs_g: "",
  fats_g: "",
  ingredients: [] as Ingredient[],
  instructions: "",
  tags: "",
}

export default function RecetasPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<RecipeCategory | "todas">("todas")
  const [showModal, setShowModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [form, setForm] = useState(EMPTY_RECIPE)
  const [ingredientInput, setIngredientInput] = useState({ name: "", amount: "", unit: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { loadRecipes() }, [])

  const loadRecipes = async () => {
    setLoading(true)
    const data = await fetch("/api/nutrition/recipes").then((r) => r.json())
    setRecipes(data)
    setLoading(false)
  }

  const openCreate = () => {
    setEditingRecipe(null)
    setForm(EMPTY_RECIPE)
    setError("")
    setShowModal(true)
  }

  const openEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setForm({
      name: recipe.name,
      category: recipe.category,
      description: recipe.description ?? "",
      calories: recipe.calories?.toString() ?? "",
      protein_g: recipe.protein_g?.toString() ?? "",
      carbs_g: recipe.carbs_g?.toString() ?? "",
      fats_g: recipe.fats_g?.toString() ?? "",
      ingredients: recipe.ingredients ?? [],
      instructions: recipe.instructions ?? "",
      tags: recipe.tags?.join(", ") ?? "",
    })
    setError("")
    setShowModal(true)
  }

  const addIngredient = () => {
    if (!ingredientInput.name.trim()) return
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { ...ingredientInput }] }))
    setIngredientInput({ name: "", amount: "", unit: "" })
  }

  const removeIngredient = (idx: number) => {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError("El nombre es requerido"); return }
    setSaving(true)
    setError("")
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description || null,
      calories: form.calories ? Number(form.calories) : null,
      protein_g: form.protein_g ? Number(form.protein_g) : null,
      carbs_g: form.carbs_g ? Number(form.carbs_g) : null,
      fats_g: form.fats_g ? Number(form.fats_g) : null,
      ingredients: form.ingredients,
      instructions: form.instructions || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    }
    const url = editingRecipe ? `/api/nutrition/recipes/${editingRecipe.id}` : "/api/nutrition/recipes"
    const res = await fetch(url, { method: editingRecipe ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error al guardar"); setSaving(false); return }
    await loadRecipes()
    setShowModal(false)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta receta?")) return
    await fetch(`/api/nutrition/recipes/${id}`, { method: "DELETE" })
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  const filtered = filter === "todas" ? recipes : recipes.filter((r) => r.category === filter)

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login") }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href="/nutricion" className="font-bebas text-xl tracking-wide text-slate-900 hover:text-primary transition-colors">NUTRICIÓN</Link>
          <span className="text-slate-300 hidden md:block">|</span>
          <Link href="/nutricion" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">Clientes</Link>
          <Link href="/nutricion/recetas" className="font-label text-[10px] uppercase tracking-[0.15em] text-primary">Recetas</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors">Panel Admin</Link>
          <button onClick={handleLogout} className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="flex-1 px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-tight text-slate-900">
              BIBLIOTECA DE <span className="text-primary">RECETAS</span>
            </h1>
            <p className="mt-1 font-body text-slate-500 text-sm">Crea y gestiona recetas para los planes mensuales.</p>
          </div>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors shadow-sm"
          >
            + Nueva receta
          </button>
        </header>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[{ value: "todas", label: "Todas" }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value as RecipeCategory | "todas")}
              className={`px-4 py-1.5 rounded-full font-label text-[10px] uppercase tracking-[0.15em] border transition-colors ${
                filter === c.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full font-label text-[9px] uppercase tracking-[0.15em] ${CATEGORY_COLORS[recipe.category]}`}>
                      {CATEGORIES.find((c) => c.value === recipe.category)?.label}
                    </span>
                    <h3 className="font-bebas text-xl tracking-wide text-slate-900 mt-1">{recipe.name}</h3>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => openEdit(recipe)} className="font-label text-[9px] uppercase tracking-[0.1em] text-slate-400 hover:text-slate-700 transition-colors">Editar</button>
                    <button onClick={() => handleDelete(recipe.id)} className="font-label text-[9px] uppercase tracking-[0.1em] text-red-400 hover:text-red-600 transition-colors">Eliminar</button>
                  </div>
                </div>

                {recipe.description && <p className="text-xs text-slate-500 font-body line-clamp-2">{recipe.description}</p>}

                {(recipe.calories || recipe.protein_g || recipe.carbs_g || recipe.fats_g) && (
                  <div className="grid grid-cols-4 gap-1 pt-3 border-t border-slate-100">
                    {[
                      { label: "Kcal", value: recipe.calories },
                      { label: "Prot", value: recipe.protein_g ? `${recipe.protein_g}g` : null },
                      { label: "Carbs", value: recipe.carbs_g ? `${recipe.carbs_g}g` : null },
                      { label: "Grasas", value: recipe.fats_g ? `${recipe.fats_g}g` : null },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <div className="font-bebas text-lg text-slate-900">{m.value ?? "—"}</div>
                        <div className="font-label text-[8px] uppercase tracking-[0.1em] text-slate-400">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {recipe.ingredients?.length > 0 && (
                  <div className="text-xs text-slate-500 font-body">
                    <span className="font-label text-[9px] uppercase tracking-[0.1em] text-slate-400 block mb-1">Ingredientes</span>
                    {recipe.ingredients.slice(0, 3).map((ing, i) => (
                      <span key={i}>{ing.name}{i < Math.min(recipe.ingredients.length, 3) - 1 ? ", " : ""}</span>
                    ))}
                    {recipe.ingredients.length > 3 && <span className="text-slate-400"> +{recipe.ingredients.length - 3} más</span>}
                  </div>
                )}

                {recipe.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-label text-[8px] uppercase tracking-[0.1em]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400 font-body">No hay recetas en esta categoría.</div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-5 text-center bg-white">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400">© 2026 ON3 P3RCENT · NUTRICIÓN</span>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide text-slate-900">{editingRecipe ? "EDITAR RECETA" : "NUEVA RECETA"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-body">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 focus:bg-white transition-colors"
                  placeholder="Ej. Avena con fruta y almendras"
                />
              </div>

              <div>
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as RecipeCategory }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 focus:bg-white transition-colors"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Tags (separados por coma)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 focus:bg-white transition-colors"
                  placeholder="alto proteína, bajo carbohidrato"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 focus:bg-white transition-colors resize-none"
                />
              </div>

              {[
                { key: "calories", label: "Kcal" },
                { key: "protein_g", label: "Proteína (g)" },
                { key: "carbs_g", label: "Carbs (g)" },
                { key: "fats_g", label: "Grasas (g)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">{label}</label>
                  <input
                    type="number"
                    value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 focus:bg-white transition-colors"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-2">Ingredientes</label>
                <div className="flex gap-2 mb-2">
                  <input value={ingredientInput.name} onChange={(e) => setIngredientInput((i) => ({ ...i, name: e.target.value }))} placeholder="Ingrediente" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-body text-slate-900 focus:outline-none focus:border-primary/60" />
                  <input value={ingredientInput.amount} onChange={(e) => setIngredientInput((i) => ({ ...i, amount: e.target.value }))} placeholder="Cantidad" className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-body text-slate-900 focus:outline-none focus:border-primary/60" />
                  <input value={ingredientInput.unit} onChange={(e) => setIngredientInput((i) => ({ ...i, unit: e.target.value }))} placeholder="Unidad" className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-body text-slate-900 focus:outline-none focus:border-primary/60" />
                  <button type="button" onClick={addIngredient} className="px-3 py-2 rounded-xl bg-primary/10 text-primary font-label text-xs hover:bg-primary/20 transition-colors">+</button>
                </div>
                {form.ingredients.length > 0 && (
                  <ul className="space-y-1 bg-slate-50 rounded-xl p-3">
                    {form.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-body text-slate-600">
                        <span className="flex-1">{ing.name} — {ing.amount} {ing.unit}</span>
                        <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600 text-[10px]">✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Preparación</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 focus:bg-white transition-colors resize-none"
                  placeholder="Describe los pasos de preparación..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 font-label text-xs uppercase tracking-[0.15em] text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary text-white font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
                {saving ? "Guardando..." : editingRecipe ? "Actualizar" : "Crear receta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
