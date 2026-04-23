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
