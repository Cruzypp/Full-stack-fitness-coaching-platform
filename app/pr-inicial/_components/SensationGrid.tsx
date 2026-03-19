'use client';

const SENSATIONS = [
  'Muy cómodo',
  'Controlado',
  'Técnicamente limpio',
  'Pesado pero logrado',
  'Al límite',
];

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function SensationGrid({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {SENSATIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
            value === s
              ? 'bg-primary/15 border-primary/40 text-primary font-semibold'
              : 'bg-secondary/20 border-border/20 text-foreground/70 hover:border-border/40'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
