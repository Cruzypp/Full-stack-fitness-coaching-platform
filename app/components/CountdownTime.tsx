'use client'

import { useState, useEffect } from 'react'

type Props = {
  secondsRemaining: number
  onExpired: () => void
}

export function CountdownTimer({ secondsRemaining, onExpired }: Props) {
  const [timeLeft, setTimeLeft] = useState(secondsRemaining)

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpired()
      return
    }

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          onExpired()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [])

  const d = Math.floor(timeLeft / 86400)
  const h = Math.floor((timeLeft % 86400) / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  const timeUnits = d > 0
    ? [
      { value: d, label: 'DÍAS' },
      { value: h, label: 'HRS' },
      { value: m, label: 'MIN' },
      { value: s, label: 'SEG' },
    ]
    : [
      { value: h, label: 'HRS' },
      { value: m, label: 'MIN' },
      { value: s, label: 'SEG' },
    ]

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-8 border border-primary/15 text-center mb-10 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[200px] h-[80px] bg-primary/10 blur-[50px] rounded-full" />

      <p className="font-label text-xs sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary mb-5 relative">
        ⚡ oferta exclusiva termina en
      </p>

      <div className="flex items-center justify-center gap-1 sm:gap-3 relative">
        {timeUnits.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-1 sm:gap-3">
            {i > 0 && (
              <span className="text-lg sm:text-2xl text-primary/40 font-light -mt-4 sm:-mt-5">:</span>
            )}
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <div className="w-[54px] sm:w-[70px] h-[64px] sm:h-[80px] bg-gradient-to-b from-secondary/80 via-secondary/40 to-secondary/80 border border-border/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-foreground/5" />
                <span className="font-mono text-2xl sm:text-4xl font-bold text-primary tracking-tight">
                  {pad(unit.value)}
                </span>
              </div>
              <span className="font-label text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted-foreground/40">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}