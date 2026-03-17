"use client"

import { Controller } from "react-hook-form"
import type { Control, FieldErrors, UseFormWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { fruitOptions, vegetableOptions } from "@/app/lib/onboarding.options"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { SelectionGrid } from "../_components/SelectionGrid"
import { ErrorMsg } from "../_components/ErrorMsg"

const FREQ_OPTIONS: { value: string; label: string }[] = [
  { value: "1-2_week", label: "1-2 veces" },
  { value: "3-4_week", label: "3-4 veces" },
  { value: "5-6_week", label: "5-6 veces" },
  { value: "daily",    label: "Diario" },
]

interface Props {
  control: Control<OnboardingFormData>
  watch: UseFormWatch<OnboardingFormData>
  errors: FieldErrors<OnboardingFormData>
}

function FrequencyRow({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FREQ_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="xs"
          variant={value === opt.value ? "default" : "outline"}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}

export function StepFruitsVeg({ control, watch, errors }: Props) {
  const fruits = watch("fruits")
  const vegetables = watch("vegetables")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Frutas y Verduras</h2>
        <p className="text-sm text-foreground/50">¿Qué consumes regularmente? (mínimo 2 de cada una)</p>
      </div>

      {/* ── FRUTAS ─────────────────────────────────── */}
      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Frutas que consumes
        </Label>
        <Controller
          name="fruits"
          control={control}
          rules={{ validate: (v) => (v && v.length >= 2) || "Selecciona al menos 2 frutas" }}
          render={({ field }) => (
            <>
              <SelectionGrid options={fruitOptions} selected={field.value ?? []} onChange={field.onChange} />
              <ErrorMsg msg={errors.fruits?.message} />
            </>
          )}
        />

        <div className="space-y-1.5 pt-1">
          <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label block">
            Frecuencia por semana
          </Label>
          <Controller
            name="fruitsFrequency"
            control={control}
            rules={{ validate: (v) => !!v || "Indica la frecuencia de consumo" }}
            render={({ field }) => (
              <>
                <FrequencyRow value={field.value} onChange={field.onChange} />
                <ErrorMsg msg={errors.fruitsFrequency?.message} />
              </>
            )}
          />
        </div>

        {fruits?.includes("Otro") && (
          <Controller
            name="otherFruits"
            control={control}
            rules={{ validate: (v) => (v && v.trim().length > 0) || "Especifica la fruta" }}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label">
                  Otra fruta
                </Label>
                <Input
                  placeholder="Ej. Guanábana, maracuyá..."
                  {...field}
                  className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground"
                />
                <ErrorMsg msg={errors.otherFruits?.message} />
              </div>
            )}
          />
        )}
      </div>

      {/* ── VERDURAS ───────────────────────────────── */}
      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Verduras que consumes
        </Label>
        <Controller
          name="vegetables"
          control={control}
          rules={{ validate: (v) => (v && v.length >= 2) || "Selecciona al menos 2 verduras" }}
          render={({ field }) => (
            <>
              <SelectionGrid options={vegetableOptions} selected={field.value ?? []} onChange={field.onChange} />
              <ErrorMsg msg={errors.vegetables?.message} />
            </>
          )}
        />

        <div className="space-y-1.5 pt-1">
          <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label block">
            Frecuencia por semana
          </Label>
          <Controller
            name="vegetablesFrequency"
            control={control}
            rules={{ validate: (v) => !!v || "Indica la frecuencia de consumo" }}
            render={({ field }) => (
              <>
                <FrequencyRow value={field.value} onChange={field.onChange} />
                <ErrorMsg msg={errors.vegetablesFrequency?.message} />
              </>
            )}
          />
        </div>

        {vegetables?.includes("Otro") && (
          <Controller
            name="otherVegetables"
            control={control}
            rules={{ validate: (v) => (v && v.trim().length > 0) || "Especifica la verdura" }}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label">
                  Otra verdura
                </Label>
                <Input
                  placeholder="Ej. Nopal, chayote..."
                  {...field}
                  className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground"
                />
                <ErrorMsg msg={errors.otherVegetables?.message} />
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}
