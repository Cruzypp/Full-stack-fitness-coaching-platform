"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/connection"
import type { Recipe, RecipeCategory, Ingredient } from "../../../types/nutrition"

const CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "comida", label: "Comida" },
  { value: "cena", label: "Cena" },
  { value: "snack", label: "Snack" },
  { value: "colacion", label: "Colación" },
]

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

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    setLoading(true)
    const res = await fetch("/api/nutrition/recipes")
    const data = await res.json()
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
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { ...ingredientInput }],
    }))
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
    const method = editingRecipe ? "PUT" : "POST"

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Error al guardar")
      setSaving(false)
      return
    }

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-5 border-b border-border/10 gap-4 md:gap-0">
        <Link href="/" className="font-bebas text-xl md:text-2xl tracking-wide text-foreground hover:opacity-80 transition-opacity">
          THE ON3 P3RCENT
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link href="/admin/dashboard" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/admin/nutricion" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Nutrición</Link>
          <span className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-primary">Recetas</span>
          <button onClick={handleLogout} className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
        <header className="mb-8 fade-up flex items-end justify-between">
          <div>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-tight">
              BIBLIOTECA DE <span className="text-shimmer">RECETAS</span>
            </h1>
            <p className="mt-2 font-body text-muted-foreground">Crea y gestiona recetas para los planes mensuales.</p>
          </div>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors"
          >
            + Nueva receta
          </button>
        </header>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6 fade-up" style={{ animationDelay: "0.05s" }}>
          {[{ value: "todas", label: "Todas" }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value as RecipeCategory | "todas")}
              className={`px-4 py-1.5 rounded-full font-label text-[10px] uppercase tracking-[0.15em] transition-colors ${
                filter === c.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/20 text-muted-foreground hover:text-foreground border border-border/20"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-up" style={{ animationDelay: "0.1s" }}>
            {filtered.map((recipe) => (
              <div key={recipe.id} className="glass-card rounded-2xl border border-border/20 p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-label text-[9px] uppercase tracking-[0.2em] text-primary">
                      {CATEGORIES.find((c) => c.value === recipe.category)?.label}
                    </span>
                    <h3 className="font-bebas text-xl tracking-wide mt-0.5">{recipe.name}</h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(recipe)} className="font-label text-[9px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Editar</button>
                    <button onClick={() => handleDelete(recipe.id)} className="font-label text-[9px] uppercase tracking-[0.15em] text-destructive/70 hover:text-destructive transition-colors">Eliminar</button>
                  </div>
                </div>

                {recipe.description && (
                  <p className="text-xs text-muted-foreground font-body line-clamp-2">{recipe.description}</p>
                )}

                {(recipe.calories || recipe.protein_g || recipe.carbs_g || recipe.fats_g) && (
                  <div className="grid grid-cols-4 gap-1 pt-2 border-t border-border/10">
                    {[
                      { label: "Kcal", value: recipe.calories },
                      { label: "Prot", value: recipe.protein_g ? `${recipe.protein_g}g` : null },
                      { label: "Carbs", value: recipe.carbs_g ? `${recipe.carbs_g}g` : null },
                      { label: "Grasas", value: recipe.fats_g ? `${recipe.fats_g}g` : null },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <div className="font-bebas text-base text-foreground">{m.value ?? "—"}</div>
                        <div className="font-label text-[8px] uppercase tracking-[0.15em] text-muted-foreground/60">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {recipe.ingredients?.length > 0 && (
                  <div className="text-xs text-muted-foreground font-body">
                    <span className="font-label text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 block mb-1">Ingredientes</span>
                    {recipe.ingredients.slice(0, 3).map((ing, i) => (
                      <span key={i}>{ing.name}{i < Math.min(recipe.ingredients.length, 3) - 1 ? ", " : ""}</span>
                    ))}
                    {recipe.ingredients.length > 3 && <span className="text-muted-foreground/50"> +{recipe.ingredients.length - 3} más</span>}
                  </div>
                )}

                {recipe.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary/30 text-muted-foreground font-label text-[8px] uppercase tracking-[0.1em]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground/50 font-body">
                No hay recetas en esta categoría.
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">© 2026 ON3 P3RCENT</span>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-border/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide">
                {editingRecipe ? "EDITAR RECETA" : "NUEVA RECETA"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-body">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
                  placeholder="Ej. Avena con fruta y almendras"
                />
              </div>

              <div>
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as RecipeCategory }))}
                  className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Tags (separados por coma)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
                  placeholder="alto proteína, bajo carbohidrato"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>

              {/* Macros */}
              {[
                { key: "calories", label: "Kcal" },
                { key: "protein_g", label: "Proteína (g)" },
                { key: "carbs_g", label: "Carbs (g)" },
                { key: "fats_g", label: "Grasas (g)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">{label}</label>
                  <input
                    type="number"
                    value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              ))}

              {/* Ingredients */}
              <div className="md:col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">Ingredientes</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={ingredientInput.name}
                    onChange={(e) => setIngredientInput((i) => ({ ...i, name: e.target.value }))}
                    placeholder="Ingrediente"
                    className="flex-1 bg-secondary/10 border border-border/20 rounded-xl px-3 py-2 text-xs font-body text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <input
                    value={ingredientInput.amount}
                    onChange={(e) => setIngredientInput((i) => ({ ...i, amount: e.target.value }))}
                    placeholder="Cantidad"
                    className="w-24 bg-secondary/10 border border-border/20 rounded-xl px-3 py-2 text-xs font-body text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <input
                    value={ingredientInput.unit}
                    onChange={(e) => setIngredientInput((i) => ({ ...i, unit: e.target.value }))}
                    placeholder="Unidad"
                    className="w-20 bg-secondary/10 border border-border/20 rounded-xl px-3 py-2 text-xs font-body text-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="px-3 py-2 rounded-xl bg-primary/20 text-primary font-label text-xs hover:bg-primary/30 transition-colors"
                  >
                    +
                  </button>
                </div>
                {form.ingredients.length > 0 && (
                  <ul className="space-y-1">
                    {form.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                        <span className="flex-1">{ing.name} — {ing.amount} {ing.unit}</span>
                        <button onClick={() => removeIngredient(idx)} className="text-destructive/60 hover:text-destructive text-[10px]">✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Preparación</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                  rows={4}
                  className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50 resize-none"
                  placeholder="Describe los pasos de preparación..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border/20 font-label text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : editingRecipe ? "Actualizar" : "Crear receta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
