'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/connection'


export type Promo = {
  id: string
  code: string
  title: string
  original_price: number
  promo_price: number
  discount_percent: number
  starts_at: string
  duration_hours: number
  expires_at: string
  seconds_remaining: number
  is_valid: boolean
}

export function usePromo() {
  const searchParams = useSearchParams()
  const [promo, setPromo] = useState<Promo | null>(null)
  const [loading, setLoading] = useState(true)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    async function loadPromo() {
      const code = searchParams.get('promo')?.toLowerCase();

      if (!code) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .rpc('get_active_promo', { promo_code: code })

      if (error || !data || data.length === 0) {
        setLoading(false)
        return
      }

      const promoData = data[0]

      if (promoData.is_valid && promoData.seconds_remaining > 0) {
        setPromo(promoData)
      }

      setLoading(false)
    }

    loadPromo()
  }, [searchParams])

  const handleExpired = () => {
    setPromo(null)
    setExpired(true)
    // Limpia el ?promo= de la URL sin recargar
    window.history.replaceState({}, '', window.location.pathname)
  }

  return { promo, loading, expired, handleExpired }
}