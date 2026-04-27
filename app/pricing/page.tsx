'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePromo } from '@/app/hooks/usePromo'
import { CountdownTimer } from '@/app/components/CountdownTime'
import Link from 'next/link'
import { getActiveStripePriceId } from '@/app/lib/connection'
import { useAuthStore } from '@/app/store/useAuthStore'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import BottomNav from '@/components/BottomNav'

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachId = searchParams.get("coach")
  const { user, loading: authLoading, signOut } = useAuthStore();
  const [prices, setPrices] = useState<any[]>([]);
  const [activePriceId, setActivePriceId] = useState<string | null>(null);

  const [pricesLoaded, setPricesLoaded] = useState(false);
  // Get user's role
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    fetch('/api/stripe')
      .then(res => res.json())
      .then(data => {
        if (data.prices) setPrices(data.prices);
        return getActiveStripePriceId();
      })
      .then(id => {
        setActivePriceId(id);
        setPricesLoaded(true);
      })
      .catch(err => {
        console.error(err);
        setPricesLoaded(true); // Stop loading even on error to show fallback
      });
  }, []);

  // Extract the active price and convert from cents to dollars/pesos
  // Default to 0 if no price is active or found
  const activePrice = prices.find(p => p.id === activePriceId) || prices[0];
  const stripePriceAmount = activePrice && activePrice.unit_amount
    ? activePrice.unit_amount / 100
    : 0;

  const { promo, loading: promoLoading, expired, handleExpired } = usePromo()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const navRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from(navRef.current, { y: -30, opacity: 0, duration: 0.4 })
      .from(heroRef.current, { y: 40, opacity: 0, duration: 0.7 }, '-=0.1')
      .from(cardRef.current, { y: 60, opacity: 0, scale: 0.95, duration: 0.8, ease: 'back.out(1.1)' }, '-=0.3')
  })

  if (promoLoading || authLoading) {
    return (
      <div className="min-h-screen noise-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="font-label text-xs tracking-[0.2em] text-muted-foreground/40">
            CARGANDO...
          </p>
        </div>
      </div>
    )
  }

  const hasPromo = !!promo

  const handleCheckout = async (priceId: string) => {
    try {
      setIsCheckingOut(true);

      if (!user) {
        let currentUrl = window.location.pathname;
        if (hasPromo) {
          currentUrl += `?promo=${promo.code}`;
        }
        router.push(`/signup?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          couponId: hasPromo ? promo.code : undefined,
          userId: user?.id,
          coachId: coachId ?? undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned", data);
        setCheckoutError(data.error || "Error al iniciar el pago. Intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setCheckoutError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav ref={navRef} className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-bebas text-xl tracking-wide text-foreground">
            APEX COACHING
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Nav links — solo desktop */}
          {user && (
            <Link
              href="/mis-cargas"
              className="hidden md:inline font-label text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Mis Cargas
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="font-label text-xs uppercase tracking-[0.15em] text-primary hover:text-primary/80 transition-colors"
            >
              Dashboard
            </Link>
          )}
          {!authLoading && (
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

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-12">
        {/* Hero */}
        <section ref={heroRef} className="text-center mb-10">
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-primary mb-6">
            fitness coaching platform
          </p>
          <h1 className="font-bebas text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-tight">
            TRANSFORMA TU
            <br />
            <span className="text-shimmer">CUERPO Y MENTE</span>
          </h1>
          <p className='mt-6 font-bebas text-foreground/50 max-w-lg mx-auto text-sm md:text-base leading-relaxed"'>Únete al 1% que decide cambiar su vida hoy.</p>
        </section>

        {/* Timer (solo si hay promo activa) */}
        {hasPromo && (
          <section className="w-full max-w-md mx-auto">
            <CountdownTimer
              secondsRemaining={promo.seconds_remaining}
              onExpired={handleExpired}
            />
          </section>
        )}

        {/* Mensaje de expiración */}
        {expired && (
          <div className="mb-8 px-6 py-3 rounded-xl bg-red-500/5 border border-red-500/15 max-w-md mx-auto fade-up">
            <p className="font-label text-xs text-red-400/80 tracking-wide text-center">
              La oferta ha expirado. Este es el precio regular.
            </p>
          </div>
        )}

        {/* Pricing Card */}
        <section ref={cardRef} className="w-full max-w-md mx-auto">
          <div className="glass-card rounded-2xl p-8 md:p-10 border border-border/20 relative overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_40px_-10px_hsl(72_100%_64%/0.25)]">
            {/* Corner glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-[40px]" />

            {/* Discount badge (solo promo) */}
            {hasPromo && (
              <div className="inline-block bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <span className="font-label text-[10px] uppercase tracking-[0.15em] text-primary">
                  🔥 {promo.discount_percent}% descuento
                </span>
              </div>
            )}

            {/* Plan name */}
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">
              {activePrice?.product?.name ? activePrice.product.name.toUpperCase() : 'ELITE COACHING'}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-bebas text-6xl md:text-7xl text-foreground">
                {!pricesLoaded ? (
                  <span className="animate-pulse text-foreground/50">...</span>
                ) : (
                  `$${hasPromo ? Math.round(stripePriceAmount * (1 - promo.discount_percent / 100)) : stripePriceAmount}`
                )}
              </span>
              <span className="font-body text-white">
                {activePrice?.type === 'recurring' ? '/ mes' : '/ único pago'}
              </span>
            </div>

            {/* Original price (solo promo) */}
            {hasPromo && (
              <p className="font-body text-sm text-muted-foreground/40 mb-6">
                Precio regular{' '}
                <span className="line-through text-muted-foreground/60">
                  ${stripePriceAmount}
                </span>
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent my-6" />

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                { icon: '🏋️', text: 'Plan de entrenamiento semanal' },
                { icon: '📊', text: 'Seguimiento de progreso con métricas reales' },
                { icon: '💬', text: 'Chat directo con tu coach vía WhatsApp' },
                { icon: '📸', text: 'Revisión de evidencia (fotos/videos) por sesión' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                    {icon}
                  </div>
                  <span className="font-body text-sm text-foreground/70">{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => handleCheckout(activePrice?.id)}
              disabled={isCheckingOut || !activePrice}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              {isCheckingOut ? 'PROCESANDO...' : hasPromo ? 'OBTENER OFERTA AHORA' : 'COMENZAR AHORA'}
            </button>

            {checkoutError && (
              <p className="text-center font-body text-xs text-red-400/80 mt-3">
                {checkoutError}
              </p>
            )}
            <p className="text-center font-body text-xs text-muted-foreground/30 mt-4">
              Cancela cuando quieras · Sin compromisos
            </p>
          </div>
        </section>
      </main>

      <BottomNav activeTab="home" />

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 pb-24 md:pb-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          © 2026 APEX COACHING
        </span>
      </footer>
    </div>
  )
}

// Suspense boundary necesario porque useSearchParams() lo requiere
export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen noise-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}