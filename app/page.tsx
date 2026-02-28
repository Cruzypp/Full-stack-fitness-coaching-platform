"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/connection";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Revisar la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios en la autenticación (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <span className="font-bebas text-xl tracking-wide text-foreground">THE ON3 PERC3NT</span>
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <button
                onClick={handleLogout}
                className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Cerrar Sesión
              </button>
            ) : (
              <Link
                href="/login"
                className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Iniciar Sesión
              </Link>
            )
          )}
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <section className="text-center fade-up mt-10 md:mt-20">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-6">
            Bienvenido al inicio
          </p>
          <h1 className="font-bebas text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] tracking-tight">
            THE <span className="text-shimmer">ON3</span> PERC3NT
          </h1>
          <p className="mt-8 font-body text-foreground/50 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Forma parte de la élite. Únete al programa, transforma tu mente y cuerpo con el mejor coaching.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)] active:translate-y-0 text-center"
              style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            >
              VER PLANES
            </Link>

            {user && user.user_metadata?.role === 'admin' && (
              <Link
                href="/admin/promos"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:bg-secondary hover:border-border text-center"
              >
                Panel Admin
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          © 2026 ON3 PERC3NT
        </span>
      </footer>
    </div>
  );
}
