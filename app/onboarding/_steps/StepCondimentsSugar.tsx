"use client"

import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { condimentOptions, sugarOptions } from "@/app/lib/onboarding.options"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { FrequencyGrid } from "../_components/FrequencyGrid"
import { ErrorMsg } from "../_components/ErrorMsg"

interface Props {
  control: Control<OnboardingFormData>
  stepError?: string
}

export function StepCondimentsSugar({ control, stepError }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Condimentos y Azúcares</h2>
        <p className="text-sm text-foreground/50">Selecciona los que consumes e indica la frecuencia</p>
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Condimentos / sales / aceites
        </Label>
        <Controller
          name="condiments"
          control={control}
          render={({ field }) => (
            <FrequencyGrid options={condimentOptions} value={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Azúcares y endulzantes
        </Label>
        <Controller
          name="sugar"
          control={control}
          render={({ field }) => (
            <FrequencyGrid options={sugarOptions} value={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </div>

      {stepError && <ErrorMsg msg={stepError} />}
    </div>
  )
}
