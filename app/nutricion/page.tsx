"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../lib/connection"
import type { NutritionClient, Nutriologo } from "../types/nutrition"

export default function NutricionPage() {
  const router = useRouter()
  const [clients, setClients] = useState<NutritionClient[]>([])
  const [nutriologos, setNutriólogos] = useState<Nutriologo[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [assigning, setAssigning] = useState<string | null>(null) // clientId being assigned

  useEffect(() => {
    // Determine role
    supabase.auth.getUser().then(({ data: { user } }) => {
      const role = user?.user_metadata?.role?.toLowerCase()
      const admin = role === "admin"
      setIsAdmin(admin)

      const fetchClients = fetch("/api/nutrition/clients")
        .then(r => r.json())
        .then(data => setClients(Array.isArray(data) ? data : []))

      const fetchTeam = admin
        ? fetch("/api/nutrition/team").then(r => r.json()).then(data => setNutriólogos(Array.isArray(data) ? data : []))
        : Promise.resolve()

      Promise.all([fetchClients, fetchTeam])
        .catch(() => setError("Error al cargar datos"))
        .finally(() => setLoading(false))
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleToggleReminders = async (clientId: string, current: boolean) => {
    const newVal = !current
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, nutrition_reminders_enabled: newVal } : c))
    const res = await fetch("/api/nutrition/clients/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: clientId, enabled: newVal }),
    })
    if (!res.ok) setClients(prev => prev.map(c => c.id === clientId ? { ...c, nutrition_reminders_enabled: current } : c))
  }

  const handleAssign = async (clientId: string, nutriologoId: string | null) => {
    setAssigning(clientId)
    // Optimistic update
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, nutriologo_id: nutriologoId } : c))
    const res = await fetch(`/api/nutrition/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nutriologo_id: nutriologoId }),
    })
    if (!res.ok) {
      // Revert on failure
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, nutriologo_id: c.nutriologo_id } : c))
    }
    setAssigning(null)
  }

  const colSpan = isAdmin ? 8 : 7

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href="/nutricion" className="font-bebas text-xl tracking-wide text-slate-900 hover:text-primary transition-colors">
            NUTRICIÓN
          </Link>
          <span className="text-slate-300 hidden md:block">|</span>
          <Link href="/nutricion" className="font-label text-[10px] uppercase tracking-[0.15em] text-primary">
            Clientes
          </Link>
          <Link href="/nutricion/recetas" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">
            Recetas
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="flex-1 px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="font-bebas text-4xl md:text-5xl tracking-tight text-slate-900">
            CLIENTES <span className="text-primary">NUTRICIÓN</span>
          </h1>
          <p className="mt-2 font-body text-slate-500 text-sm">
            Gestiona planes alimenticios, mediciones y seguimiento de cada cliente.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body">{error}</div>
        )}

        {/* No nutritionists warning (admin only) */}
        {isAdmin && !loading && nutriologos.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-body">
            Sin nutriólogos en el equipo. Genera un código de invitación en{" "}
            <Link href="/admin/equipo" className="underline font-medium">Admin → Equipo</Link>.
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-body">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">Nombre</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">Email</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">Último Peso</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">% Grasa</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">Última Medición</th>
                  {isAdmin && (
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">Nutriólogo</th>
                  )}
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">Recordatorios</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={colSpan} className="px-6 py-14 text-center text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                      Cargando clientes...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={colSpan} className="px-6 py-14 text-center text-slate-400">
                      No hay clientes con nutrición activa.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => {
                    const eliminated = client.lives_lost >= 3
                    const assignedNut = nutriologos.find(n => n.id === client.nutriologo_id)
                    return (
                      <tr
                        key={client.id}
                        className={`transition-colors ${eliminated ? "bg-red-50/60" : "hover:bg-slate-50"}`}
                      >
                        {/* Nombre */}
                        <td className="px-6 py-4 font-medium">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={eliminated ? "text-red-400 line-through decoration-red-300" : "text-slate-900"}>
                              {client.first_name} {client.last_name}
                            </span>
                            {eliminated && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 border border-red-200 font-label text-[8px] uppercase tracking-[0.12em] text-red-500">
                                ✕ Eliminado del reto
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Email */}
                        <td className={`px-6 py-4 ${eliminated ? "text-red-300" : "text-slate-500"}`}>{client.email}</td>

                        {/* Peso */}
                        <td className={`px-6 py-4 ${eliminated ? "text-red-300" : "text-slate-700"}`}>
                          {client.latest_measurement?.weight_kg != null ? `${client.latest_measurement.weight_kg} kg` : "—"}
                        </td>

                        {/* % Grasa */}
                        <td className={`px-6 py-4 ${eliminated ? "text-red-300" : "text-slate-700"}`}>
                          {client.latest_measurement?.fat_percentage != null ? `${client.latest_measurement.fat_percentage}%` : "—"}
                        </td>

                        {/* Medición */}
                        <td className={`px-6 py-4 ${eliminated ? "text-red-300" : "text-slate-500"}`}>
                          {client.latest_measurement?.measured_at
                            ? new Date(client.latest_measurement.measured_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
                            : "Sin mediciones"}
                        </td>

                        {/* Nutriólogo dropdown — solo admin */}
                        {isAdmin && (
                          <td className="px-6 py-4">
                            {eliminated ? (
                              <span className="text-slate-300 font-label text-[9px]">—</span>
                            ) : (
                              <select
                                value={client.nutriologo_id ?? ""}
                                disabled={assigning === client.id || nutriologos.length === 0}
                                onChange={e => handleAssign(client.id, e.target.value || null)}
                                className="text-xs font-body border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-wait min-w-[140px]"
                              >
                                <option value="">Sin asignar</option>
                                {nutriologos.map(n => (
                                  <option key={n.id} value={n.id}>
                                    {n.first_name} {n.last_name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        )}

                        {/* Recordatorios */}
                        <td className="px-6 py-4">
                          {eliminated ? (
                            <span className="font-label text-[9px] uppercase tracking-[0.12em] text-slate-300">—</span>
                          ) : (
                            <button
                              onClick={() => handleToggleReminders(client.id, client.nutrition_reminders_enabled)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-[9px] uppercase tracking-[0.12em] border transition-colors ${
                                client.nutrition_reminders_enabled
                                  ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                  : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${client.nutrition_reminders_enabled ? "bg-amber-500" : "bg-slate-300"}`} />
                              {client.nutrition_reminders_enabled ? "Activos" : "Pausados"}
                            </button>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4">
                          {eliminated ? (
                            <span className="font-label text-[10px] uppercase tracking-[0.15em] text-red-300 cursor-not-allowed select-none">
                              Reto perdido
                            </span>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Link href={`/nutricion/clientes/${client.id}`} className="font-label text-[10px] uppercase tracking-[0.15em] text-primary hover:text-primary/70 transition-colors">
                                Ver perfil
                              </Link>
                              <Link href={`/nutricion/clientes/${client.id}/plan/${new Date().toISOString().slice(0, 7)}`} className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors">
                                Plan actual
                              </Link>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-5 text-center bg-white">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400">© 2026 APEX COACHING · NUTRICIÓN</span>
      </footer>
    </div>
  )
}
