

interface PricingCardProps {
  title: string;
  price: string;
  originalPrice?: string;
  features: string[];
  highlighted?: boolean;
  onSelect: () => void;
}

const PricingCard = ({ title, price, originalPrice, features, highlighted, onSelect }: PricingCardProps) => (
  <div
    className={`glass-card rounded-2xl p-8 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
      highlighted ? "glow-gold border-primary/40" : "hover:border-primary/20"
    }`}
  >
    {highlighted && (
      <span className="text-xs font-display uppercase tracking-[0.2em] text-primary mb-4">
        Más popular
      </span>
    )}
    <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
    <div className="mt-4 flex items-baseline gap-2">
      <span className="font-display text-4xl font-bold text-gradient-gold">{price}</span>
      {originalPrice && (
        <span className="text-muted-foreground line-through text-lg">{originalPrice}</span>
      )}
    </div>
    <ul className="mt-6 space-y-3 flex-1">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-secondary-foreground text-sm">
          {f}
        </li>
      ))}
    </ul>
    <button
      onClick={onSelect}
      className={`mt-8 w-full rounded-xl py-3 font-display font-semibold text-sm tracking-wide transition-all duration-200 ${
        highlighted
          ? "bg-primary text-primary-foreground glow-gold-sm hover:brightness-110"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
      }`}
    >
      Registrarme ahora
    </button>
  </div>
);

export default PricingCard;
