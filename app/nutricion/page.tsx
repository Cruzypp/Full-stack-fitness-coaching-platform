"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../lib/connection"
import type { NutritionClient } from "../types/nutrition"

export default function NutricionPage() {
  const router = useRouter()
  const [clients, setClients] = useState<NutritionClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/nutrition/clients")
      .then((r) => r.json())
      .then((data) => { setClients(data); setLoading(false) })
      .catch(() => { setError("Error al cargar clientes"); setLoading(false) })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

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
          <Link href="/admin/dashboard" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-300 hover:text-slate-500 transition-colors border border-slate-200 rounded-lg px-2 py-1">
            ← Admin
          </Link>
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
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                      Cargando clientes...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-slate-400">No hay clientes registrados.</td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{client.first_name} {client.last_name}</td>
                      <td className="px-6 py-4 text-slate-500">{client.email}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {client.latest_measurement?.weight_kg != null ? `${client.latest_measurement.weight_kg} kg` : "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {client.latest_measurement?.fat_percentage != null ? `${client.latest_measurement.fat_percentage}%` : "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {client.latest_measurement?.measured_at
                          ? new Date(client.latest_measurement.measured_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
                          : "Sin mediciones"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/nutricion/clientes/${client.id}`} className="font-label text-[10px] uppercase tracking-[0.15em] text-primary hover:text-primary/70 transition-colors">
                            Ver perfil
                          </Link>
                          <Link href={`/nutricion/clientes/${client.id}/plan/${new Date().toISOString().slice(0, 7)}`} className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-slate-700 transition-colors">
                            Plan actual
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-5 text-center bg-white">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400">© 2026 ON3 P3RCENT · NUTRICIÓN</span>
      </footer>
    </div>
  )
}
