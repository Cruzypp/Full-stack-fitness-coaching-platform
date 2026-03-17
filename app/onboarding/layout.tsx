"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "../store/useAuthStore"
import { Toaster } from "@/components/ui/sonner"

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/onboarding&message=Inicia%20sesión%20para%20continuar")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen noise-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen noise-bg relative flex flex-col px-5 py-8">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      {children}
      <Toaster position="top-center" richColors />
    </div>
  )
}

export default OnboardingLayout
