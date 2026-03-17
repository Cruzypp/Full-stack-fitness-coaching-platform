"use client"

import { Controller } from "react-hook-form"
import type { Control, FieldErrors } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Weight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { ErrorMsg } from "../_components/ErrorMsg"

interface Props {
  control: Control<OnboardingFormData>
  errors: FieldErrors<OnboardingFormData>
}

export function StepWelcome({ control, errors }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Weight size={30} className="text-primary" />
        </div>
        <h1 className="font-bebas text-3xl tracking-tight">Registro Físico y Nutricional</h1>
        <p className="font-body text-sm text-foreground/60 leading-relaxed max-w-md mx-auto">
          Este formulario recopila tu información para la evaluación física inicial y, en caso de
          aplicar, la elaboración de tu plan nutricional personalizado. Responde con honestidad.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Label className="font-body text-sm font-medium text-foreground/70">
          ¿Incluirás un plan de nutrición? <span className="text-primary">*</span>
        </Label>
        <Controller
          name="wantsNutritionPlan"
          control={control}
          rules={{ validate: (v) => v !== null || "Selecciona una opción" }}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => field.onChange(true)}
                className={cn(
                  "h-auto px-4 py-3 flex flex-col items-start text-left gap-0.5 w-full whitespace-normal",
                  field.value === true && "bg-primary/15 border-primary/40 text-primary"
                )}
              >
                <span className="font-medium text-sm">Con plan de nutrición</span>
                <span className="text-xs text-foreground/50 font-normal leading-snug">
                  Hábitos, medicamentos, alimentación y medidas completas
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => field.onChange(false)}
                className={cn(
                  "h-auto px-4 py-3 flex flex-col items-start text-left gap-0.5 w-full whitespace-normal",
                  field.value === false && "bg-primary/15 border-primary/40 text-primary"
                )}
              >
                <span className="font-medium text-sm">Sin plan de nutrición</span>
                <span className="text-xs text-foreground/50 font-normal leading-snug">
                  Solo registro de medidas físicas (InBody o manual)
                </span>
              </Button>
            </div>
          )}
        />
        <ErrorMsg msg={errors.wantsNutritionPlan?.message} />
      </div>
    </div>
  )
}
