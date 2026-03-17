"use client"

import { Controller } from "react-hook-form"
import type { Control, UseFormWatch, FieldErrors } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { conditionOptions, symptomOptions } from "@/app/lib/onboarding.options"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { SelectionGrid } from "../_components/SelectionGrid"
import { ErrorMsg } from "../_components/ErrorMsg"

interface Props {
  control: Control<OnboardingFormData>
  watch: UseFormWatch<OnboardingFormData>
  errors: FieldErrors<OnboardingFormData>
}

export function StepConditions({ control, watch, errors }: Props) {
  const conditions = watch("conditions")
  const symptoms = watch("symptoms")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Condiciones y Síntomas</h2>
        <p className="text-sm text-foreground/50">Condiciones médicas y síntomas actuales</p>
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Condiciones médicas
        </Label>
        <Controller
          name="conditions"
          control={control}
          rules={{ validate: (v) => (v && v.length > 0) || "Selecciona al menos una opción" }}
          render={({ field }) => (
            <>
              <SelectionGrid
                options={conditionOptions}
                selected={field.value ?? []}
                onChange={field.onChange}
                exclusive="Ninguna"
              />
              <ErrorMsg msg={errors.conditions?.message} />
            </>
          )}
        />
        {conditions?.includes("Otro") && (
          <Controller
            name="otherConditions"
            control={control}
            rules={{ validate: (v) => (v && v.trim().length > 0) || "Especifica la condición" }}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label">
                  Otra condición
                </Label>
                <Input
                  placeholder="Describe la condición..."
                  {...field}
                  className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground"
                />
                <ErrorMsg msg={errors.otherConditions?.message} />
              </div>
            )}
          />
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Síntomas actuales
        </Label>
        <Controller
          name="symptoms"
          control={control}
          rules={{ validate: (v) => (v && v.length > 0) || "Selecciona al menos una opción" }}
          render={({ field }) => (
            <>
              <SelectionGrid
                options={symptomOptions}
                selected={field.value ?? []}
                onChange={field.onChange}
                exclusive="Ninguno"
              />
              <ErrorMsg msg={errors.symptoms?.message} />
            </>
          )}
        />
        {symptoms?.includes("Otro") && (
          <Controller
            name="otherSymptoms"
            control={control}
            rules={{ validate: (v) => (v && v.trim().length > 0) || "Especifica el síntoma" }}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label">
                  Otro síntoma
                </Label>
                <Input
                  placeholder="Describe el síntoma..."
                  {...field}
                  className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground"
                />
                <ErrorMsg msg={errors.otherSymptoms?.message} />
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}
