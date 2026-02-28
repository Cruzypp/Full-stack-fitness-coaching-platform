"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPromotion } from "../../lib/connection";
import { supabase } from "../../lib/connection";
import { createStripeCoupon } from "../../actions/promo";

const AdminPromosPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    discountPercent: "",
    durationHours: "",
    startsAt: "",
  });

  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stripe')
      .then(res => res.json())
      .then(data => {
        if (data.prices) setPrices(data.prices);
      })
      .catch(console.error);
  }, []);

  const stripePriceAmount = prices.length > 0 && prices[0].unit_amount
    ? prices[0].unit_amount / 100
    : 500; // Default fallback

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Save to database (Supabase)
      await createPromotion({
        code: formData.code,
        title: formData.title,
        originalPrice: stripePriceAmount,
        discountPercent: Number(formData.discountPercent),
        durationHours: Number(formData.durationHours),
        startsAt: new Date(formData.startsAt),
      });

      // 2. Generate same coupon in Stripe 
      const stripeRes = await createStripeCoupon({
        code: formData.code,
        discountPercent: Number(formData.discountPercent),
        name: formData.title,
        duration: 'once'
      });

      if (!stripeRes.success) {
        // Optionally warn the user that db succeeded but stripe failed
        console.error("Stripe Error:", stripeRes.error);
        setError(`Promo creada en BD, pero falló en Stripe: ${stripeRes.error}`);
        return;
      }

      setSuccess("¡Promoción creada con éxito en la BD y en Stripe!");
      setFormData({
        code: "",
        title: "",
        discountPercent: "",
        durationHours: "",
        startsAt: "",
      });
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear la promoción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen noise-bg relative flex flex-col">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-5 border-b border-border/10 gap-4 md:gap-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-bebas text-xl md:text-2xl tracking-wide text-foreground">THE ON3 PERC3NT</span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <span className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-primary">
            Promociones
          </span>
          <Link href="/admin/dashboard" className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="font-label text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors ml-2 md:ml-0"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10">

        {/* Header Text */}
        <section className="text-center fade-up mb-8">
          <h1 className="font-bebas text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-tight">
            NUEVA <span className="text-shimmer">PROMOCIÓN</span>
          </h1>
          <p className="mt-4 font-body text-foreground/50 max-w-sm mx-auto text-sm md:text-base leading-relaxed">
            Crea un nuevo código de descuento para tus clientes.
          </p>
        </section>

        {/* Form Card */}
        <section className="w-full fade-up max-w-2xl mx-auto" style={{ animationDelay: "0.1s" }}>
          <div className="glass-card rounded-2xl p-6 md:p-10 border border-border/20 focus-within:border-primary/30 hover:border-primary/20 transition-colors duration-500">

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-body text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                    Código
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    placeholder="EJ: VERANO20"
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30 uppercase"
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                    Título
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Promo de Verano"
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>

                {/* Original Price */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                    Precio Regular Detectado ($)
                  </label>
                  <div className="w-full px-4 py-3 bg-secondary/10 border border-border/30 rounded-xl font-body text-foreground/50 cursor-not-allowed">
                    {stripePriceAmount}
                  </div>
                </div>

                {/* Discount Factor / Percent */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                    % de Descuento
                  </label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    step="1"
                    placeholder="10, 20, etc"
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>

                {/* Duration Hours */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                    Duración (Horas)
                  </label>
                  <input
                    type="number"
                    name="durationHours"
                    value={formData.durationHours}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="24"
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30"
                  />
                </div>

                {/* Starts At */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30 [color-scheme:dark]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                {loading ? "CREANDO..." : "CREAR PROMOCIÓN"}
              </button>
            </form>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 text-center mt-auto">
        <span className="font-label text-[10px] uppercase tracking-[0.15em] text-muted-foreground/40">
          © 2026 ON3 PERC3NT
        </span>
      </footer>
    </div>
  );
};

export default AdminPromosPage;
