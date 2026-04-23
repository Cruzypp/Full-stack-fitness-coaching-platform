"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../../lib/connection"
import type { BodyMeasurement } from "../../../types/nutrition"

const MEASUREMENT_FIELDS = [
  { key: "weight_kg", label: "Peso", unit: "kg" },
  { key: "fat_percentage", label: "% Grasa", unit: "%" },
  { key: "muscle_mass_kg", label: "Masa Muscular", unit: "kg" },
  { key: "water_percentage", label: "% Agua", unit: "%" },
  { key: "visceral_fat", label: "Grasa Visceral", unit: "" },
  { key: "bone_mass_kg", label: "Masa Ósea", unit: "kg" },
  { key: "imc", label: "IMC", unit: "" },
  { key: "waist_cm", label: "Cintura", unit: "cm" },
  { key: "hip_cm", label: "Cadera", unit: "cm" },
  { key: "arm_cm", label: "Brazo", unit: "cm" },
]

const SUMMARY_COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-rose-50 border-rose-200",
  "bg-emerald-50 border-emerald-200",
  "bg-cyan-50 border-cyan-200",
  "bg-amber-50 border-amber-200",
]

type Profile = { id: string; first_name: string; last_name: string; email: string; phone?: string }

const EMPTY_FORM: Partial<Record<string, string>> & { measured_at: string; notes: string } = {
  measured_at: new Date().toISOString().slice(0, 10),
  notes: "",
  weight_kg: "", fat_percentage: "", muscle_mass_kg: "", water_percentage: "",
  visceral_fat: "", bone_mass_kg: "", imc: "", waist_cm: "", hip_cm: "", arm_cm: "",
}

export default function ClientePage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null)
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      fetch(`/api/nutrition/body-measurements?userId=${userId}`).then((r) => r.json()),
    ]).then(([profileRes, measurementsData]) => {
      if (profileRes.data) setProfile(profileRes.data)
      setMeasurements(Array.isArray(measurementsData) ? measurementsData : [])
      setLoading(false)
    })
  }, [userId])

  const openCreate = () => {
    setEditingMeasurement(null)
    setForm({ ...EMPTY_FORM, measured_at: new Date().toISOString().slice(0, 10) })
    setError("")
    setShowForm(true)
  }

  const openEdit = (m: BodyMeasurement) => {
    setEditingMeasurement(m)
    const f: typeof EMPTY_FORM = { measured_at: m.measured_at, notes: m.notes ?? "" }
    MEASUREMENT_FIELDS.forEach(({ key }) => {
      f[key] = (m as unknown as Record<string, unknown>)[key]?.toString() ?? ""
    })
    setForm(f)
    setError("")
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    const payload: Record<string, unknown> = { user_id: userId, measured_at: form.measured_at, notes: form.notes || null }
    MEASUREMENT_FIELDS.forEach(({ key }) => { payload[key] = form[key] ? Number(form[key]) : null })

    const res = editingMeasurement
      ? await fetch(`/api/nutrition/body-measurements/${editingMeasurement.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/nutrition/body-measurements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })

    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Error al guardar"); setSaving(false); return }
    const updated = await fetch(`/api/nutrition/body-measurements?userId=${userId}`).then((r) => r.json())
    setMeasurements(updated)
    setShowForm(false)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta medición?")) return
    await fetch(`/api/nutrition/body-measurements/${id}`, { method: "DELETE" })
    setMeasurements((prev) => prev.filter((m) => m.id !== id))
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login") }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
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

      <main className="flex-1 px-6 md:px-12 py-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Link href="/nutricion" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 mb-2">
              ← Clientes
            </Link>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-tight text-slate-900">
              {profile?.first_name} <span className="text-primary">{profile?.last_name}</span>
            </h1>
            <p className="mt-1 font-body text-sm text-slate-500">{profile?.email}{profile?.phone ? ` · ${profile.phone}` : ""}</p>
          </div>
          <Link
            href={`/nutricion/clientes/${userId}/plan/${currentMonth}`}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors shadow-sm"
          >
            Ver plan {currentMonth}
          </Link>
        </header>

        {/* Latest metrics summary */}
        {measurements.length > 0 && (
          <section>
            <h2 className="font-bebas text-2xl tracking-wide text-slate-800 mb-4">ÚLTIMA MEDICIÓN</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {MEASUREMENT_FIELDS.slice(0, 5).map(({ key, label, unit }, i) => {
                const val = (measurements[0] as unknown as Record<string, unknown>)[key]
                return (
                  <div key={key} className={`rounded-xl border p-4 text-center ${SUMMARY_COLORS[i]}`}>
                    <div className="font-bebas text-2xl text-slate-900">{val != null ? `${val}${unit}` : "—"}</div>
                    <div className="font-label text-[9px] uppercase tracking-[0.15em] text-slate-500 mt-0.5">{label}</div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Measurements table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas text-2xl tracking-wide text-slate-800">HISTORIAL DE MEDICIONES</h2>
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-xl bg-primary text-white font-label text-[10px] uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors shadow-sm"
            >
              + Agregar
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-slate-400">Fecha</th>
                    {MEASUREMENT_FIELDS.map(({ label }) => (
                      <th key={label} className="px-4 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">{label}</th>
                    ))}
                    <th className="px-4 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-slate-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {measurements.length === 0 ? (
                    <tr>
                      <td colSpan={MEASUREMENT_FIELDS.length + 2} className="px-4 py-10 text-center text-slate-400">Sin mediciones registradas.</td>
                    </tr>
                  ) : (
                    measurements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-900 font-medium whitespace-nowrap">
                          {new Date(m.measured_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        {MEASUREMENT_FIELDS.map(({ key, unit }) => (
                          <td key={key} className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {(m as unknown as Record<string, unknown>)[key] != null ? `${(m as unknown as Record<string, unknown>)[key]}${unit}` : "—"}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button onClick={() => openEdit(m)} className="font-label text-[9px] uppercase tracking-[0.1em] text-slate-400 hover:text-slate-700 transition-colors">Editar</button>
                            <button onClick={() => handleDelete(m.id)} className="font-label text-[9px] uppercase tracking-[0.1em] text-red-400 hover:text-red-600 transition-colors">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-5 text-center bg-white">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400">© 2026 ON3 P3RCENT · NUTRICIÓN</span>
      </footer>

      {/* Measurement modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide text-slate-900">{editingMeasurement ? "EDITAR MEDICIÓN" : "NUEVA MEDICIÓN"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-body">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Fecha *</label>
                <input type="date" value={form.measured_at} onChange={(e) => setForm((f) => ({ ...f, measured_at: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 transition-colors" />
              </div>
              {MEASUREMENT_FIELDS.map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">{label}{unit ? ` (${unit})` : ""}</label>
                  <input type="number" step="0.01" value={form[key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 block mb-1.5">Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-body text-slate-900 focus:outline-none focus:border-primary/60 transition-colors resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 font-label text-xs uppercase tracking-[0.15em] text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary text-white font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
                {saving ? "Guardando..." : editingMeasurement ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
