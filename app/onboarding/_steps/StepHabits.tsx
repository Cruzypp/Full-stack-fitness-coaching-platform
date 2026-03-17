"use client"

import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { OnboardingFormData, HabitFrequency } from "@/app/types/onboarding"

const HABIT_FREQ_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: "no", label: "No consumo" },
  { value: "ocasionalmente", label: "Ocasionalmente" },
  { value: "frecuentemente", label: "Frecuentemente" },
]

interface Props {
  control: Control<OnboardingFormData>
}

export function StepHabits({ control }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Hábitos</h2>
        <p className="text-sm text-foreground/50">Consumo de alcohol y tabaco</p>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Consumo de alcohol
        </Label>
        <Controller
          name="consumesAlcohol"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {HABIT_FREQ_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant="outline"
                  onClick={() => field.onChange(opt.value)}
                  className={cn(
                    "justify-start",
                    field.value === opt.value && "bg-primary/15 border-primary/40 text-primary"
                  )}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}
        />
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Consumo de tabaco
        </Label>
        <Controller
          name="consumesTobacco"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {HABIT_FREQ_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant="outline"
                  onClick={() => field.onChange(opt.value)}
                  className={cn(
                    "justify-start",
                    field.value === opt.value && "bg-primary/15 border-primary/40 text-primary"
                  )}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}
        />
      </div>
    </div>
  )
}
