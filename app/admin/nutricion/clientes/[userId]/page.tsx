"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../../../lib/connection"
import type { BodyMeasurement } from "../../../../types/nutrition"

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

const EMPTY_FORM: Partial<Record<string, string>> & { measured_at: string; notes: string } = {
  measured_at: new Date().toISOString().slice(0, 10),
  notes: "",
  weight_kg: "",
  fat_percentage: "",
  muscle_mass_kg: "",
  water_percentage: "",
  visceral_fat: "",
  bone_mass_kg: "",
  imc: "",
  waist_cm: "",
  hip_cm: "",
  arm_cm: "",
}

type Profile = { id: string; first_name: string; last_name: string; email: string; phone?: string; payment_date?: string }

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

    const payload: Record<string, unknown> = {
      user_id: userId,
      measured_at: form.measured_at,
      notes: form.notes || null,
    }
    MEASUREMENT_FIELDS.forEach(({ key }) => {
      payload[key] = form[key] ? Number(form[key]) : null
    })

    let res: Response
    if (editingMeasurement) {
      res = await fetch(`/api/nutrition/body-measurements/${editingMeasurement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      res = await fetch("/api/nutrition/body-measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Error al guardar")
      setSaving(false)
      return
    }

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
          <Link href="/admin/nutricion/recetas" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Recetas</Link>
          <button onClick={handleLogout} className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col px-6 md:px-12 py-10 max-w-7xl mx-auto w-full gap-8">
        {/* Header */}
        <header className="fade-up flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Link href="/admin/nutricion" className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-2">
              ← Clientes
            </Link>
            <h1 className="font-bebas text-4xl md:text-5xl tracking-tight">
              {profile?.first_name} <span className="text-shimmer">{profile?.last_name}</span>
            </h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">{profile?.email} {profile?.phone ? `· ${profile.phone}` : ""}</p>
          </div>
          <Link
            href={`/admin/nutricion/clientes/${userId}/plan/${currentMonth}`}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors"
          >
            Ver plan {currentMonth}
          </Link>
        </header>

        {/* Latest metrics summary */}
        {measurements.length > 0 && (
          <section className="fade-up" style={{ animationDelay: "0.05s" }}>
            <h2 className="font-bebas text-2xl tracking-wide mb-4">ÚLTIMA MEDICIÓN</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {MEASUREMENT_FIELDS.slice(0, 5).map(({ key, label, unit }) => {
                const val = (measurements[0] as unknown as Record<string, unknown>)[key]
                return (
                  <div key={key} className="glass-card rounded-xl border border-border/20 p-4 text-center">
                    <div className="font-bebas text-2xl text-foreground">
                      {val != null ? `${val}${unit}` : "—"}
                    </div>
                    <div className="font-label text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60 mt-0.5">{label}</div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Measurements table */}
        <section className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas text-2xl tracking-wide">HISTORIAL DE MEDICIONES</h2>
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-label text-[10px] uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors"
            >
              + Agregar
            </button>
          </div>

          <div className="glass-card rounded-2xl border border-border/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-xs">
                <thead>
                  <tr className="border-b border-border/20 bg-secondary/10">
                    <th className="px-4 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">Fecha</th>
                    {MEASUREMENT_FIELDS.map(({ label }) => (
                      <th key={label} className="px-4 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">{label}</th>
                    ))}
                    <th className="px-4 py-3 font-label text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {measurements.length === 0 ? (
                    <tr>
                      <td colSpan={MEASUREMENT_FIELDS.length + 2} className="px-4 py-10 text-center text-muted-foreground/50">
                        Sin mediciones registradas.
                      </td>
                    </tr>
                  ) : (
                    measurements.map((m) => (
                      <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">
                          {new Date(m.measured_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        {MEASUREMENT_FIELDS.map(({ key, unit }) => (
                          <td key={key} className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {(m as unknown as Record<string, unknown>)[key] != null ? `${(m as unknown as Record<string, unknown>)[key]}${unit}` : "—"}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button onClick={() => openEdit(m)} className="font-label text-[9px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors">Editar</button>
                            <button onClick={() => handleDelete(m.id)} className="font-label text-[9px] uppercase tracking-[0.1em] text-destructive/60 hover:text-destructive transition-colors">Eliminar</button>
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

      <footer className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">© 2026 ON3 P3RCENT</span>
      </footer>

      {/* Measurement modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0a] border border-border/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-2xl tracking-wide">
                {editingMeasurement ? "EDITAR MEDICIÓN" : "NUEVA MEDICIÓN"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-body">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Fecha *</label>
                <input
                  type="date"
                  value={form.measured_at}
                  onChange={(e) => setForm((f) => ({ ...f, measured_at: e.target.value }))}
                  className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              {MEASUREMENT_FIELDS.map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">
                    {label}{unit ? ` (${unit})` : ""}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form[key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              ))}

              <div className="col-span-2">
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full bg-secondary/10 border border-border/20 rounded-xl px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-border/20 font-label text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-label text-xs uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando..." : editingMeasurement ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
