"use client"

import { Controller } from "react-hook-form"
import type { Control, UseFormWatch, FieldErrors } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { favoriteFoodOptions } from "@/app/lib/onboarding.options"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { SelectionGrid } from "../_components/SelectionGrid"
import { ErrorMsg } from "../_components/ErrorMsg"

interface Props {
  control: Control<OnboardingFormData>
  watch: UseFormWatch<OnboardingFormData>
  errors: FieldErrors<OnboardingFormData>
}

export function StepFavorites({ control, watch, errors }: Props) {
  const favoriteFoods = watch("favoriteFoods")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Alimentos Favoritos</h2>
        <p className="text-sm text-foreground/50">
          Selecciona los alimentos que más consumes y disfrutas (mínimo 3)
        </p>
      </div>

      {/* ── ALIMENTOS QUE LE GUSTAN ───────────────────── */}
      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Alimentos que te gustan
        </Label>
        <Controller
          name="favoriteFoods"
          control={control}
          rules={{ validate: (v) => (v && v.length >= 3) || "Selecciona al menos 3 opciones" }}
          render={({ field }) => (
            <>
              <SelectionGrid options={favoriteFoodOptions} selected={field.value ?? []} onChange={field.onChange} />
              <ErrorMsg msg={errors.favoriteFoods?.message} />
            </>
          )}
        />
        {favoriteFoods?.includes("Otro") && (
          <Controller
            name="otherFavoriteFoods"
            control={control}
            rules={{ validate: (v) => (v && v.trim().length > 0) || "Especifica el alimento" }}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label">
                  Otro alimento favorito
                </Label>
                <Input
                  placeholder="Ej. Granola, kéfir, edamame..."
                  {...field}
                  className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground"
                />
                <ErrorMsg msg={errors.otherFavoriteFoods?.message} />
              </div>
            )}
          />
        )}
      </div>

      {/* ── ALIMENTOS QUE NO LE GUSTAN ────────────────── */}
      <div className="space-y-4">
        <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
          Alimentos que NO te gustan
        </Label>
        <p className="text-sm text-foreground/50 -mt-2">
          Escribe los alimentos que prefieres evitar
        </p>
        <Controller
          name="noFavoriteFoods"
          control={control}
          render={({ field }) => (
            <Textarea
              placeholder="Ej. Hígado, mariscos, brócoli, pimientos..."
              rows={3}
              {...field}
              className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground resize-none"
            />
          )}
        />
      </div>
    </div>
  )
}
