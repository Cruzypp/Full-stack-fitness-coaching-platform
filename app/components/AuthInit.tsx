"use client"
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/connection'
import { useAuthStore } from '../store/useAuthStore'

export function AuthInit() {
  const router = useRouter()
  const hadUser = useRef(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null

      if (event === 'INITIAL_SESSION') {
        if (u) hadUser.current = true
        useAuthStore.setState({ user: u, loading: false })
        return
      }

      if (event === 'SIGNED_OUT') {
        const wasLoggedIn = hadUser.current
        hadUser.current = false
        useAuthStore.setState({ user: null })
        if (wasLoggedIn) router.push('/login')
        return
      }

      if (u) hadUser.current = true
      useAuthStore.setState({ user: u })
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
