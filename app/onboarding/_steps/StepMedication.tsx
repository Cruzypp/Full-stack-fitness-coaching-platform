"use client"

import { Controller } from "react-hook-form"
import type { Control, UseFormWatch, FieldErrors } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { medicationOptions } from "@/app/lib/onboarding.options"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { SelectionGrid } from "../_components/SelectionGrid"
import { ErrorMsg } from "../_components/ErrorMsg"

interface Props {
  control: Control<OnboardingFormData>
  watch: UseFormWatch<OnboardingFormData>
  errors: FieldErrors<OnboardingFormData>
}

export function StepMedication({ control, watch, errors }: Props) {
  const takesMedication = watch("takesMedication")
  const medication = watch("medication")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Medicamentos</h2>
        <p className="text-sm text-foreground/50">Información sobre los medicamentos que consumes</p>
      </div>

      <div className="space-y-3">
        <Label className="font-body text-sm font-medium text-foreground/70">
          ¿Tomas algún medicamento actualmente? <span className="text-primary">*</span>
        </Label>
        <Controller
          name="takesMedication"
          control={control}
          rules={{ validate: (v) => v !== null || "Selecciona una opción" }}
          render={({ field }) => (
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => field.onChange(true)}
                className={cn("flex-1", field.value === true && "bg-primary/15 border-primary/40 text-primary")}
              >
                Sí
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => field.onChange(false)}
                className={cn("flex-1", field.value === false && "bg-primary/15 border-primary/40 text-primary")}
              >
                No
              </Button>
            </div>
          )}
        />
        <ErrorMsg msg={errors.takesMedication?.message} />
      </div>

      {takesMedication === true && (
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
            Selecciona los medicamentos que tomas
          </Label>
          <Controller
            name="medication"
            control={control}
            rules={{ validate: (v) => (v && v.length > 0) || "Selecciona al menos un medicamento" }}
            render={({ field }) => (
              <>
                <SelectionGrid
                  options={medicationOptions}
                  selected={field.value ?? []}
                  onChange={field.onChange}
                />
                <ErrorMsg msg={errors.medication?.message} />
              </>
            )}
          />
          {medication?.includes("Otro") && (
            <Controller
              name="otherMedication"
              control={control}
              rules={{ validate: (v) => (v && v.trim().length > 0) || "Ingresa el medicamento" }}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label">
                    Otro medicamento
                  </Label>
                  <Input
                    placeholder="Especifica el medicamento..."
                    {...field}
                    className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground"
                  />
                  <ErrorMsg msg={errors.otherMedication?.message} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </div>
  )
}
