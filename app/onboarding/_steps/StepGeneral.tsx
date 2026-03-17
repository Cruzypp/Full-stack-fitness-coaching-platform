"use client"

import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { SliderField } from "../_components/SliderField"

interface Props {
  control: Control<OnboardingFormData>
}

export function StepGeneral({ control }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Hábitos Generales</h2>
        <p className="text-sm text-foreground/50">Cuéntanos sobre tu rutina diaria</p>
      </div>

      <div className="space-y-8">
        <Controller
          name="consumedWater"
          control={control}
          render={({ field }) => (
            <SliderField
              label="¿Cuántos litros de agua tomas al día?"
              value={field.value}
              onChange={field.onChange}
              min={0.5}
              max={5}
              step={0.5}
              formatValue={(v) => `${v}L`}
            />
          )}
        />
        <Controller
          name="restHours"
          control={control}
          render={({ field }) => (
            <SliderField
              label="¿Cuántas horas duermes al día?"
              value={field.value}
              onChange={field.onChange}
              min={3}
              max={12}
              step={0.5}
              formatValue={(v) => `${v}h`}
            />
          )}
        />
        <Controller
          name="mealTimes"
          control={control}
          render={({ field }) => (
            <SliderField
              label="¿Cuántas veces comes al día?"
              value={field.value}
              onChange={field.onChange}
              min={1}
              max={8}
              step={1}
              formatValue={(v) => `${v} ${v === 1 ? "vez" : "veces"}`}
            />
          )}
        />
      </div>
    </div>
  )
}
