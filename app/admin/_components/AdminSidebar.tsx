"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart2, Tag, Heart, Users, Menu, X, LogOut, Zap } from "lucide-react"
import { supabase } from "../../lib/connection"

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/admin/promos", label: "Promociones", icon: Tag },
  { href: "/admin/vidas", label: "Vidas", icon: Heart },
  { href: "/admin/equipo", label: "Equipo", icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-secondary/30 border border-border/20 text-foreground"
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-60 flex flex-col
          bg-[#0a0a0a] border-r border-border/10
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-border/10">
          <Link
            href="/"
            className="font-bebas text-lg tracking-wide text-foreground hover:text-primary transition-colors"
          >
            APEX COACHING
          </Link>
          <p className="font-label text-[8px] uppercase tracking-[0.25em] text-muted-foreground/40 mt-1 flex items-center gap-1">
            <Zap size={8} />
            Coach Panel
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  font-label text-[10px] uppercase tracking-[0.15em]
                  transition-colors duration-150
                  ${active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6 pt-4 border-t border-border/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors border border-transparent"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}
