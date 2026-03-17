"use client"

import { Controller } from "react-hook-form"
import type { Control, UseFormWatch, FieldErrors } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { supplementOptions } from "@/app/lib/onboarding.options"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { SelectionGrid } from "../_components/SelectionGrid"
import { ErrorMsg } from "../_components/ErrorMsg"

interface Props {
  control: Control<OnboardingFormData>
  watch: UseFormWatch<OnboardingFormData>
  errors: FieldErrors<OnboardingFormData>
}

export function StepSupplements({ control, watch, errors }: Props) {
  const takesSupplements = watch("takesSupplements")
  const takesSumplements = watch("takesSumplements")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Suplementos</h2>
        <p className="text-sm text-foreground/50">Información sobre los suplementos que consumes</p>
      </div>

      <div className="space-y-3">
        <Label className="font-body text-sm font-medium text-foreground/70">
          ¿Consumes algún suplemento actualmente? <span className="text-primary">*</span>
        </Label>
        <Controller
          name="takesSupplements"
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
        <ErrorMsg msg={errors.takesSupplements?.message} />
      </div>

      {takesSupplements === true && (
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
            Selecciona los suplementos que tomas
          </Label>
          <Controller
            name="takesSumplements"
            control={control}
            rules={{ validate: (v) => (v && v.length > 0) || "Selecciona al menos un suplemento" }}
            render={({ field }) => (
              <>
                <SelectionGrid
                  options={supplementOptions}
                  selected={field.value ?? []}
                  onChange={field.onChange}
                />
                <ErrorMsg msg={errors.takesSumplements?.message} />
              </>
            )}
          />
          {takesSumplements?.includes("Otro") && (
            <Controller
              name="otherSuplement"
              control={control}
              rules={{ validate: (v) => (v && v.trim().split(/\s+/).length >= 1 && v.trim().length > 0) || "Ingresa el suplemento" }}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label">
                    Otro suplemento
                  </Label>
                  <Input
                    placeholder="Especifica el suplemento..."
                    {...field}
                    className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground"
                  />
                  <ErrorMsg msg={errors.otherSuplement?.message} />
                </div>
              )}
            />
          )}
        </div>
      )}
    </div>
  )
}
