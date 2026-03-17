"use client"

import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { fatOptions, drinkOptions } from "@/app/lib/onboarding.options"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { FrequencyGrid } from "../_components/FrequencyGrid"
import { ErrorMsg } from "../_components/ErrorMsg"

interface Props {
  control: Control<OnboardingFormData>
  stepError?: string
}

export function StepFatsDrinks({ control, stepError }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Grasas y Bebidas</h2>
        <p className="text-sm text-foreground/50">Selecciona los que consumes e indica la frecuencia</p>
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Grasas y aceites
        </Label>
        <Controller
          name="fat"
          control={control}
          render={({ field }) => (
            <FrequencyGrid options={fatOptions} value={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Bebidas
        </Label>
        <Controller
          name="drinks"
          control={control}
          render={({ field }) => (
            <FrequencyGrid options={drinkOptions} value={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>

      {stepError && <ErrorMsg msg={stepError} />}
    </div>
  )
}
