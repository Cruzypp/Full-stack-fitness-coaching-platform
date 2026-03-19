'use client';

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import type { PRFormData } from '../page';

interface Props {
  register: UseFormRegister<PRFormData>;
  watch: UseFormWatch<PRFormData>;
  setValue: UseFormSetValue<PRFormData>;
  errors: FieldErrors<PRFormData>;
  exercise: {
    title: string;
    day: string;
    category: string;
    weightField: keyof PRFormData;
    sensationField: keyof PRFormData;
    repsField?: keyof PRFormData;
    repsLabel?: string;
  };
}

export default function StepExercise({ register, watch, setValue, errors, exercise }: Props) {
  const sensationValue = (watch(exercise.sensationField) as string) || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-label">
          {exercise.day} · {exercise.category}
        </p>
        <h2 className="font-bebas text-3xl tracking-tight">{exercise.title}</h2>
        <p className="text-xs text-foreground/50">
          Registra el peso máximo que lograste con técnica limpia.
        </p>
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-label">
          Peso (kg)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder="0"
            {...register(exercise.weightField, {
              required: 'Ingresa el peso',
              min: { value: 1, message: 'El peso debe ser mayor a 0' },
            })}
            className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors"
          />
          <span className="text-sm text-muted-foreground font-label shrink-0">kg</span>
        </div>
        {errors[exercise.weightField] && (
          <p className="text-xs text-destructive">{errors[exercise.weightField]?.message as string}</p>
        )}
      </div>

      {/* Reps (solo para Pull) */}
      {exercise.repsField && (
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-label">
            {exercise.repsLabel || 'Reps completadas'}
          </label>
          <input
            type="number"
            min="1"
            max="20"
            placeholder="5"
            {...register(exercise.repsField, {
              required: 'Ingresa las repeticiones',
              min: { value: 1, message: 'Mínimo 1 rep' },
            })}
            className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors"
          />
          {errors[exercise.repsField] && (
            <p className="text-xs text-destructive">{errors[exercise.repsField]?.message as string}</p>
          )}
        </div>
      )}

      {/* Sensation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-label">
            ¿Cómo se sintió?
          </label>
          <span className="text-[10px] text-muted-foreground">
            {(sensationValue?.length || 0)}/200
          </span>
        </div>
        <textarea
          maxLength={200}
          rows={3}
          placeholder="Describe cómo se sintió el ejercicio..."
          {...register(exercise.sensationField, {
            required: 'Describe cómo se sintió',
            maxLength: { value: 200, message: 'Máximo 200 caracteres' },
          })}
          className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none placeholder:text-muted-foreground/40"
        />
        {errors[exercise.sensationField] && (
          <p className="text-xs text-destructive">{errors[exercise.sensationField]?.message as string}</p>
        )}
      </div>
    </div>
  );
}
