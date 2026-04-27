import type { ReactNode } from "react"
import AdminSidebar from "./_components/AdminSidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen noise-bg relative">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <AdminSidebar />

      {/* Page content */}
      <div className="md:ml-60 min-h-screen flex flex-col relative z-10">
        {children}
        <footer className="border-t border-border/10 py-5 text-center mt-auto">
          <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/30">
            © 2026 ON3 P3RCENT
          </span>
        </footer>
      </div>
    </div>
  )
}
