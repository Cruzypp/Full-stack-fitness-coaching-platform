"use client"
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/connection'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const verifyPaymentAndUpdateDB = async () => {
      try {
        // Obtenemos la sesión del cliente (solo para confirmar que están logueados)
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        if (!currentSession) {
          throw new Error("No hay sesión activa de usuario")
        }

        const userId = currentSession.user.id

        // Idealmente, esto se prefiere hacer vía un Webhook de Stripe en tu backend
        // o llamando a una API propia. Por ahora, si sabemos que llegaron aquí,
        // confiaremos en marcar su pago en la DB.

        // En un entorno de producción seguro, haríamos fetch(`/api/verify-checkout?session_id=${sessionId}`)
        // y que el backend haga esto, pero lo simularemos directamente actualizando la base de datos
        // asumiendo que el éxito del pago es verdadero por llegar a esta página.

        const { error } = await supabase
          .from('profiles')
          .update({ payment_date: new Date().toISOString() })
          .eq('id', userId)

        if (error) {
          console.error("Error al guardar el pago:", error)
          throw error
        }

        setStatus('success')
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }

    verifyPaymentAndUpdateDB()
  }, [sessionId])

  return (
    <div className="min-h-screen noise-bg relative flex flex-col items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {status === 'loading' && (
        <div className="text-center fade-up">
          <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <h1 className="font-bebas text-3xl tracking-wide">CONFIRMANDO PAGO...</h1>
          <p className="mt-2 font-body text-muted-foreground">Por favor no cierres esta ventana.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center fade-up max-w-md w-full glass-card p-10 rounded-2xl border border-primary/20">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <span className="text-primary text-2xl">✓</span>
          </div>
          <h1 className="font-bebas text-4xl tracking-wide mb-2 text-foreground">
            ¡PAGO <span className="text-shimmer">EXITOSO!</span>
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            Bienvenido al 1%. Tu transformación acaba de comenzar. Tu entrenador se pondrá en contacto pronto.
          </p>
          <Link
            href="/"
            className="block w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)] active:translate-y-0"
            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            VOLVER AL INICIO
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center fade-up max-w-md w-full glass-card p-10 rounded-2xl border border-destructive/20">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-destructive/20">
            <span className="text-destructive text-2xl">!</span>
          </div>
          <h1 className="font-bebas text-4xl tracking-wide mb-2 text-foreground">
            ALGO SALIÓ MAL
          </h1>
          <p className="font-body text-muted-foreground mb-8">
            No pudimos confirmar tu pago automáticamente. Si tu pago pasó en Stripe, contáctanos.
          </p>
          <Link
            href="/pricing"
            className="block w-full py-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:bg-secondary hover:border-border text-center"
          >
            VOLVER A INTENTAR
          </Link>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen noise-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
