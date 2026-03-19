"use client"
import { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/connection";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

function SignupContent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get("redirect");
  const decodedRedirect = redirectParams ? decodeURIComponent(redirectParams) : null;

  const navRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(navRef.current, { y: -30, opacity: 0, duration: 0.4 })
      .from(headerRef.current, { y: 30, opacity: 0, duration: 0.6 }, "-=0.1")
      .from(cardRef.current, { y: 50, opacity: 0, scale: 0.96, duration: 0.7, ease: "back.out(1.2)" }, "-=0.3");
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.phone.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const metadata: any = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      role: 'student',
    };

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (decodedRedirect) {
      router.push(decodedRedirect);
    } else {
      router.push("/admin/promos");
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav ref={navRef} className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-bebas text-xl tracking-wide text-foreground">THE ON3 P3RCENT</span>
        </Link>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 pb-20">

        {/* Header Text */}
        <section ref={headerRef} className="text-center mb-8">
          <h1 className="font-bebas text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-tight">
            ÚNETE AL <span className="text-shimmer">1%</span>
          </h1>
          <p className="mt-4 font-body text-foreground/50 max-w-sm mx-auto text-sm md:text-base leading-relaxed">
            Regístrate para comenzar tu transformación hoy mismo.
          </p>
        </section>

        {/* Signup Card */}
        <section className="w-full">
          <div ref={cardRef} className="glass-card rounded-2xl p-6 md:p-10 border border-border/20 max-w-md mx-auto focus-within:border-primary/30 hover:border-primary/20 transition-colors duration-500">

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Juan"
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Pérez"
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  title="Debe ingresar exactamente 10 dígitos numéricos"
                  placeholder="5551234567"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)] active:translate-y-0 disabled:opacity-50"
                style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                {loading ? "CREANDO..." : "REGISTRARSE"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="font-body text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href={decodedRedirect ? `/login?redirect=${encodeURIComponent(decodedRedirect)}` : "/login"} className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          © 2026 ON3 P3RCENT
        </span>
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen noise-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
