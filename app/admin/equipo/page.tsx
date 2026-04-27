"use client"
import { useState, useEffect } from "react"
import { Copy, Check, Plus, UserCheck, Clock } from "lucide-react"

type InviteCode = {
  id: string
  code: string
  role: string
  is_used: boolean
  used_by: string | null
  created_at: string
  expires_at: string | null
}

export default function AdminEquipoPage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [newLink, setNewLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { fetchCodes() }, [])

  const fetchCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/invite-codes")
      const data = await res.json()
      setCodes(Array.isArray(data) ? data : [])
    } catch {
      setError("Error al cargar los códigos")
    } finally {
      setLoading(false)
    }
  }

  const generateCode = async () => {
    setGenerating(true)
    setError("")
    setNewLink(null)
    try {
      const res = await fetch("/api/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "nutriologo" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error generando código")
      const link = `${window.location.origin}/nutricion/signup?code=${data.code}`
      setNewLink(link)
      setCopied(false)
      fetchCodes()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!newLink) return
    navigator.clipboard.writeText(newLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="flex-1 px-6 md:px-12 py-10 max-w-4xl mx-auto w-full">
      <header className="mb-8 fade-up">
        <h1 className="font-bebas text-4xl md:text-5xl tracking-tight">
          EQUIPO <span className="text-shimmer">NUTRICIÓN</span>
        </h1>
        <p className="mt-2 font-body text-muted-foreground text-sm">
          Genera códigos de invitación para tus nutriólogos. Cada código es de un solo uso.
        </p>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body">
          {error}
        </div>
      )}

      {/* Generate */}
      <section className="mb-8 fade-up" style={{ animationDelay: "0.05s" }}>
        <button
          onClick={generateCode}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)] active:translate-y-0 disabled:opacity-50"
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          {generating ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          {generating ? "Generando..." : "Nuevo Código"}
        </button>
      </section>

      {/* New link card */}
      {newLink && (
        <section className="mb-8 fade-up">
          <div className="glass-card rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary mb-3">
              Código generado — comparte este link
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={newLink}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl font-body text-xs text-foreground/80 select-all cursor-text truncate focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-label text-xs uppercase tracking-[0.15em] transition-all duration-200 whitespace-nowrap ${
                  copied
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary/40 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Codes table */}
      <section className="fade-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="font-bebas text-2xl tracking-wide mb-4 text-foreground">
          CÓDIGOS <span className="text-muted-foreground/50">GENERADOS</span>
        </h2>
        <div className="glass-card rounded-2xl border border-border/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-border/20 bg-secondary/10">
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Código</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Rol</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Estado</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Creado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground/50">
                      <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                      Cargando...
                    </td>
                  </tr>
                ) : codes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground/50">
                      No hay códigos generados aún.
                    </td>
                  </tr>
                ) : (
                  codes.map((c) => (
                    <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-foreground font-bold tracking-wider">
                        {c.code}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground capitalize">{c.role}</td>
                      <td className="px-6 py-4">
                        {c.is_used ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 text-[9px] uppercase tracking-wider font-label">
                            <UserCheck size={9} />
                            Usado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] uppercase tracking-wider font-label">
                            <Clock size={9} />
                            Disponible
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(c.created_at).toLocaleDateString("es-MX", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
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
  )
}
