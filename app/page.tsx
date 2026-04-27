"use client"
import Link from "next/link";
import { useRef } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function Home() {
  const { user, loading, signOut } = useAuthStore();

  const navRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(navRef.current, { y: -40, opacity: 0, duration: 0.5 })
      .from(labelRef.current, { y: 20, opacity: 0, duration: 0.6 }, "-=0.2")
      .from(titleRef.current, { y: 60, opacity: 0, duration: 0.9, scale: 0.97 }, "-=0.3")
      .from(bodyRef.current, { y: 20, opacity: 0, duration: 0.7 }, "-=0.4")
      .from(buttonsRef.current, { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
      .from(footerRef.current, { opacity: 0, duration: 0.5 }, "-=0.2");
  });

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav ref={navRef} className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <span className="font-bebas text-xl tracking-wide text-foreground">APEX COACHING</span>
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <button
                onClick={signOut}
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
        <section className="text-center mt-10 md:mt-20">
          <p ref={labelRef} className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-6">
            Bienvenido al inicio
          </p>
          <h1 ref={titleRef} className="font-bebas text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] tracking-tight">
            APEX <span className="text-shimmer">COACHING</span>
          </h1>
          <p ref={bodyRef} className="mt-8 font-body text-foreground/50 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Forma parte de la élite. Únete al programa, transforma tu mente y cuerpo con el mejor coaching.
          </p>

          <div ref={buttonsRef} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
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
      <footer ref={footerRef} className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          © 2026 APEX COACHING
        </span>
      </footer>
    </div>
  );
}
