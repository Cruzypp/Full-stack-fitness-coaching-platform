"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { type OnboardingFormData, type FrequencyItem } from "@/app/types/onboarding"
import { useOnboardingStore } from "@/app/store/useOnboardingStore"
import { useAuthStore } from "@/app/store/useAuthStore"
import {
  type StepKey,
  NUTRITION_STEPS,
  MINIMAL_STEPS,
  STEP_TRIGGER_FIELDS,
} from "./_config/steps"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronLeft, Loader2, Check } from "lucide-react"

import { StepWelcome } from "./_steps/StepWelcome"
import { StepGeneral } from "./_steps/StepGeneral"
import { StepMedication } from "./_steps/StepMedication"
import { StepSupplements } from "./_steps/StepSupplements"
import { StepHabits } from "./_steps/StepHabits"
import { StepConditions } from "./_steps/StepConditions"
import { StepFruitsVeg } from "./_steps/StepFruitsVeg"
import { StepCondimentsSugar } from "./_steps/StepCondimentsSugar"
import { StepFatsDrinks } from "./_steps/StepFatsDrinks"
import { StepFavorites } from "./_steps/StepFavorites"
import { StepMetrics } from "./_steps/StepMetrics"

// ─── Page ─────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { formData, currentStep, setFormData, setCurrentStep, reset } =
    useOnboardingStore()
  const { user } = useAuthStore()

  const {
    control,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    defaultValues: formData,
    mode: "onTouched",
  })

  const [stepError, setStepError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Sincroniza RHF → Zustand en cada cambio del formulario.
  // Esto preserva el progreso si el usuario navega fuera y regresa.
  useEffect(() => {
    const sub = watch((values) => setFormData(values as Partial<OnboardingFormData>))
    return () => sub.unsubscribe()
  }, [watch, setFormData])

  const wantsNutritionPlan = watch("wantsNutritionPlan")
  // El flujo de pasos cambia dinámicamente según la elección del usuario
  const allSteps: StepKey[] =
    wantsNutritionPlan === false ? MINIMAL_STEPS : NUTRITION_STEPS
  const totalSteps = allSteps.length
  // Clamp: evita índice fuera de rango si el usuario retrocede y cambia el plan
  const step = Math.min(currentStep, totalSteps - 1)
  const currentKey = allSteps[step]
  const progress = ((step + 1) / totalSteps) * 100

  /**
   * Validaciones que no pueden expresarse como reglas de campo en RHF,
   * como verificar que todos los ítems seleccionados tengan frecuencia asignada.
   * Devuelve un mensaje de error o null si todo está correcto.
   */
  const validateCustomStep = useCallback((): string | null => {
    const v = watch()
    const hasNoFreq = (items: FrequencyItem[]) => items.some((i) => !i.frequency)

    if (currentKey === "condiments-sugar") {
      if (hasNoFreq(v.condiments)) return "Indica la frecuencia de todos los condimentos seleccionados"
      if (hasNoFreq(v.sugar)) return "Indica la frecuencia de todos los azúcares seleccionados"
    }
    if (currentKey === "fats-drinks") {
      if (hasNoFreq(v.fat)) return "Indica la frecuencia de todas las grasas seleccionadas"
      if (hasNoFreq(v.drinks)) return "Indica la frecuencia de todas las bebidas seleccionadas"
    }
    if (currentKey === "metrics") {
      if (v.manualMetrics === null || v.manualMetrics === undefined)
        return "Selecciona cómo registrarás tus medidas"
      const empty = (x: unknown) => x === "" || x === null || x === undefined
      if (empty(v.height) || empty(v.weight))
        return "Ingresa al menos estatura y peso"
    }
    return null
  }, [watch, currentKey])

  /** Valida el paso actual y avanza al siguiente si todo es correcto. */
  const handleNext = async () => {
    setStepError(null)

    // Primero dispara las validaciones de RHF (reglas de campo)
    const fields = STEP_TRIGGER_FIELDS[currentKey]
    if (fields && fields.length > 0) {
      const valid = await trigger(fields as Parameters<typeof trigger>[0])
      if (!valid) return
    }

    // Luego ejecuta validaciones personalizadas que RHF no puede manejar
    const customError = validateCustomStep()
    if (customError) {
      setStepError(customError)
      return
    }

    if (step < totalSteps - 1) setCurrentStep(step + 1)
  }

  const handleBack = () => {
    setStepError(null)
    if (step > 0) setCurrentStep(step - 1)
  }

  /**
   * Maneja el envío final del formulario.
   * Si el usuario no quiere plan de nutrición, se eliminan los campos de alimentación
   * del payload antes de enviarlo, para no escribir datos vacíos en el sheet.
   */
  const onSubmit = async (data: OnboardingFormData) => {
    const customError = validateCustomStep()
    if (customError) {
      setStepError(customError)
      return
    }

    // Elimina campos de nutrición cuando el usuario solo quiere registrar medidas
    const payload: Partial<OnboardingFormData> = data.wantsNutritionPlan === false
      ? {
        wantsNutritionPlan: data.wantsNutritionPlan,
        manualMetrics: data.manualMetrics,
        height: data.height,
        weight: data.weight,
        // circumferences (manual only)
        waist: data.waist,
        hip: data.hip,
        arm: data.arm,
        wrist: data.wrist,
        kneeHeight: data.kneeHeight,
        calf: data.calf,
        // InBody composition (InBody only)
        imc: data.imc,
        fatPercentage: data.fatPercentage,
        musclePercentage: data.musclePercentage,
        viceralFatPercentage: data.viceralFatPercentage,
        bodyWaterPercentage: data.bodyWaterPercentage,
        boneMass: data.boneMass,
      }
      : data

    setSubmitting(true)
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, userId: user?.id }),
      })
      if (!res.ok) throw new Error("Sheets error")
      setSubmitted(true)
    } catch {
      setStepError("Ocurrió un error al guardar tu información. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen noise-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Check size={36} className="text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="font-bebas text-4xl tracking-tight">¡Listo!</h1>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Tu información fue guardada correctamente.{" "}
              {wantsNutritionPlan
                ? "En breve nos pondremos en contacto para comenzar tu plan personalizado."
                : "Tus medidas han sido registradas exitosamente."}
            </p>
          </div>
          <div className="border-t border-border/20" />
          <Button
            className="w-full"
            onClick={() => { reset(); router.replace("/") }}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen noise-bg flex items-start justify-center pt-4 pb-12 px-3 sm:pt-8 sm:px-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-6 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground/60">
            <span>Paso {step + 1} de {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-2xl border border-border/20 bg-card/40 backdrop-blur-sm p-4 sm:p-6">

            {/* ── Step content ── */}
            {currentKey === "plan" && (
              <StepWelcome control={control} errors={errors} />
            )}
            {currentKey === "general" && (
              <StepGeneral control={control} />
            )}
            {currentKey === "medication" && (
              <StepMedication control={control} watch={watch} errors={errors} />
            )}
            {currentKey === "supplements" && (
              <StepSupplements control={control} watch={watch} errors={errors} />
            )}
            {currentKey === "habits" && (
              <StepHabits control={control} />
            )}
            {currentKey === "conditions" && (
              <StepConditions control={control} watch={watch} errors={errors} />
            )}
            {currentKey === "fruits-veg" && (
              <StepFruitsVeg control={control} watch={watch} errors={errors} />
            )}
            {currentKey === "condiments-sugar" && (
              <StepCondimentsSugar control={control} stepError={stepError ?? undefined} />
            )}
            {currentKey === "fats-drinks" && (
              <StepFatsDrinks control={control} stepError={stepError ?? undefined} />
            )}
            {currentKey === "favorites" && (
              <StepFavorites control={control} watch={watch} errors={errors} />
            )}
            {currentKey === "metrics" && (
              <StepMetrics
                control={control}
                watch={watch}
                setValue={setValue}
                errors={errors}
              />
            )}

            {/* Step-level error (for steps that don't show it themselves) */}
            {stepError &&
              currentKey !== "condiments-sugar" &&
              currentKey !== "fats-drinks" && (
                <p className="mt-4 text-xs text-destructive">{stepError}</p>
              )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className={cn("gap-1.5", step === 0 && "invisible")}
            >
              <ChevronLeft size={16} />
              Atrás
            </Button>

            {step < totalSteps - 1 ? (
              <Button type="button" onClick={handleNext} className="gap-1.5">
                Siguiente
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button type="submit" disabled={submitting} className="gap-1.5">
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Finalizar
                    <Check size={16} />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
