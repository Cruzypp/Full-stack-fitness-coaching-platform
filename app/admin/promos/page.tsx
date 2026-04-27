"use client"
import { useState, useEffect } from "react";
import { createPromotion, supabase, getActiveStripePriceId, updateActiveStripePriceId } from "../../lib/connection";
import { createStripeCoupon } from "../../actions/promo";

const AdminPromosPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [promoUrl, setPromoUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    discountPercent: "",
    durationHours: "",
    startsAt: "",
    maxRedemptions: "",
  });

  const [prices, setPrices] = useState<any[]>([]);
  const [activePriceId, setActivePriceId] = useState<string>("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMsg, setPriceMsg] = useState("");

  useEffect(() => {
    let fetchedPrices: any[] = [];
    fetch('/api/stripe')
      .then(res => res.json())
      .then(data => {
        if (data.prices) {
          setPrices(data.prices);
          fetchedPrices = data.prices;
        }
        return getActiveStripePriceId();
      })
      .then(id => {
        if (id) {
          setActivePriceId(id);
        } else if (fetchedPrices.length > 0) {
          setActivePriceId(fetchedPrices[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const activePrice = prices.find(p => p.id === activePriceId) || prices[0];
  const stripePriceAmount = activePrice && activePrice.unit_amount
    ? activePrice.unit_amount / 100
    : 500;

  const handleSaveActivePrice = async () => {
    try {
      setSavingPrice(true);
      setPriceMsg("");
      await updateActiveStripePriceId(activePriceId);
      setPriceMsg("¡Producto activo actualizado!");
    } catch (err) {
      setPriceMsg("Error al actualizar el producto.");
      console.error(err);
    } finally {
      setSavingPrice(false);
      setTimeout(() => setPriceMsg(""), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const maxRed = formData.maxRedemptions ? Number(formData.maxRedemptions) : undefined;

      await createPromotion({
        code: formData.code,
        title: formData.title,
        originalPrice: stripePriceAmount,
        discountPercent: Number(formData.discountPercent),
        durationHours: Number(formData.durationHours),
        startsAt: new Date(formData.startsAt),
        maxRedemptions: maxRed,
      });

      const stripeRes = await createStripeCoupon({
        code: formData.code,
        discountPercent: Number(formData.discountPercent),
        name: formData.title,
        duration: 'once',
        maxRedemptions: maxRed,
      });

      if (!stripeRes.success) {
        console.error("Stripe Error:", stripeRes.error);
        setError(`Promo creada en BD, pero falló en Stripe: ${stripeRes.error}`);
        return;
      }

      setSuccess("¡Promoción creada con éxito en la BD y en Stripe!");
      const baseUrl = window.location.origin;
      setPromoUrl(`${baseUrl}/pricing?promo=${formData.code.toLowerCase()}`);
      setCopied(false);
      setFormData({ code: "", title: "", discountPercent: "", durationHours: "", startsAt: "", maxRedemptions: "" });
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear la promoción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-10">
      {/* Header */}
      <section className="text-center fade-up mb-8 w-full max-w-2xl">
        <h1 className="font-bebas text-[clamp(2.5rem,6vw,4rem)] leading-[0.95] tracking-tight">
          NUEVA <span className="text-shimmer">PROMOCIÓN</span>
        </h1>
        <p className="mt-4 font-body text-foreground/50 max-w-sm mx-auto text-sm md:text-base leading-relaxed">
          Crea un nuevo código de descuento para tus clientes.
        </p>
      </section>

      {/* Product Selector Card */}
      <section className="w-full fade-up mb-10 max-w-2xl mx-auto" style={{ animationDelay: "0.05s" }}>
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
          <h2 className="font-bebas text-2xl tracking-wide mb-2 text-foreground">PRODUCTO ACTIVO <span className="text-shimmer">EN VENTA</span></h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Selecciona qué producto de Stripe se mostrará en la página principal.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <select
              className="w-full sm:w-auto flex-1 px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground"
              value={activePriceId}
              onChange={(e) => setActivePriceId(e.target.value)}
            >
              {prices.length === 0 && <option value="">Cargando productos...</option>}
              {prices.map(price => (
                <option key={price.id} value={price.id}>
                  {price.product?.name || price.id} - ${price.unit_amount / 100} {price.currency.toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={handleSaveActivePrice}
              disabled={savingPrice || prices.length === 0}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)] active:translate-y-0 disabled:opacity-50 min-w-[180px]"
              style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            >
              {savingPrice ? "GUARDANDO..." : "GUARDAR CAMBIO"}
            </button>
          </div>
          {priceMsg && (
            <p className={`mt-4 font-body text-sm ${priceMsg.includes("Error") ? "text-destructive" : "text-primary"}`}>
              {priceMsg}
            </p>
          )}
        </div>
      </section>

      {/* Form Card */}
      <section className="w-full fade-up max-w-2xl mx-auto" style={{ animationDelay: "0.1s" }}>
        <div className="glass-card rounded-2xl p-6 md:p-10 border border-border/20 focus-within:border-primary/30 hover:border-primary/20 transition-colors duration-500">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-body text-center">{error}</div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-body text-center">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Código</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} required placeholder="EJ: VERANO20"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30 uppercase" />
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Título</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Promo de Verano"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Precio Regular Detectado ($)</label>
                <div className="w-full px-4 py-3 bg-secondary/10 border border-border/30 rounded-xl font-body text-foreground/50 cursor-not-allowed">{stripePriceAmount}</div>
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">% de Descuento</label>
                <input type="number" name="discountPercent" value={formData.discountPercent} onChange={handleChange} required min="0" max="100" step="1" placeholder="10, 20, etc"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Duración (Horas)</label>
                <input type="number" name="durationHours" value={formData.durationHours} onChange={handleChange} required min="1" placeholder="24"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">Fecha de Inicio</label>
                <input type="datetime-local" name="startsAt" value={formData.startsAt} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground [color-scheme:dark]" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="font-label text-xs uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  Máx. Usos <span className="normal-case tracking-normal font-body text-muted-foreground/50">(opcional)</span>
                </label>
                <input type="number" name="maxRedemptions" value={formData.maxRedemptions} onChange={handleChange} min="1" placeholder="Sin límite"
                  className="w-full px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-body text-foreground placeholder:text-muted-foreground/30" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
              style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            >
              {loading ? "CREANDO..." : "CREAR PROMOCIÓN"}
            </button>
          </form>
        </div>
      </section>

      {/* Promo URL */}
      {promoUrl && (
        <section className="w-full fade-up max-w-2xl mx-auto mt-8" style={{ animationDelay: '0.15s' }}>
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-primary/20 relative overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_40px_-10px_hsl(72_100%_64%/0.25)]">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />
            <h2 className="font-bebas text-2xl tracking-wide mb-2 text-foreground">LINK DE <span className="text-shimmer">PROMOCIÓN</span></h2>
            <p className="font-body text-sm text-muted-foreground mb-4">Comparte este enlace con tus clientes.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input type="text" readOnly value={promoUrl}
                className="w-full sm:flex-1 px-4 py-3 bg-secondary/30 border border-border/30 rounded-xl font-body text-xs sm:text-sm text-foreground/80 select-all cursor-text truncate"
                onClick={(e) => (e.target as HTMLInputElement).select()} />
              <button type="button"
                onClick={() => { navigator.clipboard.writeText(promoUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-label text-xs uppercase tracking-[0.15em] transition-all duration-200 min-w-[110px] ${copied
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_hsl(72_100%_64%/0.4)]'
                  }`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default AdminPromosPage;
