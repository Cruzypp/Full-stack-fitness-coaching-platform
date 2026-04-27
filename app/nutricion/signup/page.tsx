"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "../../lib/connection"
import { Eye, EyeOff, CheckCircle, XCircle, Loader } from "lucide-react"

function NutricionSignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code") ?? ""

  const [codeStatus, setCodeStatus] = useState<"checking" | "valid" | "invalid">("checking")
  const [codeError, setCodeError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/nutricion")
    })
  }, [router])

  // Validate invite code
  useEffect(() => {
    if (!code) {
      setCodeStatus("invalid")
      setCodeError("No se proporcionó un código de invitación.")
      return
    }
    fetch(`/api/invite-codes/${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) {
          setCodeStatus("valid")
        } else {
          setCodeStatus("invalid")
          setCodeError(d.error || "Código inválido.")
        }
      })
      .catch(() => {
        setCodeStatus("invalid")
        setCodeError("Error al verificar el código.")
      })
  }, [code])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...formData, [e.target.name]: e.target.value }
    setFormData(updated)
    // Live password match check once confirmPassword has been touched
    if (e.target.name === "confirmPassword" || e.target.name === "password") {
      const pw = e.target.name === "password" ? e.target.value : updated.password
      const cpw = e.target.name === "confirmPassword" ? e.target.value : updated.confirmPassword
      setPasswordMismatch(cpw.length > 0 && pw !== cpw)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.")
      return
    }

    setLoading(true)

    // 1. Create user server-side (validates code + marks used atomically)
    const res = await fetch("/api/nutricion/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Error al crear la cuenta")
      setLoading(false)
      return
    }

    // 2. Sign in with the new credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (signInError) {
      setError("Cuenta creada. Inicia sesión manualmente.")
      setLoading(false)
      router.push("/login")
      return
    }

    router.push("/nutricion")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col"
      style={{
        "--primary": "142 65% 42%",
        "--primary-foreground": "0 0% 100%",
      } as React.CSSProperties}
    >
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="font-bebas text-xl tracking-wide text-slate-900 hover:text-primary transition-colors">
          APEX COACHING
        </Link>
        <Link href="/login" className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 transition-colors">
          Iniciar Sesión
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-tight text-slate-900">
            REGISTRO <span className="text-primary">NUTRIÓLOGO</span>
          </h1>
          <p className="mt-3 font-body text-slate-500 text-sm max-w-sm mx-auto">
            Acceso exclusivo para el equipo de nutrición.
          </p>
        </div>

        {/* Code status */}
        <div className="w-full max-w-md mb-6">
          {codeStatus === "checking" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200">
              <Loader size={14} className="animate-spin text-slate-400" />
              <span className="font-body text-sm text-slate-500">Verificando código de invitación...</span>
            </div>
          )}
          {codeStatus === "valid" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle size={14} className="text-emerald-500" />
              <span className="font-body text-sm text-emerald-700">Código válido — completa tu registro</span>
            </div>
          )}
          {codeStatus === "invalid" && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
              <XCircle size={14} className="text-red-500" />
              <span className="font-body text-sm text-red-700">{codeError || "Código inválido"}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-body text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-[0.15em] text-slate-400 ml-1">
                Nombre Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={codeStatus !== "valid"}
                placeholder="Nombre Apellido"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-slate-900 placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-[0.15em] text-slate-400 ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={codeStatus !== "valid"}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-slate-900 placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-[0.15em] text-slate-400 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={codeStatus !== "valid"}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-slate-900 placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-[0.15em] text-slate-400 ml-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={codeStatus !== "valid"}
                  placeholder="Repite tu contraseña"
                  className={`w-full px-4 py-3 pr-11 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-body text-slate-900 placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    passwordMismatch
                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                      : formData.confirmPassword && !passwordMismatch
                        ? "border-emerald-300 focus:ring-emerald-200 focus:border-emerald-400"
                        : "border-slate-200 focus:ring-primary/20 focus:border-primary/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="font-body text-xs text-red-500 ml-1">Las contraseñas no coinciden</p>
              )}
              {formData.confirmPassword && !passwordMismatch && (
                <p className="font-body text-xs text-emerald-600 ml-1">Contraseñas coinciden</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || codeStatus !== "valid" || passwordMismatch}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={14} className="animate-spin" />
                  Creando cuenta...
                </span>
              ) : "Crear Cuenta"}
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-5 text-center bg-white">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-slate-400">
          © 2026 APEX COACHING · NUTRICIÓN
        </span>
      </footer>
    </div>
  )
}

export default function NutricionSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <NutricionSignupContent />
    </Suspense>
  )
}
