"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/connection";

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  payment_date?: string; // We'll add this if you're tracking successful payments somewhere
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all student profiles
      // Ideally you'd want to also fetch their payment status from Stripe or another table.
      // For now, we fetch from the public.profiles table.
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-5 border-b border-border/10 gap-4 md:gap-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-bebas text-xl md:text-2xl tracking-wide text-foreground">THE ON3 P3RCENT</span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link href="/admin/promos" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
            Promociones
          </Link>
          <span className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-primary">
            Dashboard
          </span>
          <Link href="/admin/vidas" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
            Vidas
          </Link>
          <button
            onClick={handleLogout}
            className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors ml-2 md:ml-0"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col px-6 md:px-12 py-10 max-w-7xl mx-auto w-full">
        <header className="mb-10 fade-up">
          <h1 className="font-bebas text-4xl md:text-5xl tracking-tight">
            ESTUDIANTES <span className="text-shimmer">REGISTRADOS</span>
          </h1>
          <p className="mt-2 font-body text-muted-foreground">
            Revisa la lista de usuarios, sus datos de contacto y fechas de pago.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body">
            {error}
          </div>
        )}

        <section className="w-full fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-2xl border border-border/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-border/20 bg-secondary/10">
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Nombre</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Email</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Teléfono</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Fecha de Alta</th>
                    <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/50">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground/50">
                        No hay usuarios registrados aún.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {user.phone || '—'}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {user.payment_date ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-wider font-label">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {new Date(user.payment_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] uppercase tracking-wider font-label">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          © 2026 ON3 P3RCENT
        </span>
      </footer>
    </div>
  );
}
