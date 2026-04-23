"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/connection";

export default function AdminVidasPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [livesLost, setLivesLost] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos.");
      setLoading(false);
      return;
    }

    const lives = parseInt(livesLost, 10);
    if (isNaN(lives) || lives < 0) {
      setError("Las vidas perdidas deben ser un número mayor o igual a 0.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin-lives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, lives_lost: lives }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      setSuccess(`Vidas actualizadas correctamente para ${cleanPhone}.`);
      setPhone("");
      setLivesLost("");
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-5 border-b border-border/10 gap-4 md:gap-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-bebas text-xl md:text-2xl tracking-wide text-foreground">THE ON3 P3RCENT</span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link href="/admin/promos" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
            Promociones
          </Link>
          <Link href="/admin/dashboard" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-primary">
            Vidas
          </span>
          <span className="w-px h-4 bg-border/30 hidden md:block" />
          <Link href="/nutricion" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-emerald-400 hover:text-emerald-300 transition-colors">
            Nutrición →
          </Link>
          <button
            onClick={handleLogout}
            className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors ml-2 md:ml-0"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col px-6 md:px-12 py-10 max-w-2xl mx-auto w-full">
        <header className="mb-10 fade-up">
          <h1 className="font-bebas text-4xl md:text-5xl tracking-tight">
            GESTIÓN DE <span className="text-shimmer">VIDAS</span>
          </h1>
          <p className="mt-2 font-body text-muted-foreground">
            Asigna las vidas perdidas de un miembro por su número de teléfono.
          </p>
        </header>

        <section className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-2xl border border-border/20 p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Phone input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phone"
                  className="font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
                >
                  Teléfono del usuario
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 dígitos sin código de país"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-border/30 bg-secondary/20 px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  required
                />
              </div>

              {/* Lives lost input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="lives_lost"
                  className="font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
                >
                  Vidas perdidas
                </label>
                <input
                  id="lives_lost"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={livesLost}
                  onChange={(e) => setLivesLost(e.target.value)}
                  className="w-full rounded-xl border border-border/30 bg-secondary/20 px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  required
                />
              </div>

              {/* Feedback */}
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-body">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 font-label text-xs uppercase tracking-[0.2em] text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  "Aplicar"
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          © 2026 ON3 P3RCENT
        </span>
      </footer>
    </div>
  );
}
