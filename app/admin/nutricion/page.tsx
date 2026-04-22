"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../lib/connection"
import type { NutritionClient } from "../../types/nutrition"

export default function NutricionPage() {
  const router = useRouter()
  const [clients, setClients] = useState<NutritionClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/nutrition/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Error al cargar clientes")
        setLoading(false)
      })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-5 border-b border-border/10 gap-4 md:gap-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-bebas text-xl md:text-2xl tracking-wide text-foreground">THE ON3 P3RCENT</span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link href="/admin/dashboard" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          <Link href="/admin/promos" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Promociones</Link>
          <Link href="/admin/vidas" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Vidas</Link>
          <span className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-primary">Nutrición</span>
          <Link href="/admin/nutricion/recetas" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Recetas</Link>
          <button onClick={handleLogout} className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
        <header className="mb-10 fade-up">
          <h1 className="font-bebas text-4xl md:text-5xl tracking-tight">
            CLIENTES <span className="text-shimmer">NUTRICIÓN</span>
          </h1>
          <p className="mt-2 font-body text-muted-foreground">
            Gestiona planes alimenticios, mediciones y seguimiento de cada cliente.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body">
            {error}
          </div>
        )}

        <section className="w-full fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-2xl border border-border/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-border/20 bg-secondary/10">
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Nombre</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Email</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Último Peso</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">% Grasa</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Última Medición</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground/50">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                        Cargando clientes...
                      </td>
                    </tr>
                  ) : clients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground/50">
                        No hay clientes registrados aún.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {client.first_name} {client.last_name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{client.email}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {client.latest_measurement?.weight_kg != null
                            ? `${client.latest_measurement.weight_kg} kg`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {client.latest_measurement?.fat_percentage != null
                            ? `${client.latest_measurement.fat_percentage}%`
                            : "—"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {client.latest_measurement?.measured_at
                            ? new Date(client.latest_measurement.measured_at).toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Sin mediciones"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/admin/nutricion/clientes/${client.id}`}
                              className="font-label text-[10px] uppercase tracking-[0.15em] text-primary hover:text-primary/70 transition-colors"
                            >
                              Ver perfil
                            </Link>
                            <Link
                              href={`/admin/nutricion/clientes/${client.id}/plan/${new Date().toISOString().slice(0, 7)}`}
                              className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
                            >
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
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          © 2026 ON3 P3RCENT
        </span>
      </footer>
    </div>
  )
}
