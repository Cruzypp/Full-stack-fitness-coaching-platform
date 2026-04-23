import type { ReactNode } from "react"

export default function NutricionLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{
        // Override primary to dark green scoped to /nutricion/*
        // Tailwind consumes via hsl(var(--primary))
        "--primary": "142 65% 42%",           // #1fb159 — lighter vivid green
        "--primary-foreground": "0 0% 100%",  // white text on green
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
