'use client';

import { ReactNode } from "react";

const PERCENTAGES = [50, 60, 70, 75, 80, 85, 90, 95, 100];

interface ExerciseCardProps {
  name: string;
  category: string;
  maxWeight: number;
  icon: ReactNode;
}

const ExerciseCard = ({ name, category, maxWeight, icon }: ExerciseCardProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
            {icon}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{name}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">{maxWeight} kg</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">1RM</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {PERCENTAGES.map((pct) => {
          const weight = Math.round(maxWeight * (pct / 100));
          return (
            <div key={pct} className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-foreground w-14 text-right">
                {weight} kg
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseCard;
